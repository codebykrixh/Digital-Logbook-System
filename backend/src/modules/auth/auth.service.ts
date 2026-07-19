import type { User } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import {
  hashPassword,
  verifyPassword,
  generateRawToken,
  hashToken,
} from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { parseDurationMs, futureDate } from '../../utils/time';
import { writeAudit } from '../../services/audit.service';
import {
  sendMail,
  verificationEmail,
  resetPasswordEmail,
} from '../../services/mailer';
import type { RegisterInput, LoginInput } from './auth.validation';

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  status: User['status'];
  emailVerified: boolean;
  avatarUrl: string | null;
  jobTitle: string | null;
  createdAt: Date;
}

export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
    createdAt: user.createdAt,
  };
}

/** Issue an access token + a persisted, rotatable refresh token. */
async function issueTokens(user: User, ctx: AuthContext) {
  const refreshMs = parseDurationMs(env.JWT_REFRESH_EXPIRES);
  const raw = generateRawToken();

  const record = await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(raw),
      userId: user.id,
      expiresAt: futureDate(refreshMs),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId: record.id });

  return { accessToken, refreshToken, refreshRaw: raw, refreshRecord: record };
}

export async function createEmailToken(
  userId: string,
  type: 'EMAIL_VERIFY' | 'PASSWORD_RESET',
  ttlMs: number
) {
  const raw = generateRawToken();
  await prisma.verificationToken.create({
    data: {
      tokenHash: hashToken(raw),
      type,
      userId,
      expiresAt: futureDate(ttlMs),
    },
  });
  return raw;
}

export const authService = {
  async register(input: RegisterInput, ctx: AuthContext) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const isFirstUser = (await prisma.user.count()) === 0;

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        // Bootstrap: the very first account becomes the ADMIN.
        role: isFirstUser ? 'ADMIN' : 'OPERATOR',
      },
    });

    const rawToken = await createEmailToken(
      user.id,
      'EMAIL_VERIFY',
      parseDurationMs('24h')
    );
    const link = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your DigiLog account',
      html: verificationEmail(user.firstName, link),
      text: `Verify your email: ${link}`,
    });

    const tokens = await issueTokens(user, ctx);
    await writeAudit({ actorId: user.id, action: 'CREATE', entityType: 'User', entityId: user.id, ipAddress: ctx.ipAddress });

    return { user: toSafeUser(user), ...tokens };
  },

  async login(input: LoginInput, ctx: AuthContext) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw ApiError.forbidden('This account is not active. Contact your administrator.');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await issueTokens(user, ctx);
    await writeAudit({ actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id, ipAddress: ctx.ipAddress });

    return { user: toSafeUser(user), ...tokens };
  },

  /** Rotate a refresh token: verify, revoke the old row, issue a new pair. */
  async refresh(refreshToken: string, ctx: AuthContext) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired session');
    }

    const record = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw ApiError.unauthorized('Session expired, please sign in again');
    }
    if (record.userId !== payload.sub) {
      throw ApiError.unauthorized('Session mismatch');
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) throw ApiError.unauthorized('Account no longer exists');

    // Revoke the used token (rotation) then issue a fresh pair.
    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await issueTokens(user, ctx);
    return { user: toSafeUser(user), ...tokens };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.tokenId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Nothing to revoke — treat as already logged out.
    }
  },

  async me(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return toSafeUser(user);
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always resolve the same way to avoid user enumeration.
    if (!user) return;

    const rawToken = await createEmailToken(
      user.id,
      'PASSWORD_RESET',
      parseDurationMs('1h')
    );
    const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your DigiLog password',
      html: resetPasswordEmail(user.firstName, link),
      text: `Reset your password: ${link}`,
    });
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });
    if (
      !record ||
      record.type !== 'PASSWORD_RESET' ||
      record.consumedAt ||
      record.expiresAt < new Date()
    ) {
      throw ApiError.badRequest('This reset link is invalid or has expired');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      // Invalidate all existing sessions on password change.
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },

  async verifyEmail(rawToken: string) {
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });
    if (
      !record ||
      record.type !== 'EMAIL_VERIFY' ||
      record.consumedAt ||
      record.expiresAt < new Date()
    ) {
      throw ApiError.badRequest('This verification link is invalid or has expired');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);
  },
};

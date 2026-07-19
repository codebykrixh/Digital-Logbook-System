import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Generate a cryptographically-random, URL-safe token (for email/reset links). */
export function generateRawToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** One-way hash used to store tokens at rest so a DB leak can't reuse them. */
export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { notifyUser } from '../modules/notifications/notifications.service';

interface AddCommentInput {
  authorId: string;
  body: string;
  mentionedUserIds?: string[];
  eventId?: string;
  incidentId?: string;
}

const authorSelect = {
  select: { id: true, firstName: true, lastName: true, jobTitle: true },
} as const;

/** Comments are shared between Events and Incidents via nullable FKs on one table. */
export const commentService = {
  async list(where: { eventId?: string; incidentId?: string }) {
    return prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { author: authorSelect },
    });
  },

  async add(input: AddCommentInput) {
    const mentions = [...new Set(input.mentionedUserIds ?? [])];

    const comment = await prisma.comment.create({
      data: {
        body: input.body,
        authorId: input.authorId,
        mentions,
        eventId: input.eventId,
        incidentId: input.incidentId,
      },
      include: { author: authorSelect },
    });

    const parentLabel = input.eventId ? 'event' : 'incident';
    const parentId = input.eventId ?? input.incidentId;
    await Promise.all(
      mentions
        .filter((userId) => userId !== input.authorId)
        .map((userId) =>
          notifyUser({
            userId,
            type: 'MENTION',
            title: `${comment.author.firstName} mentioned you`,
            body: input.body.slice(0, 140),
            link: `/${parentLabel === 'event' ? 'events' : 'incidents'}/${parentId}`,
          })
        )
    );

    return comment;
  },

  async remove(commentId: string, userId: string, role: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw ApiError.notFound('Comment not found');
    if (comment.authorId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own comments');
    }
    await prisma.comment.delete({ where: { id: commentId } });
  },
};

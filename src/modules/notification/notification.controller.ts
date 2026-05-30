import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import {
  parsePaginationQuery,
  decodeCursor,
  buildCursorWhere,
  buildCursorPaginatedResponse,
} from '@/utils/pagination';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { limit, cursor } = parsePaginationQuery(req.query);

    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const cursorWhere = buildCursorWhere(cursorPayload);

    const notifications = await prisma.notification.findMany({
      where: { AND: [{ userId }, cursorWhere] },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return res.status(200).json(
      buildCursorPaginatedResponse(notifications, limit, (item) => ({
        createdAt: item.createdAt,
        id: item.id,
      })),
    );
  } catch (error) {
    console.error('[NOTIFICATION-LIST-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('[NOTIFICATION-UNREAD-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    return res.status(200).json({ message: 'Notifikasi ditandai telah dibaca.' });
  } catch (error) {
    console.error('[NOTIFICATION-MARK-READ-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.status(200).json({ message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (error) {
    console.error('[NOTIFICATION-MARK-ALL-READ-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

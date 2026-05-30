import pusher from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

export function triggerUserEvent(userId: string, eventName: string, data: any) {
  pusher.trigger(`private-user-${userId}`, eventName, data);
}

export function triggerAdminEvent(eventName: string, data: any) {
  pusher.trigger('private-admin', eventName, data);
}

export async function pushNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: any,
) {
  const notif = await prisma.notification.create({
    data: { userId, title, message, read: false },
  });

  triggerUserEvent(userId, `notification.${type}`, {
    id: notif.id,
    title,
    message,
    type,
    createdAt: notif.createdAt,
    metadata,
  });

  return notif;
}

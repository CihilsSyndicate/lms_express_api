import pusher from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

export function triggerUserEvent(userId: string, eventName: string, data: any) {
  try {
    pusher.trigger(`private-user-${userId}`, eventName, data);
  } catch (err) {
    console.error('[WS-EMIT-ERROR] triggerUserEvent gagal:', err);
  }
}

export function triggerAdminEvent(eventName: string, data: any) {
  try {
    pusher.trigger('private-admin', eventName, data);
  } catch (err) {
    console.error('[WS-EMIT-ERROR] triggerAdminEvent gagal:', err);
  }
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

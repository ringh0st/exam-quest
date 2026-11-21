import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { fromIsoDate, type IsoDate } from '../features/exams/dates';
import { toMinutes, type TimeOfDay } from '../features/reminders/time';

/** Local notifications exist only on phones; the web preview skips them quietly. */
const supported = Platform.OS !== 'web';

/** Show reminders as banners even while the app is open. */
export function configureNotificationHandler(): void {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
  });
}

/** Asks for permission if needed. Resolves to whether reminders can be shown. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export interface LocalNotification {
  date: IsoDate;
  time: TimeOfDay;
  title: string;
  body: string;
}

export function toLocalDateTime(date: IsoDate, time: TimeOfDay): Date {
  const moment = fromIsoDate(date);
  const minutes = toMinutes(time);
  moment.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return moment;
}

/** Replaces every scheduled reminder with `notifications`. */
export async function replaceScheduledNotifications(
  notifications: readonly LocalNotification[],
): Promise<void> {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const notification of notifications) {
    await Notifications.scheduleNotificationAsync({
      content: { title: notification.title, body: notification.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: toLocalDateTime(notification.date, notification.time),
      },
    });
  }
}

export async function cancelScheduledNotifications(): Promise<void> {
  if (!supported) return;
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

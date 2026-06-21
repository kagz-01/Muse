/**
 * Notification System Dispatcher
 * 
 * Mock implementation to demonstrate routing of different notification events 
 * (Email, Push, In-App) based on the settings toggles.
 */

export type NotificationType = "reply" | "like" | "follow" | "achievement" | "system";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
}

/**
 * Dispatch an email notification.
 * In production, this would integrate with Resend or SendGrid.
 */
export async function dispatchEmail(payload: NotificationPayload) {
  console.log(`[MOCK EMAIL] To User: ${payload.userId}`);
  console.log(`Subject: ${payload.title}`);
  console.log(`Body: ${payload.body}`);
  return true;
}

/**
 * Dispatch a push notification.
 * In production, this would integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs).
 */
export async function dispatchPush(payload: NotificationPayload) {
  console.log(`[MOCK PUSH] To User: ${payload.userId} | ${payload.title}: ${payload.body}`);
  return true;
}

/**
 * Main dispatcher to route an event to the appropriate channels based on user preferences.
 */
export async function notifyUser(payload: NotificationPayload, userSettings: any) {
  const tasks = [];

  // If the user hasn't explicitly disabled in-app notifications
  if (userSettings?.inAppNotifications !== false) {
    console.log(`[IN-APP NOTIFICATION SAVED] For User: ${payload.userId}`);
    // In production: insert into a `notifications` DB table
  }

  // If the user has email notifications enabled
  if (userSettings?.emailNotifications === true) {
    tasks.push(dispatchEmail(payload));
  }

  // If the user has push notifications enabled
  if (userSettings?.pushNotifications === true) {
    tasks.push(dispatchPush(payload));
  }

  await Promise.all(tasks);
}

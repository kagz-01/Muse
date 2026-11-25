import { notificationSignal } from "../../signals/notifications.ts";
import NotificationToast from "./NotificationToast.tsx";

export default function NotificationContainer() {
  const { notifications } = notificationSignal.value;

  return (
    <div className="fixed bottom-32 md:bottom-28 right-4 z-50 space-y-3 max-w-sm pointer-events-auto">
      {notifications.map((notification) => (
        <div key={notification.id}>
          <NotificationToast notification={notification} />
        </div>
      ))}
    </div>
  );
}

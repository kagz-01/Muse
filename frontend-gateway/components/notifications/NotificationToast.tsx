import * as Icons from "lucide-preact";
import type { Notification } from "../../signals/notifications.ts";
import { removeNotification } from "../../signals/notifications.ts";

interface NotificationToastProps {
  notification: Notification;
}

const typeConfig = {
  circle_join: {
    icon: Icons.Users,
    color: "bg-purple-500",
    textColor: "text-purple-400",
  },
  follow: {
    icon: Icons.Heart,
    color: "bg-rose-500",
    textColor: "text-rose-400",
  },
  collaboration: {
    icon: Icons.Zap,
    color: "bg-amber-500",
    textColor: "text-amber-400",
  },
  mention: {
    icon: Icons.MessageSquare,
    color: "bg-blue-500",
    textColor: "text-blue-400",
  },
  achievement: {
    icon: Icons.Trophy,
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
};

export default function NotificationToast({
  notification,
}: NotificationToastProps) {
  const config = typeConfig[notification.type];
  const IconComponent = config.icon;

  return (
    <div
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-start gap-3 shadow-xl animate-in slide-in-from-right-4 fade-in duration-300"
      key={notification.id}
    >
      {notification.avatar ? (
        <img
          src={notification.avatar}
          alt="User"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`${config.color} p-2 rounded-lg flex-shrink-0`}>
          <IconComponent size={18} className="text-white" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{notification.title}</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {notification.message}
        </p>
      </div>

      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
      >
        <Icons.X size={16} />
      </button>
    </div>
  );
}

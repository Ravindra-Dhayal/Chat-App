import { useSettings } from "@/hooks/use-settings";
import { Bell, Trash2, MessageSquare, AlertCircle, Info } from "lucide-react";
import { Button } from "./ui/button";

const NotificationsPanel = () => {
  const { notifications, notificationsEnabled, setNotificationsEnabled, clearNotification, clearAllNotifications, markNotificationAsRead } = useSettings();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "update":
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case "system":
        return <Info className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Enable Notifications</span>
        </label>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-base-content/5 rounded-lg">
          <Bell className="w-12 h-12 text-base-content/30 mb-2" />
          <p className="text-base-content/70">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markNotificationAsRead(notification.id)}
              className={`p-4 rounded-lg border transition cursor-pointer ${
                notification.read
                  ? "border-base-content/10 bg-base-content/5"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm text-base-content/70 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notification.id);
                  }}
                  className="p-1 hover:bg-base-content/10 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {notifications.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={clearAllNotifications}
            >
              Clear All Notifications
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

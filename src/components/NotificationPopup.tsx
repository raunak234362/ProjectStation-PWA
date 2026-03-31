import { useState, useRef, useEffect } from "react";
import { X, Check, CheckCheck } from "lucide-react";
import { useNotificationStore } from "../hooks/useNotificationStore";
import Service from "../api/Service";
import { formatDistanceToNow } from "date-fns";

const NotificationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const handleNotificationClick = async (notification: any) => {
    await handleMarkAsRead(notification.id);
    
    const type = notification.type?.toUpperCase();
    const payload = notification.payload || {};
    
    // Determine the ID based on the notification type
    const id = payload.submittalId || 
               payload.rfiId || 
               payload.rfqId || 
               payload.milestoneId || 
               payload.taskId || 
               payload.projectId ||
               payload.changeOrderId ||
               payload.id;

    if (id) {
      let viewType: any = null;
      if (type === "SUBMITTAL") viewType = "SUBMITTAL";
      else if (type === "RFI") viewType = "RFI";
      else if (type === "RFQ") viewType = "RFQ";
      else if (type === "MILESTONE") viewType = "MILESTONE";
      else if (type === "PROJECT") viewType = "PROJECT";
      else if (type === "TASK") viewType = "TASK";
      else if (type === "CHANGE_ORDER") viewType = "CHANGE_ORDER";
      
      if (viewType) {
        openDetail(viewType, id, payload.projectId);
        setIsOpen(false);
      }
    }
  };

  const { notifications, unreadCount, markRead, markAllRead, openDetail } =
    useNotificationStore();

  return (
    <div className="relative" ref={popupRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all shadow-sm group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse transition-all"></span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-6xl mb-3">🔔</div>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notification.read
                        ? "bg-green-50/50 dark:bg-green-900/10"
                        : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="shrink-0 text-2xl">
                        {getNotificationIcon(notification.type || "general")}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {notification.payload?.title || "Notification"}
                          </h4>
                          {!notification.read && (
                            <span className="shrink-0 w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.payload?.message || "No message"}
                        </p>
                        {notification.payload?.projectName && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                            📁 {notification.payload.projectName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            >
                              <Check size={12} />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button className="w-full text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;

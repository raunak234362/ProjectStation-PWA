import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "../hooks/useNotificationStore";
import Service from "../api/Service";
import { formatDistanceToNow } from "date-fns";

const NotificationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"unread" | "read">("unread");
  const popupRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markRead, markAllRead, openDetail } =
    useNotificationStore();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await Service.MarkNotificationAsRead(id);
      markRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) => Service.MarkNotificationAsRead(n.id)),
      );
      markAllRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getInitial = (title?: string, type?: string) => {
    if (title && title.length > 0) return title.charAt(0).toUpperCase();
    if (type && type.length > 0) return type.charAt(0).toUpperCase();
    return "N";
  };

  const handleNotificationClick = async (notification: any) => {
    await handleMarkAsRead(notification.id);

    const type = notification.type;
    const t = type?.toUpperCase();
    const payload = notification.payload || {};

    const findId = (key: string) => notification[key] || payload[key];

    let targetId = null;
    if (t === "SUBMITTAL" || t === "SUBMITTALS") targetId = findId("submittalId") || findId("submittal_id") || findId("submittalId");
    else if (t === "RFI") targetId = findId("rfiId") || findId("rfi_id");
    else if (t === "RFQ") targetId = findId("rfqId") || findId("rfq_id");
    else if (t === "MILESTONE") targetId = findId("milestoneId") || findId("milestone_id");
    else if (t === "PROJECT") targetId = findId("projectId") || findId("project_id");
    else if (t === "TASK") targetId = findId("taskId") || findId("task_id");
    else if (t === "CHANGE_ORDER" || t === "CO") targetId = findId("changeOrderId") || findId("change_order_id");

    const anyId = targetId || payload.id || findId("id");

    if (anyId) {
      let viewType: any = null;
      if (t === "SUBMITTAL" || t === "SUBMITTALS") viewType = "SUBMITTAL";
      else if (t === "RFI") viewType = "RFI";
      else if (t === "RFQ") viewType = "RFQ";
      else if (t === "MILESTONE") viewType = "MILESTONE";
      else if (t === "PROJECT") viewType = "PROJECT";
      else if (t === "TASK") viewType = "TASK";
      else if (t === "CHANGE_ORDER" || t === "CO") viewType = "CHANGE_ORDER";

      if (viewType) {
        const projId = findId("projectId") || findId("project_id");
        openDetail(viewType, anyId, projId);
        setIsOpen(false);
      }
    }
  };

  const filteredNotifications = notifications.filter(n => filter === "unread" ? !n.read : n.read);
  const readCount = notifications.length - unreadCount;

  return (
    <div className="relative" ref={popupRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all shadow-sm group"
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
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse transition-all" style={{ borderRadius: '9999px' }}></span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] max-h-[600px] bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-100">
              <button
                onClick={() => setFilter("unread")}
                className={`pb-3 font-semibold text-sm relative flex items-center gap-2 ${
                  filter === "unread" ? "text-gray-900 border-b-2 border-green-500" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Unread
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === "unread" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {unreadCount}
                </span>
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`pb-3 font-semibold text-sm relative flex items-center gap-2 ${
                  filter === "read" ? "text-gray-900 border-b-2 border-green-500" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Read
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === "read" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {readCount}
                </span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[450px] custom-scrollbar p-2">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No {filter} notifications
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
                      {getInitial(notification.payload?.title, notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-sm font-semibold text-gray-900 pr-2 leading-snug">
                        {notification.payload?.projectName 
                          ? `${notification.payload.title || "Notification"} for ${notification.payload.projectName}`
                          : (notification.payload?.title || "Notification")}
                      </h4>
                      
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      {!notification.read && filter === "unread" && (
                        <div className="mt-3 mb-1 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Dot for unread */}
                    {!notification.read && (
                      <div className="shrink-0 pt-3 flex items-center justify-center w-4">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm" style={{ borderRadius: '9999px' }}></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;

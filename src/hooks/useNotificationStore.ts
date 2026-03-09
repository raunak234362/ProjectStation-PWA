import { useSelector, useDispatch } from "react-redux";
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  type Notification,
} from "../store/notificationSlice";

/**
 * Hook to access and manage notifications from Redux store
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markRead, markAllRead, remove } = useNotificationStore();
 *
 * // Display notifications
 * notifications.map(notif => <div key={notif.id}>{notif.message}</div>)
 *
 * // Mark as read
 * markRead(notificationId);
 *
 * // Mark all as read
 * markAllRead();
 * ```
 */
export const useNotificationStore = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: any) => state.notificationInfo?.notifications || [],
  ) as Notification[];
  const unreadCount = useSelector(
    (state: any) => state.notificationInfo?.unreadCount || 0,
  ) as number;

  const markRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const markAllRead = () => {
    dispatch(markAllAsRead());
  };

  const remove = (id: string) => {
    dispatch(removeNotification(id));
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    remove,
  };
};

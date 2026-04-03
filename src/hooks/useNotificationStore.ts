import { useSelector, useDispatch } from "react-redux";
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  type Notification,
} from "../store/notificationSlice";
import {
  openDetailView,
  closeDetailView,
} from "../store/uiSlice";

/**
 * Hook to access and manage notifications from Redux store
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

  const openDetail = (type: any, id: any, projectId?: any) => {
    dispatch(openDetailView({ type, id, projectId }));
  };

  const closeDetail = () => {
    dispatch(closeDetailView());
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    remove,
    openDetail,
    closeDetail,
  };
};

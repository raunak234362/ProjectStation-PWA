/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define notification interface matching backend structure
export interface Notification {
  id: string;
  createdAt: string;
  delivered: boolean;
  payload: {
    title: string;
    message: string;
    projectName?: string;
    [key: string]: any;
  };
  read: boolean;
  userID: string;
  type?: string; // Optional, for categorization
  [key: string]: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

// Helper to calculate unread count
const calculateUnreadCount = (notifications: Notification[]) => {
  return notifications.filter((n) => !n.read).length;
};

// Slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Set all notifications (for initial fetch)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = calculateUnreadCount(action.payload);
    },

    // Add a new notification (for real-time updates)
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check if notification already exists
      const exists = state.notifications.some(
        (n) => n.id === action.payload.id,
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    // Remove a notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload,
      );
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Update a notification
    updateNotification: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Notification> }>,
    ) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload.id,
      );
      if (notification) {
        const wasUnread = !notification.read;
        Object.assign(notification, action.payload.updates);
        const isUnread = !notification.read;

        // Recalculate unread count if read status changed
        if (wasUnread && !isUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isUnread) {
          state.unreadCount += 1;
        }
      }
    },
  },
});

// Export actions and reducer
export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  updateNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

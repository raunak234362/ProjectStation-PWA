import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket";
import { addNotification } from "../store/notificationSlice";
import type { SocketMessage, User } from "../interface";
import type { Notification } from "../store/notificationSlice";

const useNotifications = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(
    (s: any) => (s.userData?.userData ?? s.userInfo?.userDetail ?? {}) as User,
  );

  useEffect(() => {
    // Handle chat messages
    const handleMessage = (msg: SocketMessage) => {
      // Don't notify if it's our own message
      if (msg.senderId === userInfo?.id) return;

      const isChatsPage = window.location.pathname.includes("/chats");

      // Add to Redux store for real-time updates
      const notification: Notification = {
        id: `chat-${msg.id || Date.now()}`,
        createdAt: new Date().toISOString(),
        delivered: true,
        payload: {
          title: "New Chat Message",
          message: msg.content,
        },
        read: false,
        userID: msg.senderId,
        type: "chat",
      };
      dispatch(addNotification(notification));

      // Show browser notification if:
      // 1. Document is hidden (user is in another tab)
      // 2. User is NOT on the chats page
      if (document.hidden || !isChatsPage) {
        const title = "New Chat Message";
        const options = {
          body: msg.content,
          icon: "/pwa-192x192.png",
          tag: msg.groupId,
        };

        if (
          "serviceWorker" in navigator &&
          Notification.permission === "granted"
        ) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
          });
        } else if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(title, options);
        }
      }
    };

    // Handle general notifications from backend
    const handleNotification = (data: any) => {
      const notification: Notification = {
        id: data.id || `notif-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString(),
        delivered: data.delivered ?? true,
        payload: {
          title: data.payload?.title || data.title || "New Notification",
          message: data.payload?.message || data.message || "",
          projectName: data.payload?.projectName || data.projectName,
          ...data.payload,
        },
        read: data.read ?? false,
        userID: data.userID || data.userId,
        type: data.type || "general",
      };
      dispatch(addNotification(notification));

      // Show browser notification if document is hidden
      if (document.hidden) {
        const title = notification.payload.title || "New Notification";
        const options = {
          body: notification.payload.message,
          icon: "/pwa-192x192.png",
          tag: notification.id,
        };

        if (
          "serviceWorker" in navigator &&
          Notification.permission === "granted"
        ) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
          });
        } else if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(title, options);
        }
      }
    };

    // Subscribe to socket events
    socket.on("receiveGroupMessage", handleMessage);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("receiveGroupMessage", handleMessage);
      socket.off("notification", handleNotification);
    };
  }, [dispatch, userInfo?.id]);
};

export default useNotifications;

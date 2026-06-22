import { useEffect } from "react";
import socket from "../socket";
import { toast } from "react-toastify";
import { useNotificationStore } from "../hooks/useNotificationStore";

const NotificationReceiver = () => {
  const { openDetail } = useNotificationStore();

  const handleNotificationClick = (notification: any) => {
    console.log("🔔 Toast clicked raw data:", notification);
    const type = notification.type;
    const t = type?.toUpperCase();
    const payload = notification.payload || {};

    // Check both root and payload for IDs
    const findId = (key: string) => notification[key] || payload[key];

    // Priority IDs based on type
    let targetId = null;
    if (t === "SUBMITTAL" || t === "SUBMITTALS") targetId = findId("submittalId") || findId("submittal_id") || findId("submittalId");
    else if (t === "RFI") targetId = findId("rfiId") || findId("rfi_id");
    else if (t === "RFQ") targetId = findId("rfqId") || findId("rfq_id");
    else if (t === "INTERNAL_RFQ" || t === "INTERNAL-RFQ") targetId = findId("rfqId") || findId("rfq_id");
    else if (t === "CD_QUOTA" || t === "CD-QUOTA") targetId = findId("cdQuotaId") || findId("quotaId");
    else if (t === "CD_RFQ" || t === "CD-RFQ") targetId = findId("rfqId") || findId("rfq_id");
    else if (t === "MILESTONE") targetId = findId("milestoneId") || findId("milestone_id");
    else if (t === "PROJECT") targetId = findId("projectId") || findId("project_id");
    else if (t === "TASK") targetId = findId("taskId") || findId("task_id");
    else if (t === "CHANGE_ORDER" || t === "CO") targetId = findId("changeOrderId") || findId("change_order_id");

    // Fallback ID
    const anyId = targetId || payload.id || findId("id");

    console.log("🔍 Toast click handled details:", { t, targetId, anyId, payload });

    if (anyId) {
      let viewType: any = null;
      if (t === "SUBMITTAL" || t === "SUBMITTALS") viewType = "SUBMITTAL";
      else if (t === "RFI") viewType = "RFI";
      else if (t === "RFQ") viewType = "RFQ";
      else if (t === "INTERNAL_RFQ" || t === "INTERNAL-RFQ") viewType = "INTERNAL_RFQ";
      else if (t === "CD_QUOTA" || t === "CD-QUOTA") viewType = "CD_QUOTA";
      else if (t === "CD_RFQ" || t === "CD-RFQ") viewType = "CD_RFQ";
      else if (t === "MILESTONE") viewType = "MILESTONE";
      else if (t === "PROJECT") viewType = "PROJECT";
      else if (t === "TASK") viewType = "TASK";
      else if (t === "CHANGE_ORDER" || t === "CO") viewType = "CHANGE_ORDER";

      if (viewType) {
        const projId = findId("projectId") || findId("project_id");
        openDetail(viewType, anyId, projId);
      }
    }
  };

  const showBrowserNotification = (title: string, message: string) => {
    // ... existings logic
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  useEffect(() => {
    socket.on("customNotification", (payload: any) => {
      console.log("📥 Notification received:", payload);

      const title = payload.title || "🔔 New Alert";
      const message = payload.message || "You have a new notification.";

      showBrowserNotification(title, message);
      toast.info(message, { 
        position: "top-right",
        onClick: () => handleNotificationClick(payload)
      });
    });

    socket.on("receivePrivateMessage", (msg: any) => {
      console.log("📩 Private message received:", msg);

      const message =
        typeof msg === "string" ? msg : msg?.content || "New private message.";

      showBrowserNotification("📩 Private Message", message);
      toast.info(message, { position: "top-right" });
    });

    socket.on("receiveGroupMessage", (msg: any) => {
      console.log("👥 Group message received:", msg);

      const message = msg?.content || "New group message.";

      showBrowserNotification("👥 Group Message", message);
      toast.info(message, { position: "top-right" });
    });

    return () => {
      socket.off("customNotification");
      socket.off("receivePrivateMessage");
      socket.off("receiveGroupMessage");
    };
  }, [openDetail]);

  return null;
};

export default NotificationReceiver;

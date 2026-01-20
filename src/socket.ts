/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5156";
console.log("DEBUG: Socket.io connecting to:", baseURL);

const socket = io(baseURL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Re-connect when window/app regains focus (crucial for mobile PWAs)
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    const auth = socket.auth; 
    if (
      auth &&
      typeof auth !== "function" &&
      (auth as any).userId &&
      !socket.connected
    ) {
      console.log("DEBUG: App focused, reconnecting socket...");
      socket.connect();
    }
  });
}

// Connect socket with userId
export function connectSocket(userId: string) {
  if (!userId) {
    console.warn("User ID missing — socket not connected");
    return;
  }

  console.log("User ID Passing", userId);

  // Update auth before connecting
  socket.auth = { userId };
  console.log(socket);

  // Avoid multiple connects
  if (!socket.connected) {
    socket.connect();
  }

  // Log socket events (optional but very helpful)
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    if (typeof socket.id === "string") {
      sessionStorage.setItem("socketId", socket.id);
    } else {
      console.warn(
        "Socket ID is undefined, could not store socketId in sessionStorage.",
      );
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });
}

export default socket;

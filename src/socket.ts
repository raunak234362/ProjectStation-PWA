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
    const token = sessionStorage.getItem("token");
    
    if (
      token &&
      auth &&
      typeof auth !== "function" &&
      !socket.connected
    ) {
      console.log("DEBUG: App focused, reconnecting socket with token...");
      socket.auth = { token };
      socket.connect();
    }
  });
}

// Connect socket with JWT token
export function connectSocket(token?: string) {
  const authToken = token || sessionStorage.getItem("token");

  if (!authToken) {
    console.warn("JWT Token missing — socket not connected");
    return;
  }

  console.log("DEBUG: Connecting socket with token");

  // Update auth before connecting
  socket.auth = { token: authToken };

  // If already connected, disconnect first to force a re-auth with the new token
  if (socket.connected) {
    socket.disconnect();
  }
  
  socket.connect();

  // Log socket events
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    if (typeof socket.id === "string") {
      sessionStorage.setItem("socketId", socket.id);
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

// src/hooks/useGroupMessages.ts
import { useEffect } from "react";
import socket from "../socket";
import type { SocketMessage } from "../interface";

const useGroupMessages = (callback: (msg: SocketMessage) => void) => {
  useEffect(() => {
    const handler = (msg: SocketMessage) => {
      console.log("Group message:", msg);
      if (msg.isTagged) console.log("You were tagged!");
      callback(msg);
    };
    socket.on("receiveGroupMessage", handler);
    return () => {
      socket.off("receiveGroupMessage", handler);
    };
  }, [callback]);
};


export default useGroupMessages;

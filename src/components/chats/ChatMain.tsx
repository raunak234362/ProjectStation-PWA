/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/ChatMain.tsx
import { Send } from "lucide-react";
import Button from "../fields/Button";
import ChatHead from "./ChatHead";
import ChatBG from "../../assets/background-image.jpg";
import socket from "../../socket";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Service from "../../api/Service";
import type { ChatItem, Message, User } from "../../interface";

interface Props {
  activeChat: ChatItem | null;
  setActiveChat: (chat: ChatItem | null) => void;
  recentChats: ChatItem[];
}

interface DisplayMessage {
  id: string;
  text: string;
  time: string;
  sender: "me" | "other";
  senderName?: string;
}

const ChatMain: React.FC<Props> = ({ activeChat, setActiveChat }) => {
  const userInfo = useSelector((s: any) => s.userData?.userData as User);
  const staffData = useSelector((s: any) => s.userData?.staffData as User[]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestId, setOldestId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const groupId = activeChat?.group.id;

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !groupId) return;

    const payload = {
      senderId: userInfo.id,
      groupId,
      content,
      taggedUserIds: [] as string[],
    };
    socket.emit("groupMessages", payload);
    setInput("");
  };

  const fetchMessages = async (lastId: string | null = null) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await Service.ChatByGroupID(groupId, lastId);
      const newMsgs: DisplayMessage[] = res.map((m: Message) => ({
        id: m.id,
        text: m.content,
        time: m.createdAt,
        sender: m.senderId === userInfo.id ? "me" : "other",
        senderName:
          m.senderId !== userInfo.id
            ? `${m.sender?.f_name} ${m.sender?.l_name}`
            : undefined,
      }));

      if (newMsgs.length === 0) {
        setHasMore(false);
        return;
      }

      const reversed = newMsgs.reverse();
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const filtered = reversed.filter((m) => !existing.has(m.id));
        return [...filtered, ...prev];
      });

      setOldestId(reversed[0].id);
      if (newMsgs.length < 20) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial
  useEffect(() => {
    if (activeChat) {
      setMessages([]);
      setOldestId(null);
      setHasMore(true);
      fetchMessages();
    }
  }, [activeChat]);

  // Real‑time incoming
  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.groupId !== groupId) return;
      const sender = staffData.find((s) => s.id === msg.senderId);
      const newMsg: DisplayMessage = {
        id: msg.id,
        text: msg.content,
        time: msg.createdAt,
        sender: msg.senderId === userInfo.id ? "me" : "other",
        senderName: sender ? `${sender.f_name} ${sender.l_name}` : undefined,
      };
      setMessages((prev) => [...prev, newMsg]);
    };
    socket.on("receiveGroupMessage", handler);
    return () => {
      socket.off("receiveGroupMessage", handler);
    };
  }, [groupId, userInfo.id, staffData]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Infinite scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      if (container.scrollTop < 100 && hasMore && !loading) {
        fetchMessages(oldestId);
      }
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [oldestId, hasMore, loading, groupId]);

  const formatMessage = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const words = line.split(" ");
      return (
        <p key={i} className="break-words">
          {words.map((w, j) =>
            w.startsWith("@") ? (
              <span key={j} className="text-blue-600 font-medium">
                {w}{" "}
              </span>
            ) : (
              w + " "
            )
          )}
        </p>
      );
    });
  };

  return (
    <div
      className="flex flex-col h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${ChatBG})` }}
    >
      <ChatHead contact={activeChat} onBack={() => setActiveChat(null)} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="text-center text-sm text-gray-500">Loading...</div>
        )}
        {messages.map((msg) => {
          const date = new Date(msg.time).toDateString();
          const time = new Date(msg.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              } mb-3`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-white/80 rounded-tr-none"
                    : "bg-teal-100/90 rounded-tl-none"
                }`}
              >
                {msg.sender === "other" && msg.senderName && (
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    {msg.senderName}
                  </p>
                )}
                <div className="text-sm">{formatMessage(msg.text)}</div>
                <p className="text-right text-xs text-gray-600 mt-1">{time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Button onClick={sendMessage} className="bg-teal-600 text-white">
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;

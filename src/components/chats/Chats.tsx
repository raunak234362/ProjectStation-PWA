// src/pages/Chats.tsx
import { useEffect, useState } from "react";
import ChatMain from "./ChatMain";
import ChatSidebar from "./ChatSidebar";
import useGroupMessages from "../../hooks/userGroupMessages";
import type { ChatItem } from "../../interface";
import Service from "../../api/Service";

const Chats = () => {
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  const fetchConversations = async () => {
    try {
      const res = await Service.AllChats();
      const sorted = res.sort(
        (a: ChatItem, b: ChatItem) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setRecentChats(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real‑time updates
  useGroupMessages((msg) => {
    setRecentChats((prev) => {
      const updated = prev.map((c) =>
        c.group.id === msg.groupId
          ? { ...c, lastMessage: msg.content, updatedAt: msg.createdAt }
          : c
      );
      const target = updated.find((c) => c.group.id === msg.groupId);
      if (!target) return prev;

      const filtered = updated.filter((c) => c.group.id !== msg.groupId);
      return [target, ...filtered];
    });

    if (msg.groupId !== activeChat?.group.id) {
      setUnreadIds((prev) => (prev.includes(msg.groupId) ? prev : [...prev, msg.groupId]));
    }
  });

  return (
    <div className="flex md:h-[92.5vh] h-[93vh] overflow-y-hidden bg-gray-50 rounded-2xl">
      {/* Desktop */}
      <div className="hidden md:flex w-full rounded-2xl">
        <div className="w-80 border-r">
          <ChatSidebar
            recentChats={recentChats}
            activeChat={activeChat}
            unreadChatIds={unreadIds}
            setActiveChat={setActiveChat}
            setUnreadChatIds={setUnreadIds}
          />
        </div>
        <div className="flex-1">
          {activeChat ? (
            <ChatMain
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              recentChats={recentChats}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full">
        {!activeChat ? (
          <ChatSidebar
            recentChats={recentChats}
            activeChat={activeChat}
            unreadChatIds={unreadIds}
            setActiveChat={setActiveChat}
            setUnreadChatIds={setUnreadIds}
          />
        ) : (
          <ChatMain
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            recentChats={recentChats}
          />
        )}
      </div>
    </div>
  );
};

export default Chats;
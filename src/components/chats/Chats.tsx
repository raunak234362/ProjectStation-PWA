// src/pages/Chats.tsx
import { useState } from "react";
import ChatMain from "./ChatMain";
import ChatSidebar from "./ChatSidebar";
import useGroupMessages from "../../hooks/userGroupMessages";
import type { ChatItem } from "../../interface";
import AddChatGroup from "./AddChatGroup";

const Chats = () => {
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

    if (msg.groupId !== activeChat?.group?.id) {
      setUnreadIds((prev) => (prev.includes(msg.groupId) ? prev : [...prev, msg.groupId]));
    }
  });

  const handleAddGroupClick = () => {
    setActiveChat(null);
    setIsAddGroupOpen(true);
  };

  const handleCloseAddGroup = () => setIsAddGroupOpen(false);
  const handleGroupCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setIsAddGroupOpen(false);
  };

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
            onAddGroupClick={handleAddGroupClick}
            setRecentChats={setRecentChats}
            refreshKey={refreshKey}
          />
        </div>
        <div className="flex-1">
          {isAddGroupOpen ? (
            <AddChatGroup onClose={handleCloseAddGroup} onCreated={handleGroupCreated} />
          ) : activeChat ? (
            <ChatMain activeChat={activeChat} setActiveChat={setActiveChat} recentChats={recentChats} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full">
        {isAddGroupOpen ? (
          <AddChatGroup onClose={handleCloseAddGroup} onCreated={handleGroupCreated} />
        ) : !activeChat ? (
          <ChatSidebar
            recentChats={recentChats}
            activeChat={activeChat}
            unreadChatIds={unreadIds}
            setActiveChat={setActiveChat}
            setUnreadChatIds={setUnreadIds}
            onAddGroupClick={handleAddGroupClick}
            setRecentChats={setRecentChats}
            refreshKey={refreshKey}
          />
        ) : (
          <ChatMain activeChat={activeChat} setActiveChat={setActiveChat} recentChats={recentChats} />
        )}
      </div>
    </div>
  );
};

export default Chats;
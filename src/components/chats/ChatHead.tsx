// src/components/chat/ChatHead.tsx
import { MoreVertical } from "lucide-react";
import Button from "../fields/Button";
import { useState } from "react";
import type { ChatItem } from "../../interface";
import GroupDetail from "./GroupDetail";

interface Props {
  contact: ChatItem | null;
  onBack?: () => void;
}

const ChatHead: React.FC<Props> = ({ contact, onBack }) => {
    const [detailOpen, setDetailOpen] = useState(false);
  const group = contact?.group;

  return (
    <div className="p-4 border-b bg-white flex justify-between items-center rounded-2xl">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden text-green-600 font-medium"
          >
            Back
          </button>
        )}
        <h2 
          className="font-semibold text-lg cursor-pointer hover:underline"
          onClick={() => setDetailOpen(true)}
        >
          {group?.name}
        </h2>
      </div>

      <Button
        onClick={() => setDetailOpen(true)}
        className="rounded-full bg-green-500 text-white"
      >
        <MoreVertical size={20} />
      </Button>

      {detailOpen && group && (
        <GroupDetail group={group} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
};

export default ChatHead;

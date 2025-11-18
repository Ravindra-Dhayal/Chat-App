import { useState } from "react";
import { Search, Menu } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { NewChatPopover } from "./newchat-popover";
import AsideBar from "../aside-bar";

const ChatListHeader = ({ onSearch }: { onSearch: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="px-3 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={() => setIsOpen((s) => !s)}
            className="p-1 rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          {isOpen && <AsideBar onClose={() => setIsOpen(false)} />}
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
        <div>
          {/* NewChatPopover */}
          <NewChatPopover />
        </div>
      </div>
      <div>
        <InputGroup className="bg-background text-sm">
          <InputGroupInput
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatListHeader;

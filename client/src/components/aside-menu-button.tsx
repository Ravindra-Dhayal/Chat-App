import { useState } from "react";
import { Menu } from "lucide-react";
import AsideBar from "./aside-bar";
import { cn } from "@/lib/utils";

interface AsideMenuButtonProps {
  className?: string;
}

const AsideMenuButton = ({ className }: AsideMenuButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Toggle navigation menu"
        onClick={() => setIsOpen(true)}
        className={cn(
          "p-2.5 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-border bg-card hover:shadow-md",
          className
        )}
      >
        <Menu className="h-6 w-6 text-foreground" />
      </button>
      {isOpen && <AsideBar onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default AsideMenuButton;

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import AsideMenuButton from "./aside-menu-button";

interface SectionHeaderProps {
  title: string;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}

const SectionHeader = ({ title, actions, className, titleClassName }: SectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        <AsideMenuButton />
        <h1 className={cn("text-2xl font-bold", titleClassName)}>{title}</h1>
      </div>
      {actions}
    </div>
  );
};

export default SectionHeader;

import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import { Button } from "./ui/button";
import { Moon, Sun, Users, BookmarkIcon, Settings, UserPlus, HelpCircle, Edit, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileEditDialog from "./profile-edit-dialog";

interface Props {
  onClose?: () => void;
}

const AsideBar = ({ onClose }: Props) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const isOnline = isUserOnline(user?._id);

  const menuItems = [
    { icon: Users, label: "My Profile", action: () => navigate("/profile") },
    { icon: Users, label: "New Group", action: () => navigate("/groups?new=group") },
    { icon: Users, label: "Contacts", action: () => navigate("/contacts") },
    { icon: BookmarkIcon, label: "Saved Messages", action: () => navigate("/saved") },
    { icon: Settings, label: "Settings", action: () => navigate("/settings") },
    { icon: UserPlus, label: "Invite Friends", action: () => navigate("/invite") },
    { icon: HelpCircle, label: "Website Features", action: () => navigate("/features") },
    { icon: HelpCircle, label: "Terms & Privacy", action: () => navigate("/legal") },
  ];

  return (
    <>
      {/* mobile overlay sits below the aside but above page content; clicking it closes the aside */}
      {onClose && (
        <div
          role="button"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(e) => (e.key === "Escape" || e.key === "Enter" ? onClose() : null)}
          className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
          aria-label="Close sidebar"
          aria-hidden="false"
        />
      )}

      <aside
        className="top-0 fixed inset-y-0 left-0 z-[9999] h-svh shadow-lg w-full sm:w-80 max-w-sm overflow-y-auto bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out"
      >
        <div className="w-full h-full px-4 pt-6 pb-6 flex flex-col">
          {/* User Profile Section */}
          <div className="mb-6 pb-6 flex flex-col items-start border-b border-sidebar-border">
            {onClose && (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={onClose}
                className="ml-auto mb-2 p-1 rounded-md hover:bg-sidebar-accent/20 focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div role="button" className="flex items-center gap-3 w-full cursor-pointer group p-1 rounded-lg hover:bg-sidebar-accent/10 transition-colors min-h-[44px]">
                  <AvatarWithBadge
                    name={user?.name || "Unknown"}
                    src={user?.avatar || ""}
                    isOnline={isOnline}
                    className="!bg-blue-400"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate text-sidebar-foreground">
                      {user?.name || "Unknown"}
                    </h3>
                    <p className="text-sm truncate text-sidebar-foreground/70">
                      {user?.email || "+91 XXXX XXXXX"}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg z-[99999]" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setIsProfileEditOpen(true);
                    onClose?.();
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    onClose?.();
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-colors text-left text-sidebar-foreground hover:bg-sidebar-accent/10 active:bg-sidebar-accent/20 min-h-[44px]"
                >
                  <Icon className="h-6 w-6 flex-shrink-0 text-sidebar-accent-foreground" />
                  <span className="font-medium text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-sidebar-border">
            <span className="text-sm font-medium text-sidebar-foreground/70">Theme</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-sidebar-border bg-sidebar-accent/20 hover:bg-sidebar-accent/30 min-h-[44px] min-w-[44px]"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun
                className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <Moon
                className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
            </Button>
          </div>
        </div>
      </aside>
      <ProfileEditDialog
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />
    </>
  );
};

export default AsideBar;

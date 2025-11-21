import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import { Button } from "./ui/button";
import { Moon, Sun, Users, Phone, BookmarkIcon, Settings, UserPlus, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose?: () => void;
}

const AsideBar = ({ onClose }: Props) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isOnline = isUserOnline(user?._id);

  const menuItems = [
    { icon: Users, label: "My Profile", action: () => navigate("/profile") },
    { icon: Users, label: "New Group", action: () => navigate("/groups?new=group") },
    { icon: Users, label: "Contacts", action: () => navigate("/contacts") },
    { icon: Phone, label: "Calls", action: () => navigate("/calls") },
    { icon: BookmarkIcon, label: "Saved Messages", action: () => navigate("/saved") },
    { icon: Settings, label: "Settings", action: () => navigate("/settings") },
    { icon: UserPlus, label: "Invite Friends", action: () => navigate("/invite") },
    { icon: HelpCircle, label: "Telegram Features", action: () => {} },
  ];

  return (
    <>
      {/* overlay sits below the aside but above page content; clicking it closes the aside */}
      {onClose && (
        <div
          role="button"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(e) => (e.key === "Escape" ? onClose() : null)}
          className="fixed inset-0 bg-black/30 z-[9999]"
          aria-hidden="false"
        />
      )}

      <aside
        className={`top-0 fixed inset-y-0 left-0 z-[10000000] h-svh shadow-sm w-80 overflow-y-auto ${
          theme === "dark" ? "bg-slate-800" : "bg-slate-100"
        }`}
      >
        <div className="w-full h-full px-4 pt-6 pb-6 flex flex-col">
          {/* User Profile Section */}
          <div className={`mb-6 pb-6 flex flex-col items-start ${
            theme === "dark" ? "border-b border-slate-700" : "border-b border-slate-300"
          }`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div role="button" className="flex items-center gap-3 w-full cursor-pointer group">
                  <AvatarWithBadge
                    name={user?.name || "Unknown"}
                    src={user?.avatar || ""}
                    isOnline={isOnline}
                    className="!bg-blue-400"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>{user?.name || "Unknown"}</h3>
                    <p className={`text-sm truncate ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>{user?.email || "+91 XXXX XXXXX"}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-lg z-[99999]" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
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
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                    theme === "dark"
                      ? "text-slate-200 hover:bg-slate-700"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className={`h-6 w-6 flex-shrink-0 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`} />
                  <span className="font-medium text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className={`mt-auto pt-4 flex items-center justify-between ${
            theme === "dark" ? "border-t border-slate-700" : "border-t border-slate-300"
          }`}>
            <span className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>Theme</span>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                theme === "dark"
                  ? "border-slate-600 bg-slate-700 hover:bg-slate-600"
                  : "border-slate-300 bg-slate-200 hover:bg-slate-300"
              }`}
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
    </>
  );
};

export default AsideBar;

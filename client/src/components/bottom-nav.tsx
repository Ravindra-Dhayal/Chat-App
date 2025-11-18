import { NavLink } from "react-router-dom";
import { Home, MessageCircle, Users, Hash, Globe } from "lucide-react";
import { useTheme } from "./theme-provider";

const items = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Chat", to: "/chat", icon: MessageCircle },
  { label: "Groups", to: "/groups", icon: Users },
  { label: "Channel", to: "/channel", icon: Hash },
  { label: "Community", to: "/community", icon: Globe },
];

const BottomNav = () => {
  const { theme } = useTheme();

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`fixed z-[9998] bottom-0 left-0 right-0 w-full
         shadow-lg px-2 py-2 backdrop-blur-sm border-2 border-b-0
        ${theme === "dark" ? "bg-slate-800 border-slate-800" : "bg-gray-100 border-gray-100"}`}
    >
      <ul className="flex items-center justify-between gap-1 px-4 lg:px-14">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 justify-center py-2 px-2 rounded-lg text-xs
                  ${isActive ? "text-primary" : "text-muted-foreground"}`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">{it.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;

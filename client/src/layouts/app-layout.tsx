import AppWrapper from "@/components/app-wrapper";
import BottomNav from "@/components/bottom-nav";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        <Outlet />
        <BottomNav/>
      </div>
    </AppWrapper>
  );
};

export default AppLayout;

import React from "react";
import BottomNav from "./bottom-nav";

interface Props {
  children: React.ReactNode;
}
const AppWrapper = ({ children }: Props) => {
  return (
    <div className="h-full">
      <main className="h-full">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppWrapper;

import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  requireAuth?: boolean;
}

const RouteGuard = ({ requireAuth }: Props) => {
  const { user } = useAuth();

  // If route requires auth and user is not logged in, redirect to login
  if (requireAuth && !user) return <Navigate to="/" replace />;

  // If route is for non-auth users (login/signup) and user is logged in, redirect to chat
  if (!requireAuth && user) return <Navigate to="/chat" replace />;

  return <Outlet />;
};

export default RouteGuard;

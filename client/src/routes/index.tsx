import BaseLayout from "@/layouts/base-layout";
import { Route, Routes } from "react-router-dom";
import { authRoutesPaths, protectedRoutesPaths } from "./routes";
import AppLayout from "@/layouts/app-layout";
import RouteGuard from "./route-guard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected routes with AppLayout - Must come first to match before auth routes */}
      <Route element={<RouteGuard requireAuth={true} />}>
        <Route element={<AppLayout />}>
          {protectedRoutesPaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      {/* Auth / Public routes */}
      <Route element={<RouteGuard requireAuth={false} />}>
        <Route element={<BaseLayout />}>
          {authRoutesPaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;

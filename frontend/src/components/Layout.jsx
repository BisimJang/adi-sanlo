import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-sidebar flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

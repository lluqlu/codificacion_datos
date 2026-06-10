import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "../../app/SidebarContext";

function Layout() {
  const { isOpen, close } = useSidebar();
  return (
    <div className="flex h-screen overflow-hidden">
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={close}
        />
      )}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0" style={{ background: "var(--bg)" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  );
}

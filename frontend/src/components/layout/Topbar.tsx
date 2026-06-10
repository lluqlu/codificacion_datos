import { Menu } from "lucide-react";
import { useSidebar } from "../../app/SidebarContext";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { toggle } = useSidebar();
  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{
        height: "var(--topbar-height)",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-md -ml-1"
          style={{ color: "#6b7280", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[14px] font-semibold" style={{ color: "#111827" }}>{title}</h1>
        {subtitle && (
          <span
            className="hidden sm:inline text-[11px] font-medium px-2 py-0.5 rounded-md"
            style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

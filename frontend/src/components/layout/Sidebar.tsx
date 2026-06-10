import { useNavigate, useLocation } from "react-router-dom";
import { Home, Code2, Unlock, GitCompare, ImageIcon, Clock, Info, X } from "lucide-react";
import { useSidebar } from "../../app/SidebarContext";

const navItems = [
  { to: "/",            label: "Inicio",      Icon: Home,       exact: true  },
  { to: "/codificar",   label: "Codificar",   Icon: Code2,      exact: false },
  { to: "/decodificar", label: "Decodificar", Icon: Unlock,     exact: false },
  { to: "/comparar",    label: "Comparar",    Icon: GitCompare, exact: false },
  { to: "/imagenes",    label: "Imagenes",    Icon: ImageIcon,  exact: false },
  { to: "/historial",   label: "Historial",   Icon: Clock,      exact: false },
  { to: "/acerca",      label: "Acerca de",   Icon: Info,       exact: false },
];

export default function Sidebar() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { isOpen, close } = useSidebar();

  function isActive(to: string, exact: boolean) {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  }

  function handleNav(to: string) {
    navigate(to);
    close();
  }

  return (
    <aside
      className={`sidebar-drawer flex flex-col flex-shrink-0${isOpen ? " is-open" : ""}`}
      style={{
        width: "var(--sidebar-width)",
        background: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-[18px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#2563eb" }}
          >
            <Code2 size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-semibold text-white">Codificacion</span>
            <span className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>de Datos</span>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="md:hidden flex items-center justify-center w-7 h-7 rounded-md"
          style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 p-3 mt-1">
        {navItems.map(({ to, label, Icon, exact }) => {
          const active = isActive(to, exact);
          return (
            <button
              key={to}
              type="button"
              onClick={() => handleNav(to)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] w-full text-left transition-colors"
              style={{
                color:      active ? "#ffffff" : "rgba(255,255,255,0.45)",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                fontWeight: active ? 500 : 400,
                border:     "none",
                cursor:     "pointer",
              }}
            >
              <Icon
                size={15}
                strokeWidth={1.75}
                style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.35)", flexShrink: 0 }}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>sesion activa</span>
        </div>
      </div>
    </aside>
  );
}

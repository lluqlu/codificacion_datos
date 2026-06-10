import { NavLink } from "react-router-dom";
import { Home, Code2, Unlock, GitCompare, ImageIcon, Clock, Info } from "lucide-react";

const navItems = [
  { to: "/",            label: "Inicio",          Icon: Home,       end: true  },
  { to: "/codificar",   label: "Codificar",       Icon: Code2,      end: false },
  { to: "/decodificar", label: "Decodificar",     Icon: Unlock,     end: false },
  { to: "/comparar",    label: "Comparar",        Icon: GitCompare, end: false },
  { to: "/imagenes",    label: "Imagenes / Bits", Icon: ImageIcon,  end: false },
  { to: "/historial",   label: "Historial",       Icon: Clock,      end: false },
  { to: "/acerca",      label: "Acerca de",       Icon: Info,       end: false },
];

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full flex-shrink-0 relative"
      style={{
        width: "var(--sidebar-width)",
        background: "linear-gradient(160deg, #0f172a 0%, #111827 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Subtle glow top-left */}
      <div
        className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
      />

      {/* Brand */}
      <div className="px-4 pt-5 pb-4 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 0 12px rgba(99,102,241,0.4)" }}
          >
            <Code2 size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Codificacion</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }}>Huffman / Shannon-Fano</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 mt-4 px-3 flex-1 relative">
        <p className="text-xs font-semibold px-2 mb-2 tracking-widest uppercase" style={{ color: "rgba(148,163,184,0.4)" }}>
          Herramientas
        </p>
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "text-white"
                  : "hover:text-slate-200"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "linear-gradient(90deg, rgba(59,130,246,0.2), rgba(99,102,241,0.08))",
                    border: "1px solid rgba(99,102,241,0.25)",
                    color: "#fff",
                  }
                : {
                    border: "1px solid transparent",
                    color: "rgba(148,163,184,0.75)",
                  }
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  style={{ color: isActive ? "#60a5fa" : "rgba(148,163,184,0.5)" }}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.45)" }}>v1.0 — sesion activa</p>
        </div>
      </div>
    </aside>
  );
}

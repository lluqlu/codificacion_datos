import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/codificar", label: "Codificar" },
  { to: "/decodificar", label: "Decodificar" },
  { to: "/comparar", label: "Comparar" },
  { to: "/imagenes", label: "Imagenes / Bits" },
  { to: "/historial", label: "Historial" },
  { to: "/acerca", label: "Acerca de" },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col bg-slate-900 text-slate-300 h-full" style={{ width: "var(--sidebar-width)" }}>
      <div className="px-5 py-4 border-b border-slate-700">
        <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Codificacion</p>
        <p className="text-sm text-slate-200 font-semibold mt-0.5">Huffman / Shannon-Fano</p>
      </div>
      <nav className="flex flex-col gap-0.5 mt-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

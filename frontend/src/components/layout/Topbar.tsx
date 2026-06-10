interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10"
      style={{
        height: "var(--topbar-height)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-3">
        {subtitle && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            {subtitle}
          </span>
        )}
        <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

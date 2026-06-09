interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0"
      style={{ height: "var(--topbar-height)" }}
    >
      <div>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

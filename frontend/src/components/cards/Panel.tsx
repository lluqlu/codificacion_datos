interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export default function Panel({ title, children, className = "", actions }: PanelProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 flex flex-col ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          {title && <h2 className="text-sm font-semibold text-slate-700">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}

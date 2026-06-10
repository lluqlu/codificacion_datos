interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  accent?: "blue" | "violet" | "emerald" | "slate";
}

export default function Panel({ title, children, className = "", actions }: PanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {(title || actions) && (
        <div
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          {title && (
            <h2
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#9ca3af", letterSpacing: "0.08em" }}
            >
              {title}
            </h2>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}

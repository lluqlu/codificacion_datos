interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  accent?: "blue" | "violet" | "emerald" | "slate";
}

const accentGradient: Record<string, string> = {
  blue:    "linear-gradient(90deg, #3b82f6, #6366f1)",
  violet:  "linear-gradient(90deg, #8b5cf6, #a855f7)",
  emerald: "linear-gradient(90deg, #10b981, #14b8a6)",
  slate:   "linear-gradient(90deg, #94a3b8, #cbd5e1)",
};

export default function Panel({ title, children, className = "", actions, accent }: PanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      {accent && (
        <div style={{ height: 2, background: accentGradient[accent], flexShrink: 0 }} />
      )}
      {(title || actions) && (
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(241,245,249,1)", background: "rgba(248,250,252,0.6)" }}
        >
          {title && (
            <h2 className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#94a3b8", letterSpacing: "0.06em" }}>
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

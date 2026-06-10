interface StatusBarProps {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  activeAlgorithm?: string;
}

const dot: Record<string, string> = {
  idle:    "#94a3b8",
  loading: "#3b82f6",
  success: "#10b981",
  error:   "#ef4444",
};

const glow: Record<string, string> = {
  idle:    "none",
  loading: "0 0 6px rgba(59,130,246,0.5)",
  success: "0 0 6px rgba(16,185,129,0.5)",
  error:   "0 0 6px rgba(239,68,68,0.5)",
};

export default function StatusBar({ status, message, activeAlgorithm }: StatusBarProps) {
  const isError = status === "error";
  return (
    <footer
      className="flex items-center justify-between px-5 text-xs flex-shrink-0 flex-shrink-0"
      style={{
        height: "var(--statusbar-height)",
        background: isError ? "rgba(254,242,242,0.95)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderTop: isError ? "1px solid rgba(252,165,165,0.5)" : "1px solid rgba(226,232,240,0.7)",
        color: isError ? "#dc2626" : "#64748b",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dot[status], boxShadow: glow[status] }}
        />
        <span>{message}</span>
      </div>
      {activeAlgorithm && (
        <span style={{ color: "#94a3b8" }}>
          Algoritmo:{" "}
          <span className="font-medium" style={{ color: "#64748b" }}>
            {activeAlgorithm}
          </span>
        </span>
      )}
    </footer>
  );
}

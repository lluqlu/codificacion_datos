interface StatusBarProps {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  activeAlgorithm?: string;
}

const dotColor: Record<string, string> = {
  idle:    "#d1d5db",
  loading: "#3b82f6",
  success: "#22c55e",
  error:   "#ef4444",
};

export default function StatusBar({ status, message, activeAlgorithm }: StatusBarProps) {
  return (
    <footer
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        height: "var(--statusbar-height)",
        background: "#ffffff",
        borderTop: "1px solid #f1f5f9",
        color: status === "error" ? "#dc2626" : "#9ca3af",
        fontSize: 11,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColor[status] }}
        />
        <span>{message}</span>
      </div>
      {activeAlgorithm && (
        <span style={{ color: "#d1d5db" }}>
          {activeAlgorithm}
        </span>
      )}
    </footer>
  );
}

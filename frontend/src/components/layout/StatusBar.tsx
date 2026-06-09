interface StatusBarProps {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  activeAlgorithm?: string;
}

const statusStyles = {
  idle: "bg-slate-100 text-slate-500",
  loading: "bg-blue-50 text-blue-600",
  success: "bg-green-50 text-green-700",
  error: "bg-red-50 text-red-600",
};

export default function StatusBar({ status, message, activeAlgorithm }: StatusBarProps) {
  return (
    <footer
      className={`flex items-center justify-between px-6 text-xs border-t border-slate-200 flex-shrink-0 ${statusStyles[status]}`}
      style={{ height: "var(--statusbar-height)" }}
    >
      <span>{message}</span>
      {activeAlgorithm && (
        <span className="text-slate-400">
          Algoritmo activo: <span className="font-medium text-slate-600">{activeAlgorithm}</span>
        </span>
      )}
    </footer>
  );
}

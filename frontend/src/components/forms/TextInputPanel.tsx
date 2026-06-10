import { useRef } from "react";
import { Upload, Zap } from "lucide-react";

interface TextInputPanelProps {
  value: string;
  onChange: (v: string) => void;
  onEncode: () => void;
  onFileLoad: (file: File) => void;
  loading: boolean;
}

export default function TextInputPanel({ value, onChange, onEncode, onFileLoad, loading }: TextInputPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileLoad(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 120 }}>
      <textarea
        className="flex-1 w-full resize-none text-[14px] text-slate-800 placeholder:text-slate-300 focus:outline-none leading-relaxed"
        style={{ background: "transparent", padding: 0, minHeight: 100 }}
        placeholder="Escriba o pegue texto para codificar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        <span className="text-[12px] tabular-nums" style={{ color: "#bec8d4" }}>
          {value.length === 0 ? (
            "0 caracteres"
          ) : (
            <>
              {value.length.toLocaleString()} {value.length === 1 ? "caracter" : "caracteres"}
              <span className="mx-1.5" style={{ color: "#dde3ea" }}>·</span>
              {(value.length * 8).toLocaleString()} bits
            </>
          )}
        </span>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              border: "1px solid #e2e8f0",
              color: "#64748b",
              background: "#fff",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <Upload size={12} />
            Abrir .txt
          </button>
          <button
            type="button"
            onClick={onEncode}
            disabled={loading || !value.trim()}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all"
            style={{
              background: "#2563eb",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(37,99,235,0.35)",
              opacity: loading || !value.trim() ? 0.45 : 1,
              cursor: loading || !value.trim() ? "not-allowed" : "pointer",
            }}
          >
            <Zap size={12} />
            {loading ? "Procesando..." : "Codificar"}
          </button>
        </div>
      </div>
    </div>
  );
}

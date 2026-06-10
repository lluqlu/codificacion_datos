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
    <div className="flex flex-col gap-3 h-full">
      <textarea
        className="flex-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors leading-relaxed"
        placeholder="Escriba o pegue texto aqui para codificar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 tabular-nums">
          {value.length.toLocaleString()} {value.length === 1 ? "caracter" : "caracteres"}
          {value.length > 0 && (
            <span className="ml-2 text-slate-300">·  {value.length * 8} bits sin comprimir</span>
          )}
        </span>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            <Upload size={12} />
            Abrir .txt
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
            onClick={onEncode}
            disabled={loading || !value.trim()}
          >
            <Zap size={12} />
            {loading ? "Procesando..." : "Codificar"}
          </button>
        </div>
      </div>
    </div>
  );
}

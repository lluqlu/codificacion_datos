import { useRef } from "react";

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
    <div className="flex flex-col gap-2 h-full">
      <textarea
        className="flex-1 w-full resize-none border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Escriba o pegue texto aqui para codificar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {value.length} {value.length === 1 ? "caracter" : "caracteres"}
        </span>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            Abrir archivo .txt
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            onClick={onEncode}
            disabled={loading || !value.trim()}
          >
            {loading ? "Procesando..." : "Codificar"}
          </button>
        </div>
      </div>
    </div>
  );
}

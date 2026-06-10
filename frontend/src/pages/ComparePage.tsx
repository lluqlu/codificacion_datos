import { useState, useRef } from "react";
import { Upload, GitCompare } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import FrequencyChart from "../components/charts/FrequencyChart";
import CodeLengthChart from "../components/charts/CodeLengthChart";
import { encodeText, encodeFile } from "../services/compressionApi";
import type { EncodeResponse } from "../types/compression";

type Status = "idle" | "loading" | "success" | "error";

export default function ComparePage() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState<EncodeResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCompare() {
    if (!text.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      setResult(await encodeText(text));
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al procesar");
      setStatus("error");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    try {
      const data = await encodeFile(file);
      setText(data.original.text);
      setResult(data);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al cargar archivo");
      setStatus("error");
    }
    e.target.value = "";
  }

  const diff    = result ? result.huffman.compressedBits - result.shannonFano.compressedBits : 0;
  const diffPct = result && result.shannonFano.compressedBits > 0
    ? Math.abs(diff / result.shannonFano.compressedBits * 100).toFixed(2)
    : "0";
  const diffLabel = diff < 0 ? "Huffman mas compacto" : diff > 0 ? "Shannon-Fano mas compacto" : "Rendimiento identico";

  const metricRows = result ? [
    { label: "Long. promedio de codigo", h: `${result.huffman.averageLength} bits/simb.`,  sf: `${result.shannonFano.averageLength} bits/simb.`,  hWins: result.huffman.averageLength <= result.shannonFano.averageLength },
    { label: "Eficiencia",               h: `${result.huffman.efficiency}%`,               sf: `${result.shannonFano.efficiency}%`,               hWins: result.huffman.efficiency >= result.shannonFano.efficiency },
    { label: "Bits comprimidos",         h: `${result.huffman.compressedBits}`,             sf: `${result.shannonFano.compressedBits}`,             hWins: result.huffman.compressedBits <= result.shannonFano.compressedBits },
    { label: "Tasa de compresion",       h: `${result.huffman.compressionRate}%`,           sf: `${result.shannonFano.compressionRate}%`,           hWins: result.huffman.compressionRate >= result.shannonFano.compressionRate },
  ] : [];

  return (
    <>
      <Topbar title="Comparacion" subtitle="Huffman vs Shannon-Fano" />

      <div className="flex-1 overflow-auto p-5 flex flex-col gap-5">
        {/* Input */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Texto a comparar</p>
          <div className="flex gap-3 items-start">
            <textarea
              className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              rows={3}
              placeholder="Ingrese texto o cargue un archivo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-col gap-2 flex-shrink-0">
              <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} />
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={12} />
                Cargar .txt
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all shadow-sm shadow-blue-200"
                onClick={handleCompare}
                disabled={status === "loading" || !text.trim()}
              >
                <GitCompare size={12} />
                {status === "loading" ? "Analizando..." : "Comparar"}
              </button>
            </div>
          </div>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{errorMsg}</div>
        )}

        {result && (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tamano original",         value: `${result.original.bits} bits`,               sub: `${result.original.characters} caracteres`,          accent: "slate" },
                { label: "Huffman comprimido",       value: `${result.huffman.compressedBits} bits`,       sub: `-${result.huffman.compressionRate}% reduccion`,      accent: "blue"   },
                { label: "Shannon-Fano comprimido",  value: `${result.shannonFano.compressedBits} bits`,   sub: `-${result.shannonFano.compressionRate}% reduccion`,  accent: "violet" },
              ].map((card) => {
                const border  = card.accent === "blue" ? "border-blue-200 bg-blue-50/40" : card.accent === "violet" ? "border-violet-200 bg-violet-50/40" : "border-slate-200 bg-slate-50/60";
                const valCol  = card.accent === "blue" ? "text-blue-700" : card.accent === "violet" ? "text-violet-700" : "text-slate-700";
                return (
                  <div key={card.label} className={`rounded-xl border px-4 py-3 ${border}`}>
                    <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                    <p className={`text-2xl font-bold mt-1 tabular-nums ${valCol}`}>{card.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Detail row */}
            <div className="grid grid-cols-2 gap-4">
              <Panel title="Metricas detalladas" accent="slate">
                <table className="w-full text-xs border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky top-0 bg-slate-50 text-left px-3 py-2 text-slate-500 font-medium border-b border-slate-100">Metrica</th>
                      <th className="sticky top-0 bg-blue-50 text-right px-3 py-2 text-blue-600 font-semibold border-b border-blue-100">Huffman</th>
                      <th className="sticky top-0 bg-violet-50 text-right px-3 py-2 text-violet-600 font-semibold border-b border-violet-100">Shannon-Fano</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricRows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-3 py-2.5 text-slate-600 font-medium border-b border-slate-100/60">{row.label}</td>
                        <td className={`px-3 py-2.5 text-right font-mono tabular-nums border-b border-slate-100/60 ${row.hWins ? "text-blue-700 font-semibold" : "text-slate-500"}`}>{row.h}</td>
                        <td className={`px-3 py-2.5 text-right font-mono tabular-nums border-b border-slate-100/60 ${!row.hWins ? "text-violet-700 font-semibold" : "text-slate-500"}`}>{row.sf}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="px-3 py-2.5 text-slate-500 font-medium border-b border-slate-100/60">Diferencia en bits</td>
                      <td colSpan={2} className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-700 border-b border-slate-100/60">
                        {Math.abs(diff)} bits ({diffPct}%) — {diffLabel}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Panel>

              <div className="flex flex-col gap-4">
                <Panel title="Frecuencias por simbolo" accent="blue" className="flex-1">
                  <FrequencyChart frequencies={result.frequencies} />
                </Panel>
                <Panel title="Longitud de codigos por simbolo" accent="violet" className="flex-1">
                  <CodeLengthChart huffmanCodes={result.huffman.codes} shannonFanoCodes={result.shannonFano.codes} />
                </Panel>
              </div>
            </div>
          </>
        )}

        {!result && status !== "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <GitCompare size={22} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">Ingrese texto y presione Comparar para ver el analisis</p>
          </div>
        )}
      </div>

      <StatusBar
        status={status}
        message={
          status === "idle"    ? "Ingrese texto para comparar ambos algoritmos"
          : status === "loading" ? "Analizando..."
          : status === "error"   ? errorMsg
          : "Comparacion completada"
        }
      />
    </>
  );
}

import { useState } from "react";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import FrequencyChart from "../components/charts/FrequencyChart";
import CodeLengthChart from "../components/charts/CodeLengthChart";
import { encodeText, encodeFile } from "../services/compressionApi";
import type { EncodeResponse } from "../types/compression";

type Status = "idle" | "loading" | "success" | "error";

export default function ComparePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<EncodeResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = { current: null as HTMLInputElement | null };

  async function handleCompare() {
    if (!text.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await encodeText(text);
      setResult(data);
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

  const diffBits = result
    ? result.huffman.compressedBits - result.shannonFano.compressedBits
    : 0;

  const diffPct = result
    ? Math.abs(
        ((result.huffman.compressedBits - result.shannonFano.compressedBits) /
          result.shannonFano.compressedBits) *
          100
      ).toFixed(2)
    : "0";

  const statusMessage =
    status === "idle"
      ? "Ingrese texto para comparar ambos algoritmos"
      : status === "loading"
      ? "Analizando..."
      : status === "error"
      ? errorMsg
      : "Comparacion completada";

  return (
    <>
      <Topbar title="Comparacion de algoritmos" subtitle="Huffman vs Shannon-Fano" />

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <Panel title="Texto a comparar">
          <div className="flex gap-2 items-end">
            <textarea
              className="flex-1 resize-none border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ingrese texto..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <input
                ref={(r) => { fileRef.current = r; }}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFile}
              />
              <button
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                Cargar .txt
              </button>
              <button
                className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                onClick={handleCompare}
                disabled={status === "loading" || !text.trim()}
              >
                Comparar
              </button>
            </div>
          </div>
        </Panel>

        {result && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tamano original", value: `${result.original.bits} bits`, sub: `${result.original.characters} caracteres` },
                { label: "Huffman comprimido", value: `${result.huffman.compressedBits} bits`, sub: `${result.huffman.compressionRate}% de reduccion` },
                { label: "Shannon-Fano comprimido", value: `${result.shannonFano.compressedBits} bits`, sub: `${result.shannonFano.compressionRate}% de reduccion` },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className="text-xl font-semibold text-slate-800 mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <table className="w-full text-xs text-slate-700">
                  <thead>
                    <tr>
                      <th className="text-left py-1 font-semibold text-slate-500 border-b border-slate-100">Metrica</th>
                      <th className="text-right py-1 font-semibold text-blue-600 border-b border-slate-100">Huffman</th>
                      <th className="text-right py-1 font-semibold text-violet-600 border-b border-slate-100">Shannon-Fano</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Long. promedio", h: `${result.huffman.averageLength}`, sf: `${result.shannonFano.averageLength}` },
                      { label: "Eficiencia", h: `${result.huffman.efficiency}%`, sf: `${result.shannonFano.efficiency}%` },
                      { label: "Bits comprimidos", h: `${result.huffman.compressedBits}`, sf: `${result.shannonFano.compressedBits}` },
                      { label: "Tasa de compresion", h: `${result.huffman.compressionRate}%`, sf: `${result.shannonFano.compressionRate}%` },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-slate-50">
                        <td className="py-1.5 text-slate-600">{row.label}</td>
                        <td className="py-1.5 text-right font-mono text-blue-700">{row.h}</td>
                        <td className="py-1.5 text-right font-mono text-violet-700">{row.sf}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-1.5 text-slate-600">Diferencia en bits</td>
                      <td colSpan={2} className="py-1.5 text-right font-mono text-slate-700">
                        {Math.abs(diffBits)} bits ({diffPct}%)
                        {diffBits < 0 ? " — Huffman mas compacto" : diffBits > 0 ? " — Shannon-Fano mas compacto" : " — igual rendimiento"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-rows-2 gap-4">
                <Panel title="Frecuencias por simbolo">
                  <FrequencyChart frequencies={result.frequencies} />
                </Panel>
                <Panel title="Longitud de codigos por simbolo">
                  <CodeLengthChart huffmanCodes={result.huffman.codes} shannonFanoCodes={result.shannonFano.codes} />
                </Panel>
              </div>
            </div>
          </>
        )}
      </div>

      <StatusBar status={status} message={statusMessage} />
    </>
  );
}

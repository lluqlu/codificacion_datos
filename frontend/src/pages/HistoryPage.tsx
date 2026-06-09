import { useState } from "react";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import { useCompression } from "../app/CompressionContext";
import type { HistoryEntry, EncodeHistoryEntry, DecodeHistoryEntry } from "../types/compression";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatAlgorithm(algorithm: string): string {
  return algorithm === "huffman" ? "Huffman" : "Shannon-Fano";
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function EncodeEntryDetail({ entry }: { entry: EncodeHistoryEntry }) {
  return (
    <div className="flex flex-col gap-3 text-xs text-slate-700">
      <div>
        <p className="font-semibold text-slate-500 mb-1">Texto original</p>
        <p className="font-mono bg-slate-50 rounded p-2 whitespace-pre-wrap break-all max-h-24 overflow-auto">
          {entry.inputText}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-semibold text-blue-600 mb-1">Huffman</p>
          <table className="w-full">
            <tbody>
              <tr><td className="text-slate-500 pr-2">Bits comprimidos</td><td className="font-mono text-right">{entry.result.huffman.compressedBits}</td></tr>
              <tr><td className="text-slate-500 pr-2">Compresion</td><td className="font-mono text-right">{entry.result.huffman.compressionRate}%</td></tr>
              <tr><td className="text-slate-500 pr-2">Eficiencia</td><td className="font-mono text-right">{entry.result.huffman.efficiency}%</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <p className="font-semibold text-violet-600 mb-1">Shannon-Fano</p>
          <table className="w-full">
            <tbody>
              <tr><td className="text-slate-500 pr-2">Bits comprimidos</td><td className="font-mono text-right">{entry.result.shannonFano.compressedBits}</td></tr>
              <tr><td className="text-slate-500 pr-2">Compresion</td><td className="font-mono text-right">{entry.result.shannonFano.compressionRate}%</td></tr>
              <tr><td className="text-slate-500 pr-2">Eficiencia</td><td className="font-mono text-right">{entry.result.shannonFano.efficiency}%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DecodeEntryDetail({ entry }: { entry: DecodeHistoryEntry }) {
  return (
    <div className="flex flex-col gap-3 text-xs text-slate-700">
      <div>
        <p className="font-semibold text-slate-500 mb-1">Codigo binario</p>
        <p className="font-mono bg-slate-50 rounded p-2 break-all max-h-16 overflow-auto">{entry.encoded}</p>
      </div>
      <div>
        <p className="font-semibold text-slate-500 mb-1">Mensaje decodificado</p>
        <p className="font-mono bg-slate-50 rounded p-2 whitespace-pre-wrap break-all max-h-16 overflow-auto">{entry.decoded}</p>
      </div>
    </div>
  );
}

function HistoryRow({ entry, expanded, onToggle }: { entry: HistoryEntry; expanded: boolean; onToggle: () => void }) {
  const isEncode = entry.type === "encode";

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            isEncode ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
          }`}
        >
          {isEncode ? "Codificacion" : "Decodificacion"}
        </span>

        <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(entry.timestamp)}</span>

        {isEncode ? (
          <>
            <span className="text-xs text-slate-600 flex-1 truncate font-mono">
              {truncate((entry as EncodeHistoryEntry).inputText, 60)}
            </span>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {(entry as EncodeHistoryEntry).result.original.characters} car. / {(entry as EncodeHistoryEntry).result.original.bits} bits
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-slate-600 flex-1 truncate">
              {formatAlgorithm((entry as DecodeHistoryEntry).algorithm)} — {truncate((entry as DecodeHistoryEntry).decoded, 50)}
            </span>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {(entry as DecodeHistoryEntry).encoded.length} bits
            </span>
          </>
        )}

        <span className="text-slate-300 flex-shrink-0 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100">
          {isEncode
            ? <EncodeEntryDetail entry={entry as EncodeHistoryEntry} />
            : <DecodeEntryDetail entry={entry as DecodeHistoryEntry} />
          }
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { history, clearHistory } = useCompression();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <Topbar
        title="Historial de sesion"
        subtitle="Operaciones realizadas durante esta sesion"
        actions={
          history.length > 0 && (
            <button
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={clearHistory}
            >
              Limpiar historial
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-4">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No hay operaciones registradas en esta sesion
          </div>
        ) : (
          <Panel>
            <div className="flex flex-col gap-2">
              {history.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() => toggleExpand(entry.id)}
                />
              ))}
            </div>
          </Panel>
        )}
      </div>

      <StatusBar
        status="idle"
        message={history.length === 0 ? "Sin operaciones" : `${history.length} operacion${history.length !== 1 ? "es" : ""} registrada${history.length !== 1 ? "s" : ""}`}
      />
    </>
  );
}

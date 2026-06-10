import { useState, useRef } from "react";
import type { SymbolCode } from "../types/compression";
import { useCompression } from "../app/CompressionContext";
import { generatePDF } from "../services/pdfExport";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import TextInputPanel from "../components/forms/TextInputPanel";
import SymbolCodeTable from "../components/tables/SymbolCodeTable";
import ComparisonTable from "../components/tables/ComparisonTable";
import FrequencyChart from "../components/charts/FrequencyChart";
import HuffmanTreeView from "../components/trees/HuffmanTreeView";
import { encodeText, encodeFile } from "../services/compressionApi";
import type { EncodeResponse } from "../types/compression";

type Status = "idle" | "loading" | "success" | "error";

interface EncodedBlockProps {
  label: string;
  labelColor: string;
  encoded: string;
  codes: SymbolCode[];
}

function buildCodesTable(codes: SymbolCode[]): string {
  return codes.map((c) => `${c.symbol}=${c.code}`).join("\n");
}

function EncodedBlock({ label, labelColor, encoded, codes }: EncodedBlockProps) {
  const [copied, setCopied] = useState<"encoded" | "table" | null>(null);

  function copy(type: "encoded" | "table") {
    const text = type === "encoded" ? encoded : buildCodesTable(codes);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${labelColor}`}>{label}</p>
        <div className="flex gap-1.5">
          <button
            onClick={() => copy("encoded")}
            className="px-2 py-0.5 text-xs border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {copied === "encoded" ? "Copiado" : "Copiar codigo"}
          </button>
          <button
            onClick={() => copy("table")}
            className="px-2 py-0.5 text-xs border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {copied === "table" ? "Copiado" : "Copiar tabla para decodificar"}
          </button>
        </div>
      </div>
      <p className="text-xs font-mono text-slate-700 break-all leading-relaxed bg-slate-50 rounded p-2 max-h-16 overflow-auto">
        {encoded}
      </p>
    </div>
  );
}

function exportCSV(data: EncodeResponse) {
  const hMap = Object.fromEntries(data.huffman.codes.map((c) => [c.symbol, c]));
  const sfMap = Object.fromEntries(data.shannonFano.codes.map((c) => [c.symbol, c]));

  const rows = [
    ["Simbolo", "Frecuencia", "Codigo Huffman", "Long. Huffman", "Codigo Shannon-Fano", "Long. Shannon-Fano"],
    ...data.frequencies.map((f) => [
      f.symbol === " " ? "[espacio]" : f.symbol,
      f.frequency,
      hMap[f.symbol]?.code ?? "",
      hMap[f.symbol]?.length ?? "",
      sfMap[f.symbol]?.code ?? "",
      sfMap[f.symbol]?.length ?? "",
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codificacion_resultados.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function HomePage() {
  const { text, setText, result, setResult, addEncodeEntry } = useCompression();
  const [status, setStatus] = useState<Status>(result ? "success" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generatePDF(result, chartRef, treeRef);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleEncode() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await encodeText(text);
      setResult(data);
      addEncodeEntry(text, data);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al codificar");
      setStatus("error");
    }
  }

  async function handleFileLoad(file: File) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await encodeFile(file);
      setText(data.original.text);
      setResult(data);
      addEncodeEntry(data.original.text, data);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al cargar archivo");
      setStatus("error");
    }
  }

  const statusMessage =
    status === "idle"
      ? "Ingrese texto o cargue un archivo para comenzar"
      : status === "loading"
      ? "Procesando..."
      : status === "error"
      ? errorMsg
      : `Codificacion completada. ${result?.original.characters} caracteres procesados`;

  return (
    <>
      <Topbar
        title="Codificacion de Datos"
        subtitle="Huffman / Shannon-Fano"
        actions={
          result && (
            <>
              <button
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => exportCSV(result)}
              >
                Exportar CSV
              </button>
              <button
                className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? "Generando PDF..." : "Descargar PDF"}
              </button>
            </>
          )
        }
      />

      <div className="flex-1 overflow-auto p-4 grid gap-4" style={{ gridTemplateRows: "180px 1fr 1fr" }}>
        <Panel title="Entrada de texto">
          <TextInputPanel
            value={text}
            onChange={setText}
            onEncode={handleEncode}
            onFileLoad={handleFileLoad}
            loading={status === "loading"}
          />
        </Panel>

        {result && (
          <>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px 1fr" }}>
              <Panel title="Tabla de simbolos y codigos">
                <SymbolCodeTable
                  frequencies={result.frequencies}
                  huffmanCodes={result.huffman.codes}
                  shannonFanoCodes={result.shannonFano.codes}
                />
              </Panel>

              <div ref={treeRef}>
                <Panel title="Arbol de Huffman">
                  <HuffmanTreeView tree={result.huffman.tree} />
                </Panel>
              </div>

              <div ref={chartRef}>
                <Panel title="Grafico de frecuencias">
                  <FrequencyChart frequencies={result.frequencies} />
                </Panel>
              </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Panel title="Resultados y comparacion">
                <ComparisonTable data={result} />
              </Panel>

              <Panel title="Codigos comprimidos generados">
                <div className="flex flex-col gap-4 h-full">
                  <EncodedBlock
                    label="Huffman"
                    labelColor="text-blue-600"
                    encoded={result.huffman.encoded}
                    codes={result.huffman.codes}
                  />
                  <EncodedBlock
                    label="Shannon-Fano"
                    labelColor="text-violet-600"
                    encoded={result.shannonFano.encoded}
                    codes={result.shannonFano.codes}
                  />
                </div>
              </Panel>
            </div>
          </>
        )}

        {!result && status !== "loading" && (
          <div className="flex items-center justify-center text-slate-400 text-sm col-span-full">
            Los resultados apareceran aqui despues de codificar
          </div>
        )}
      </div>

      <StatusBar status={status} message={statusMessage} activeAlgorithm={result ? "Huffman + Shannon-Fano" : undefined} />
    </>
  );
}

import { useState } from "react";
import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";
import { decodeText } from "../services/compressionApi";
import { useCompression } from "../app/CompressionContext";

type Status = "idle" | "loading" | "success" | "error";

export default function DecodePage() {
  const { decode, setDecode, addDecodeEntry } = useCompression();
  const [status, setStatus] = useState<Status>(decode.decoded ? "success" : "idle");
  const [errorMsg, setErrorMsg] = useState("");

  function parseCodes(): { symbol: string; code: string }[] | null {
    const lines = decode.codesText.split("\n").filter((l) => l.includes("="));
    if (lines.length === 0) return null;
    const result: { symbol: string; code: string }[] = [];
    for (const line of lines) {
      const eq = line.indexOf("=");
      const symbol = line.slice(0, eq);
      const code = line.slice(eq + 1).trim();
      if (code === "") return null;
      result.push({ symbol, code });
    }
    return result;
  }

  async function handleDecode() {
    setErrorMsg("");
    setDecode({ decoded: "" });

    const codes = parseCodes();
    if (!codes) {
      setErrorMsg("Formato de tabla invalido. Use el boton 'Copiar tabla para decodificar' desde la vista Inicio, o escriba una entrada por linea con el formato: simbolo=codigo");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const result = await decodeText({ algorithm: decode.algorithm, encoded: decode.encoded.trim(), codes });
      setDecode({ decoded: result.decoded });
      addDecodeEntry(decode.algorithm, decode.encoded.trim(), result.decoded);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Error al decodificar");
      setStatus("error");
    }
  }

  const canSubmit = decode.encoded.trim().length > 0 && decode.codesText.trim().length > 0 && status !== "loading";

  return (
    <>
      <Topbar title="Decodificar" subtitle="Reconstruya el mensaje original desde el codigo binario" />

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <Panel title="Configuracion">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Algoritmo</label>
              <select
                className="border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={decode.algorithm}
                onChange={(e) => setDecode({ algorithm: e.target.value as "huffman" | "shannon_fano" })}
              >
                <option value="huffman">Huffman</option>
                <option value="shannon_fano">Shannon-Fano</option>
              </select>
            </div>
            <button
              className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleDecode}
              disabled={!canSubmit}
            >
              {status === "loading" ? "Decodificando..." : "Decodificar"}
            </button>
            {!decode.encoded.trim() && (
              <span className="text-xs text-slate-400">Falta: codigo binario</span>
            )}
            {decode.encoded.trim() && !decode.codesText.trim() && (
              <span className="text-xs text-slate-400">Falta: tabla de codigos</span>
            )}
          </div>
        </Panel>

        {status === "error" && errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-4 grid-cols-2" style={{ flex: 1 }}>
          <div className="flex flex-col gap-4">
            <Panel title="Codigo binario" className="flex-1">
              <textarea
                className="w-full h-40 resize-none border border-slate-200 rounded-md px-3 py-2 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pegue el codigo binario aqui (solo 0 y 1)..."
                value={decode.encoded}
                onChange={(e) => setDecode({ encoded: e.target.value })}
              />
            </Panel>

            <Panel
              title="Tabla de codigos"
              className="flex-1"
              actions={<span className="text-xs text-slate-400">formato: simbolo=codigo</span>}
            >
              <textarea
                className="w-full h-40 resize-none border border-slate-200 rounded-md px-3 py-2 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={"a=0\nb=10\nc=110\nd=111"}
                value={decode.codesText}
                onChange={(e) => setDecode({ codesText: e.target.value })}
              />
            </Panel>
          </div>

          <Panel title="Mensaje decodificado">
            {status === "success" && decode.decoded ? (
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{decode.decoded}</p>
            ) : (
              <p className="text-sm text-slate-400">
                {status === "loading" ? "Decodificando..." : "El mensaje original aparecera aqui"}
              </p>
            )}
          </Panel>
        </div>
      </div>

      <StatusBar
        status={status}
        message={
          status === "idle" ? "Complete los campos y presione Decodificar"
          : status === "loading" ? "Decodificando..."
          : status === "error" ? errorMsg
          : "Decodificacion completada"
        }
        activeAlgorithm={decode.algorithm === "huffman" ? "Huffman" : "Shannon-Fano"}
      />
    </>
  );
}

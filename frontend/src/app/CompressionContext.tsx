import { createContext, useContext, useState } from "react";
import type { EncodeResponse, HistoryEntry } from "../types/compression";

interface DecodeState {
  algorithm: "huffman" | "shannon_fano";
  encoded: string;
  codesText: string;
  decoded: string;
}

interface CompressionState {
  text: string;
  result: EncodeResponse | null;
  decode: DecodeState;
  history: HistoryEntry[];
  setText: (t: string) => void;
  setResult: (r: EncodeResponse | null) => void;
  setDecode: (d: Partial<DecodeState>) => void;
  addEncodeEntry: (inputText: string, result: EncodeResponse) => void;
  addDecodeEntry: (algorithm: "huffman" | "shannon_fano", encoded: string, decoded: string) => void;
  clearHistory: () => void;
}

const CompressionContext = createContext<CompressionState | null>(null);

const defaultDecode: DecodeState = {
  algorithm: "huffman",
  encoded: "",
  codesText: "",
  decoded: "",
};

export function CompressionProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<EncodeResponse | null>(null);
  const [decode, setDecodeState] = useState<DecodeState>(defaultDecode);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function setDecode(partial: Partial<DecodeState>) {
    setDecodeState((prev) => ({ ...prev, ...partial }));
  }

  function addEncodeEntry(inputText: string, encodeResult: EncodeResponse) {
    setHistory((prev) => [
      { id: crypto.randomUUID(), type: "encode", timestamp: new Date(), inputText, result: encodeResult },
      ...prev,
    ]);
  }

  function addDecodeEntry(algorithm: "huffman" | "shannon_fano", encoded: string, decoded: string) {
    setHistory((prev) => [
      { id: crypto.randomUUID(), type: "decode", timestamp: new Date(), algorithm, encoded, decoded },
      ...prev,
    ]);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <CompressionContext.Provider value={{ text, result, decode, history, setText, setResult, setDecode, addEncodeEntry, addDecodeEntry, clearHistory }}>
      {children}
    </CompressionContext.Provider>
  );
}

export function useCompression(): CompressionState {
  const ctx = useContext(CompressionContext);
  if (!ctx) throw new Error("useCompression must be used inside CompressionProvider");
  return ctx;
}

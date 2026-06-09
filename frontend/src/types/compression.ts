export interface SymbolFrequency {
  symbol: string;
  frequency: number;
}

export interface SymbolCode {
  symbol: string;
  code: string;
  length: number;
}

export interface TreeNode {
  symbol: string | null;
  frequency: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface AlgorithmResult {
  codes: SymbolCode[];
  encoded: string;
  compressedBits: number;
  averageLength: number;
  compressionRate: number;
  efficiency: number;
}

export interface HuffmanResult extends AlgorithmResult {
  tree: TreeNode;
}

export interface EncodeResponse {
  original: {
    text: string;
    characters: number;
    bits: number;
  };
  frequencies: SymbolFrequency[];
  huffman: HuffmanResult;
  shannonFano: AlgorithmResult;
}

export interface DecodeRequest {
  algorithm: "huffman" | "shannon_fano";
  encoded: string;
  codes: { symbol: string; code: string }[];
}

export interface DecodeResponse {
  decoded: string;
}

export interface EncodeOptions {
  caseSensitive: boolean;
  includeSpaces: boolean;
}

export interface EncodeHistoryEntry {
  id: string;
  type: "encode";
  timestamp: Date;
  inputText: string;
  result: EncodeResponse;
}

export interface DecodeHistoryEntry {
  id: string;
  type: "decode";
  timestamp: Date;
  algorithm: "huffman" | "shannon_fano";
  encoded: string;
  decoded: string;
}

export type HistoryEntry = EncodeHistoryEntry | DecodeHistoryEntry;

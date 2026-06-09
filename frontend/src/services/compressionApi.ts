import { post, postForm } from "./apiClient";
import type { EncodeResponse, DecodeRequest, DecodeResponse } from "../types/compression";

export function encodeText(text: string): Promise<EncodeResponse> {
  return post<EncodeResponse>("/compression/encode", { text });
}

export function encodeFile(file: File): Promise<EncodeResponse> {
  const form = new FormData();
  form.append("file", file);
  return postForm<EncodeResponse>("/compression/encode", form);
}

export function decodeText(payload: DecodeRequest): Promise<DecodeResponse> {
  return post<DecodeResponse>("/compression/decode", payload);
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EncodeResponse } from "../types/compression";

type RGB = [number, number, number];

const C: Record<string, RGB> = {
  dark:   [15,  23,  42],
  mid:    [30,  41,  59],
  slate:  [100, 116, 139],
  border: [226, 232, 240],
  light:  [241, 245, 249],
  white:  [255, 255, 255],
  blue:   [59,  130, 246],
  violet: [124, 58,  237],
  accent: [96,  165, 250],
};

async function svgToPng(svgEl: SVGSVGElement, w: number, h: number): Promise<string> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));

  const str = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

function getSvg(container: HTMLElement | null): SVGSVGElement | null {
  return container?.querySelector("svg") ?? null;
}

function sectionTitle(doc: jsPDF, text: string, y: number, margin: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text(text, margin, y);
}

function pageBreakIfNeeded(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 272) {
    doc.addPage();
    return 14;
  }
  return y;
}

export async function generatePDF(
  data: EncodeResponse,
  chartRef: React.RefObject<HTMLDivElement | null>,
  treeRef: React.RefObject<HTMLDivElement | null>
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Header ───────────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 40, "F");

  doc.setFillColor(...C.blue);
  doc.rect(0, 36, W, 4, "F");

  doc.setFillColor(...C.mid);
  doc.rect(0, 0, 3, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.white);
  doc.text("Reporte de Codificacion", margin + 2, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.accent);
  doc.text("Huffman / Shannon-Fano", margin + 2, 22);

  doc.setTextColor(...C.slate);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString("es-AR"), margin + 2, 29);

  // Info on right side of header
  const rightX = W - margin;
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  const preview = data.original.text.length > 55
    ? data.original.text.slice(0, 55) + "..."
    : data.original.text;
  doc.text(`"${preview}"`, rightX, 14, { align: "right" });
  doc.setTextColor(...C.slate);
  doc.setFontSize(8);
  doc.text(`${data.original.characters} caracteres  |  ${data.original.bits} bits originales`, rightX, 21, { align: "right" });

  y = 48;

  // ── Stats cards ──────────────────────────────────────────────────────────
  const cardW = (contentW - 8) / 3;
  const stats = [
    { label: "Tamano original",  value: `${data.original.bits} bits`,         sub: `${data.original.characters} caracteres`, color: C.slate },
    { label: "Huffman",          value: `${data.huffman.compressedBits} bits`, sub: `-${data.huffman.compressionRate}% de reduccion`, color: C.blue },
    { label: "Shannon-Fano",     value: `${data.shannonFano.compressedBits} bits`, sub: `-${data.shannonFano.compressionRate}% de reduccion`, color: C.violet },
  ];

  stats.forEach((card, i) => {
    const x = margin + i * (cardW + 4);
    doc.setFillColor(...C.light);
    doc.roundedRect(x, y, cardW, 22, 2, 2, "F");
    doc.setDrawColor(...(card.color as RGB));
    doc.setLineWidth(0.8);
    doc.line(x + 0.4, y + 2, x + 0.4, y + 20);
    doc.setLineWidth(0.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.slate);
    doc.text(card.label, x + 4, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.dark);
    doc.text(card.value, x + 4, y + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...(card.color as RGB));
    doc.text(card.sub, x + 4, y + 20);
  });

  y += 30;

  // ── Symbol codes table ───────────────────────────────────────────────────
  sectionTitle(doc, "Tabla de simbolos y codigos", y, margin);
  y += 5;

  const hMap = Object.fromEntries(data.huffman.codes.map((c) => [c.symbol, c]));
  const sfMap = Object.fromEntries(data.shannonFano.codes.map((c) => [c.symbol, c]));

  autoTable(doc, {
    startY: y,
    head: [["Simbolo", "Frec.", "Codigo Huffman", "Lon.", "Codigo Shannon-Fano", "Lon."]],
    body: data.frequencies.map((f) => [
      f.symbol === " " ? "[espacio]" : f.symbol,
      String(f.frequency),
      hMap[f.symbol]?.code ?? "-",
      String(hMap[f.symbol]?.length ?? "-"),
      sfMap[f.symbol]?.code ?? "-",
      String(sfMap[f.symbol]?.length ?? "-"),
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: C.dark as RGB, textColor: [255, 255, 255] as RGB, fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 22 },
      1: { halign: "right", cellWidth: 14 },
      2: { textColor: C.blue as RGB, font: "courier", cellWidth: 50 },
      3: { halign: "right", cellWidth: 12 },
      4: { textColor: C.violet as RGB, font: "courier", cellWidth: 50 },
      5: { halign: "right", cellWidth: 12 },
    },
    alternateRowStyles: { fillColor: C.light as RGB },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Comparison table ─────────────────────────────────────────────────────
  y = pageBreakIfNeeded(doc, y, 50);
  sectionTitle(doc, "Comparacion de metricas", y, margin);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Metrica", "Huffman", "Shannon-Fano"]],
    body: [
      ["Tamano original",          `${data.original.bits} bits`,               `${data.original.bits} bits`],
      ["Tamano comprimido",        `${data.huffman.compressedBits} bits`,       `${data.shannonFano.compressedBits} bits`],
      ["Tasa de compresion",       `${data.huffman.compressionRate}%`,          `${data.shannonFano.compressionRate}%`],
      ["Long. promedio de codigo", `${data.huffman.averageLength} bits/simb.`,  `${data.shannonFano.averageLength} bits/simb.`],
      ["Eficiencia",               `${data.huffman.efficiency}%`,               `${data.shannonFano.efficiency}%`],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: C.dark as RGB, textColor: [255, 255, 255] as RGB, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { textColor: C.blue as RGB, fontStyle: "bold", halign: "right" },
      2: { textColor: C.violet as RGB, fontStyle: "bold", halign: "right" },
    },
    alternateRowStyles: { fillColor: C.light as RGB },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Charts & tree images ─────────────────────────────────────────────────
  const chartSvg = getSvg(chartRef.current);
  const treeSvg  = getSvg(treeRef.current);

  if (chartSvg || treeSvg) {
    y = pageBreakIfNeeded(doc, y, 70);
    sectionTitle(doc, "Visualizaciones", y, margin);
    y += 6;

    const imgH  = 58;
    const halfW = (contentW - 5) / 2;

    if (chartSvg) {
      try {
        const rect = chartSvg.getBoundingClientRect();
        const png = await svgToPng(chartSvg, rect.width || 500, rect.height || 220);
        doc.setFillColor(...C.light);
        doc.roundedRect(margin, y, halfW, imgH + 8, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.slate);
        doc.text("Frecuencias por simbolo", margin + 3, y + 5);
        doc.addImage(png, "PNG", margin + 2, y + 7, halfW - 4, imgH);
      } catch { /* skip if capture fails */ }
    }

    if (treeSvg) {
      try {
        const rect = treeSvg.getBoundingClientRect();
        const png  = await svgToPng(treeSvg, rect.width || 320, rect.height || 220);
        const treeX = margin + halfW + 5;
        doc.setFillColor(...C.light);
        doc.roundedRect(treeX, y, halfW, imgH + 8, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.slate);
        doc.text("Arbol de Huffman", treeX + 3, y + 5);
        doc.addImage(png, "PNG", treeX + 2, y + 7, halfW - 4, imgH);
      } catch { /* skip if capture fails */ }
    }

    y += imgH + 16;
  }

  // ── Compressed codes ─────────────────────────────────────────────────────
  y = pageBreakIfNeeded(doc, y, 50);
  sectionTitle(doc, "Codigos comprimidos generados", y, margin);
  y += 6;

  const maxLen = 110;

  for (const { label, color, code } of [
    { label: "Huffman",      color: C.blue,   code: data.huffman.encoded },
    { label: "Shannon-Fano", color: C.violet, code: data.shannonFano.encoded },
  ]) {
    doc.setFillColor(...C.light);
    doc.roundedRect(margin, y, contentW, 20, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...(color as RGB));
    doc.text(label, margin + 3, y + 6);

    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.dark);
    const display = code.length > maxLen ? code.slice(0, maxLen) + `... (+${code.length - maxLen} bits)` : code;
    doc.text(display, margin + 3, y + 14);
    y += 25;
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.dark);
    doc.rect(0, 287, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.slate);
    doc.text("Codificacion de Datos  —  Huffman / Shannon-Fano", margin, 293);
    doc.text(`${i} / ${totalPages}`, W - margin, 293, { align: "right" });
  }

  doc.save(`reporte_codificacion_${Date.now()}.pdf`);
}

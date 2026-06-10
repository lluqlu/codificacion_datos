import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";

const metrics = [
  ["Tamano original",   "cantidad de caracteres por 8 bits"],
  ["Tamano comprimido", "suma de las longitudes de codigo de cada caracter"],
  ["Tasa de compresion","porcentaje de reduccion respecto al original"],
  ["Longitud promedio", "promedio ponderado de longitudes de codigo"],
  ["Eficiencia",        "cociente entre la entropia de Shannon y la longitud promedio"],
];

const frontendStack = [
  "React con TypeScript", "Vite", "Tailwind CSS", "Recharts",
  "SVG propio para arbol de Huffman", "React Router", "jsPDF + jspdf-autotable", "lucide-react",
];

const backendStack = [
  "Python 3.10+", "Flask", "Flask-CORS",
  "heapq (cola de prioridad para Huffman)",
  "Arquitectura por capas (controllers, services, domain)", "pytest",
];

export default function AboutPage() {
  return (
    <>
      <Topbar title="Acerca de" subtitle="Informacion" />

      <div className="flex-1 overflow-auto page-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Panel title="Que hace esta aplicacion">
            <p className="text-[13px] leading-relaxed" style={{ color: "#4b5563" }}>
              Esta aplicacion permite comprimir y descomprimir mensajes o archivos de texto usando
              los algoritmos de Huffman y Shannon-Fano. Calcula frecuencias de simbolos, genera
              codigos binarios optimos y compara los resultados de compresion entre ambos metodos.
              Tambien visualiza el arbol binario de Huffman, muestra graficos de frecuencias y
              longitudes de codigos, y permite exportar los resultados en CSV y PDF.
            </p>
          </Panel>

          <Panel title="Codificacion de Huffman">
            <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed" style={{ color: "#4b5563" }}>
              <p>
                La codificacion de Huffman asigna codigos binarios de longitud variable a cada simbolo
                segun su frecuencia. Los simbolos mas frecuentes reciben codigos mas cortos.
              </p>
              <p>
                El algoritmo construye un arbol binario con una cola de prioridad: en cada paso une
                los dos nodos de menor frecuencia. Los codigos se generan recorriendo el arbol desde
                la raiz a cada hoja. Produce codigos de prefijo libre, garantizando decodificacion
                sin ambiguedades.
              </p>
            </div>
          </Panel>

          <Panel title="Codificacion de Shannon-Fano">
            <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed" style={{ color: "#4b5563" }}>
              <p>
                El algoritmo de Shannon-Fano ordena los simbolos de mayor a menor frecuencia y los
                divide recursivamente en dos grupos cuya suma de frecuencias sea lo mas equilibrada
                posible.
              </p>
              <p>
                A cada grupo se le asigna un bit (0 o 1) y el proceso se repite en cada subgrupo.
                Aunque produce resultados similares a Huffman, no garantiza ser optimo en todos los
                casos.
              </p>
            </div>
          </Panel>

          <Panel title="Metricas comparadas">
            <ul className="flex flex-col gap-2">
              {metrics.map(([term, def]) => (
                <li key={term} className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-semibold" style={{ color: "#374151" }}>{term}</span>
                  <span className="text-[12px]" style={{ color: "#6b7280" }}>{def}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tecnologias — Frontend">
            <ul className="flex flex-col gap-1.5">
              {frontendStack.map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13px]" style={{ color: "#4b5563" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#3b82f6" }} />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tecnologias — Backend">
            <ul className="flex flex-col gap-1.5">
              {backendStack.map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13px]" style={{ color: "#4b5563" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#8b5cf6" }} />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>

        </div>
      </div>

      <StatusBar status="idle" message="Codificacion de Datos" />
    </>
  );
}

import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";

export default function AboutPage() {
  return (
    <>
      <Topbar title="Acerca de" subtitle="Informacion" />

      <div className="flex-1 overflow-auto p-5 grid grid-cols-2 gap-4">
        <Panel title="Que hace esta aplicacion" accent="blue">
          <p className="text-sm text-slate-600 leading-relaxed">
            Esta aplicacion permite comprimir y descomprimir mensajes o archivos de texto usando
            los algoritmos de Huffman y Shannon-Fano. Calcula frecuencias de simbolos, genera
            codigos binarios optimos y compara los resultados de compresion entre ambos metodos.
            Tambien visualiza el arbol binario de Huffman, muestra graficos de frecuencias y
            longitudes de codigos, y permite exportar los resultados en CSV y PDF.
          </p>
        </Panel>

        <Panel title="Codificacion de Huffman" accent="blue">
          <div className="flex flex-col gap-2 text-sm text-slate-600 leading-relaxed">
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

        <Panel title="Codificacion de Shannon-Fano" accent="violet">
          <div className="flex flex-col gap-2 text-sm text-slate-600 leading-relaxed">
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

        <Panel title="Metricas comparadas" accent="violet">
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            {[
              ["Tamano original",         "cantidad de caracteres por 8 bits"],
              ["Tamano comprimido",        "suma de las longitudes de codigo de cada caracter"],
              ["Tasa de compresion",       "porcentaje de reduccion respecto al original"],
              ["Longitud promedio",        "promedio ponderado de longitudes de codigo"],
              ["Eficiencia",              "cociente entre la entropia de Shannon y la longitud promedio"],
            ].map(([term, def]) => (
              <li key={term} className="flex gap-2">
                <span className="font-semibold text-slate-700 flex-shrink-0">{term}:</span>
                <span>{def}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tecnologias — Frontend" accent="slate">
          <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
            {["React con TypeScript", "Vite", "Tailwind CSS", "Recharts", "SVG propio para arbol de Huffman", "React Router", "jsPDF + jspdf-autotable", "lucide-react"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tecnologias — Backend" accent="slate">
          <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
            {["Python 3.10+", "Flask", "Flask-CORS", "heapq (cola de prioridad para Huffman)", "Arquitectura por capas (controllers, services, domain)", "pytest"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <StatusBar status="idle" message="Codificacion de Datos" />
    </>
  );
}

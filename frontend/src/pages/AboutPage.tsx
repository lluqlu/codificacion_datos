import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";

export default function AboutPage() {
  return (
    <>
      <Topbar title="Acerca de" subtitle="Informacion sobre la aplicacion y los algoritmos" />

      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4">
        <Panel title="Que hace esta aplicacion">
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <p>
              Esta aplicacion permite comprimir y descomprimir mensajes o archivos de texto usando
              los algoritmos de Huffman y Shannon-Fano. Calcula frecuencias de simbolos, genera
              codigos binarios optimos para cada algoritmo y compara los resultados de compresion.
            </p>
            <p>
              Tambien visualiza el arbol binario de Huffman, muestra graficos de frecuencias y
              longitudes de codigos, y permite exportar los resultados en formato CSV.
            </p>
          </div>
        </Panel>

        <Panel title="Codificacion de Huffman">
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <p>
              La codificacion de Huffman es un algoritmo de compresion sin perdida que asigna
              codigos binarios de longitud variable a cada simbolo segun su frecuencia de
              aparicion. Los simbolos mas frecuentes reciben codigos mas cortos.
            </p>
            <p>
              El algoritmo construye un arbol binario usando una cola de prioridad: en cada paso
              toma los dos nodos de menor frecuencia y los une en un nuevo nodo padre. Los codigos
              se generan recorriendo el arbol de la raiz a cada hoja.
            </p>
            <p>
              Huffman produce codigos de prefijo libre, lo que garantiza que ningun codigo sea
              prefijo de otro y permite la decodificacion sin ambiguedades.
            </p>
          </div>
        </Panel>

        <Panel title="Codificacion de Shannon-Fano">
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <p>
              El algoritmo de Shannon-Fano es otro metodo de compresion sin perdida basado en
              frecuencias. Ordena los simbolos de mayor a menor frecuencia y los divide
              recursivamente en dos grupos cuya suma de frecuencias sea lo mas equilibrada posible.
            </p>
            <p>
              A cada grupo se le asigna un bit (0 o 1) y el proceso se repite recursivamente en
              cada subgrupo. Aunque produce resultados similares a Huffman, no garantiza ser
              optimo en todos los casos.
            </p>
          </div>
        </Panel>

        <Panel title="Metricas comparadas">
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <ul className="flex flex-col gap-1 list-disc list-inside pl-1">
              <li><span className="font-medium">Tamano original:</span> cantidad de caracteres por 8 bits</li>
              <li><span className="font-medium">Tamano comprimido:</span> suma de las longitudes de codigo de cada caracter</li>
              <li><span className="font-medium">Tasa de compresion:</span> porcentaje de reduccion respecto al original</li>
              <li><span className="font-medium">Longitud promedio:</span> promedio ponderado de longitudes de codigo</li>
              <li><span className="font-medium">Eficiencia:</span> cociente entre la entropia de Shannon y la longitud promedio</li>
            </ul>
          </div>
        </Panel>

        <Panel title="Tecnologias utilizadas" className="col-span-2">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-600 mb-1">Frontend</p>
              <ul className="list-disc list-inside pl-1 flex flex-col gap-0.5">
                <li>React con TypeScript</li>
                <li>Vite como bundler y servidor de desarrollo</li>
                <li>Tailwind CSS para estilos</li>
                <li>Recharts para graficos de barras</li>
                <li>SVG propio para visualizacion del arbol de Huffman</li>
                <li>React Router para navegacion</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-600 mb-1">Backend</p>
              <ul className="list-disc list-inside pl-1 flex flex-col gap-0.5">
                <li>Python 3.10+</li>
                <li>Flask como framework HTTP</li>
                <li>Flask-CORS para habilitar solicitudes desde el frontend</li>
                <li>heapq para la cola de prioridad de Huffman</li>
                <li>Arquitectura por capas: controllers, services, domain, schemas, utils</li>
                <li>pytest para tests unitarios</li>
              </ul>
            </div>
          </div>
        </Panel>
      </div>

      <StatusBar status="idle" message="Codificacion de Datos" />
    </>
  );
}

import Topbar from "../components/layout/Topbar";
import StatusBar from "../components/layout/StatusBar";
import Panel from "../components/cards/Panel";

export default function BitmapPage() {
  return (
    <>
      <Topbar title="Imagenes y mapas de bits" subtitle="Compresion de imagenes en blanco y negro" />

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <Panel title="Estado de la funcionalidad">
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <p>
              Esta vista esta preparada para incorporar compresion de imagenes en blanco y negro
              usando Huffman y Shannon-Fano.
            </p>
            <p>El flujo previsto es:</p>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-slate-700 pl-2">
              <li>Cargar una imagen en blanco y negro (BMP, PNG de 1 bit o mapa de bits simple)</li>
              <li>Convertir los pixeles a una secuencia de simbolos (0 y 1, o bloques de N x N)</li>
              <li>Calcular las frecuencias de los bloques de pixeles</li>
              <li>Aplicar Huffman y Shannon-Fano sobre esa frecuencia</li>
              <li>Mostrar la comparacion de compresion resultante</li>
            </ol>
            <p className="text-slate-400 text-xs mt-2">
              La implementacion estara disponible en la proxima version. El backend ya dispone de la
              estructura de servicios necesaria para conectar esta vista.
            </p>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-4 opacity-40 pointer-events-none select-none">
          <Panel title="Cargar imagen">
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 rounded-md text-slate-400 text-sm">
              Carga de imagen no disponible aun
            </div>
          </Panel>
          <Panel title="Resultado de compresion">
            <div className="text-sm text-slate-400">Los resultados apareceran aqui</div>
          </Panel>
        </div>
      </div>

      <StatusBar status="idle" message="Funcionalidad en preparacion" />
    </>
  );
}

# Frontend — Codificacion de Datos

SPA construida con React + Vite + TypeScript. Consume la API del backend y visualiza los resultados de compresion Huffman y Shannon-Fano.

## Estructura

```
frontend/
├── index.html                         # Punto de entrada HTML, manifest PWA, meta tags iOS
├── public/
│   ├── favicon.svg                    # Icono de la app (documento + arbol Huffman)
│   ├── icon-192.png / icon-512.png    # Iconos PWA para Android
│   ├── apple-touch-icon.png           # Icono para iOS (Agregar a pantalla de inicio)
│   └── manifest.json                  # Configuracion PWA (nombre, colores, iconos)
└── src/
    ├── main.tsx                       # Monta <App /> en el DOM
    ├── styles/global.css              # Variables CSS, reset, clases utilitarias del layout
    │
    ├── app/
    │   ├── App.tsx                    # RouterProvider + CompressionProvider
    │   ├── routes.tsx                 # createBrowserRouter: definicion de todas las rutas
    │   ├── CompressionContext.tsx     # Estado global: texto, resultado, decode, historial
    │   └── SidebarContext.tsx         # Estado open/close del drawer en mobile
    │
    ├── pages/
    │   ├── HomePage.tsx               # Vista principal: input, KPIs, arbol, graficos, tablas
    │   ├── DecodePage.tsx             # Decodificacion: codigo binario + tabla de codigos
    │   ├── ComparePage.tsx            # Comparacion lado a lado Huffman vs Shannon-Fano
    │   ├── HistoryPage.tsx            # Historial de operaciones de la sesion
    │   ├── BitmapPage.tsx             # Prototipo: imagenes / mapas de bits
    │   ├── AboutPage.tsx              # Informacion del proyecto
    │   └── EncodePage.tsx             # Redirige a /
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx          # Shell: sidebar + <Outlet />
    │   │   ├── Sidebar.tsx            # Navegacion con useNavigate (no <Link>)
    │   │   ├── Topbar.tsx             # Barra superior con titulo, subtitulo y acciones
    │   │   └── StatusBar.tsx          # Barra inferior con estado de la operacion activa
    │   ├── cards/
    │   │   └── Panel.tsx              # Contenedor con titulo, borde y padding uniforme
    │   ├── forms/
    │   │   └── TextInputPanel.tsx     # Textarea + boton codificar + carga de archivo
    │   ├── charts/
    │   │   ├── FrequencyChart.tsx     # Barras de frecuencia por simbolo (Recharts)
    │   │   └── CodeLengthChart.tsx    # Longitud de codigos Huffman vs Shannon-Fano (Recharts)
    │   ├── tables/
    │   │   ├── SymbolCodeTable.tsx    # Simbolo, frecuencia, codigo Huffman y Shannon-Fano
    │   │   └── ComparisonTable.tsx    # Metricas comparativas entre ambos algoritmos
    │   └── trees/
    │       └── HuffmanTreeView.tsx    # Arbol de Huffman interactivo (SVG, zoom + pan)
    │
    ├── services/
    │   ├── apiClient.ts               # fetch base: post() y postForm(), lee VITE_API_URL
    │   ├── compressionApi.ts          # encodeText(), encodeFile(), decodeText()
    │   └── pdfExport.ts               # Genera PDF con jsPDF: metricas, tabla, graficos, arbol
    │
    └── types/
        └── compression.ts             # Tipos TypeScript: EncodeResponse, TreeNode, HistoryEntry, etc.
```

## Paginas

| Ruta | Archivo | Descripcion |
|------|---------|-------------|
| `/` | `HomePage.tsx` | Codificacion principal |
| `/decodificar` | `DecodePage.tsx` | Decodificacion desde cadena binaria |
| `/comparar` | `ComparePage.tsx` | Comparacion Huffman vs Shannon-Fano |
| `/historial` | `HistoryPage.tsx` | Historial de la sesion en memoria |
| `/imagenes` | `BitmapPage.tsx` | Prototipo de mapas de bits |
| `/acerca` | `AboutPage.tsx` | Informacion del proyecto |

## Estado global — `CompressionContext`

Un unico contexto mantiene el estado compartido entre paginas:

- `text` / `result` — texto de entrada y resultado de la ultima codificacion.
- `decode` — estado de la vista decodificar (algoritmo, cadena binaria, tabla, resultado).
- `history` — lista de operaciones encode/decode de la sesion (solo en memoria, se pierde al recargar).

Las paginas `/comparar` y `/decodificar` manejan su propio estado local; solo `/` y `/decodificar` escriben al historial compartido.

## Visualizaciones

### Arbol de Huffman — `HuffmanTreeView.tsx`

SVG generado dinamicamente a partir del `TreeNode` que devuelve el backend. Soporta zoom con rueda del mouse y pan con drag. Calcula un scale inicial para que el arbol entre en el contenedor sin importar su tamano.

Incluye un segundo SVG oculto (`data-tree-export`) con el arbol a tamano natural, usado exclusivamente por el exportador de PDF para capturar el arbol completo independientemente del zoom actual.

### Graficos — `FrequencyChart` / `CodeLengthChart`

Construidos con Recharts. `FrequencyChart` muestra barras de frecuencia absoluta por simbolo. `CodeLengthChart` compara la longitud del codigo de cada simbolo entre Huffman y Shannon-Fano.

## Exportacion — `pdfExport.ts`

Genera un PDF A4 con jsPDF que incluye:
- Header con preview del texto y tamano original.
- Cards de KPIs (original, Huffman, Shannon-Fano).
- Tabla completa de simbolos y codigos (jspdf-autotable).
- Tabla de metricas comparativas.
- Imagen del grafico de frecuencias y del arbol de Huffman.
- Cadenas codificadas en binario (truncadas si son muy largas).

El CSV se genera directamente en el navegador desde `HomePage` sin dependencias externas.

## Variables de entorno

```
VITE_API_URL=https://tu-backend.example.com/api
```

Sin esta variable el cliente apunta a `/api` (util en desarrollo con proxy de Vite).

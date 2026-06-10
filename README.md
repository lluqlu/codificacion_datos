# Codificacion de Datos

Aplicacion web interactiva para comprimir y descomprimir texto usando los algoritmos **Huffman** y **Shannon-Fano**. Permite ingresar texto libre o cargar archivos `.txt`, visualizar el arbol de Huffman, comparar metricas reales entre ambos algoritmos y exportar los resultados.

**Demo:** [codificacion.lluqlu.com](https://codificacion.lluqlu.com)
**API:** [api-codificacion.lluqlu.com](https://api-codificacion.lluqlu.com)

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Stack tecnico](#stack-tecnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Algoritmos implementados](#algoritmos-implementados)
- [API](#api)
- [Instalacion y arranque local](#instalacion-y-arranque-local)
- [Manual de usuario](#manual-de-usuario)
  - [Vista Codificar](#vista-codificar)
  - [Vista Decodificar](#vista-decodificar)
  - [Vista Comparar](#vista-comparar)
  - [Vista Imagenes / Mapas de bits](#vista-imagenes--mapas-de-bits)
  - [Vista Acerca de](#vista-acerca-de)
- [Exportacion de resultados](#exportacion-de-resultados)
- [Validaciones](#validaciones)
- [Tests](#tests)

---

## Descripcion general

El sistema procesa texto caracter a caracter, calcula la frecuencia real de cada simbolo y aplica ambos algoritmos de codificacion entropica. Los resultados se muestran en tiempo real: tabla de codigos, arbol binario interactivo, grafico de frecuencias, metricas comparativas y el texto codificado en binario.

No hay datos hardcodeados. Todo lo que se muestra se genera a partir del texto que el usuario ingresa o carga.

---

## Stack tecnico

### Frontend

| Tecnologia       | Version  | Rol                                   |
|------------------|----------|---------------------------------------|
| React            | 19       | UI                                    |
| Vite             | 8        | Bundler y dev server                  |
| TypeScript       | 6        | Tipado estatico                       |
| Tailwind CSS     | 4        | Utilitarios de estilo                 |
| Recharts         | 3        | Graficos de frecuencias               |
| React Router DOM | 7        | Navegacion SPA                        |
| jsPDF            | 4        | Exportacion a PDF                     |
| Lucide React     | 1        | Iconografia                           |

### Backend

| Tecnologia  | Version | Rol                        |
|-------------|---------|----------------------------|
| Python      | 3.x     | Lenguaje principal         |
| Flask       | 3.1     | Framework HTTP             |
| Flask-CORS  | 5       | Politica de origenes       |
| heapq       | stdlib  | Cola de prioridad Huffman  |

---

## Estructura del proyecto

```
codificacion_datos/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── controllers/
│   │   │   ├── compression_controller.py
│   │   │   └── health_controller.py
│   │   ├── domain/
│   │   │   ├── huffman.py         # Algoritmo Huffman con heapq
│   │   │   ├── shannon_fano.py    # Algoritmo Shannon-Fano recursivo
│   │   │   ├── frequencies.py     # Calculo de frecuencias
│   │   │   ├── metrics.py         # Metricas comparativas
│   │   │   └── models.py          # Tipos de dominio (TreeNode, SymbolCode)
│   │   ├── services/
│   │   │   ├── compression_service.py
│   │   │   └── file_service.py
│   │   ├── schemas/
│   │   │   └── compression_schema.py
│   │   ├── utils/
│   │   │   ├── validators.py
│   │   │   └── bit_utils.py
│   │   └── routes/
│   │       ├── compression_routes.py
│   │       └── health_routes.py
│   ├── tests/
│   │   ├── test_huffman.py
│   │   ├── test_shannon_fano.py
│   │   └── test_metrics.py
│   ├── run.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   ├── App.tsx
        │   └── routes.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Topbar.tsx
        │   │   └── StatusBar.tsx
        │   ├── cards/
        │   │   └── Panel.tsx
        │   ├── tables/
        │   │   ├── SymbolCodeTable.tsx
        │   │   └── ComparisonTable.tsx
        │   ├── charts/
        │   │   └── FrequencyChart.tsx
        │   ├── trees/
        │   │   └── HuffmanTreeView.tsx
        │   └── forms/
        │       └── TextInputPanel.tsx
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── DecodePage.tsx
        │   ├── ComparePage.tsx
        │   ├── BitmapPage.tsx
        │   └── AboutPage.tsx
        ├── services/
        │   ├── apiClient.ts
        │   └── compressionApi.ts
        ├── types/
        │   └── compression.ts
        └── styles/
            └── global.css
```

---

## Algoritmos implementados

### Huffman

Implementacion basada en cola de prioridad (`heapq`). Construye un arbol binario optimo donde los simbolos mas frecuentes reciben codigos mas cortos.

Pasos:
1. Calcular frecuencias de cada simbolo en el texto.
2. Insertar cada simbolo como nodo hoja en la cola de prioridad.
3. Extraer los dos nodos de menor frecuencia, combinarlos en un nodo padre y reinsertar.
4. Repetir hasta que quede un unico nodo raiz.
5. Recorrer el arbol asignando `0` al ir a la izquierda y `1` a la derecha.

Caso borde: texto con un unico simbolo distinto — se genera un arbol de un solo nivel con codigo `0`.

### Shannon-Fano

Implementacion recursiva con particion equilibrada por frecuencias.

Pasos:
1. Ordenar simbolos de mayor a menor frecuencia.
2. Encontrar el punto de particion que minimiza la diferencia de suma de frecuencias entre ambas mitades.
3. Asignar `0` al grupo superior y `1` al inferior.
4. Repetir recursivamente en cada subgrupo hasta que cada grupo tenga un unico simbolo.

### Metricas calculadas

| Metrica                    | Descripcion                                                              |
|----------------------------|--------------------------------------------------------------------------|
| Bits originales            | `caracteres x 8` (ASCII plano)                                           |
| Bits comprimidos           | Suma de `frecuencia x longitud de codigo` para cada simbolo              |
| Tasa de compresion         | `(1 - bits_comprimidos / bits_originales) x 100`                         |
| Longitud promedio          | `suma(frecuencia_relativa x longitud_codigo)`                            |
| Eficiencia                 | `entropia de Shannon / longitud promedio x 100`                          |

---

## API

El backend expone tres endpoints REST en `http://localhost:5000`.

### `GET /api/health`

Comprueba que el servidor esta activo.

```json
{ "status": "ok" }
```

---

### `POST /api/compression/encode`

Codifica un texto con Huffman y Shannon-Fano simultaneamente.

**Request:**

```json
{
  "text": "Hola mundo",
  "options": {
    "caseSensitive": true,
    "includeSpaces": true
  }
}
```

**Response (estructura simplificada):**

```json
{
  "original": {
    "text": "Hola mundo",
    "characters": 10,
    "bits": 80
  },
  "frequencies": [
    { "symbol": "o", "frequency": 2 }
  ],
  "huffman": {
    "codes": [{ "symbol": "o", "code": "10", "length": 2 }],
    "encoded": "10110...",
    "compressedBits": 32,
    "averageLength": 2.4,
    "compressionRate": 60.0,
    "efficiency": 85.0,
    "tree": { "symbol": null, "frequency": 10, "left": {}, "right": {} }
  },
  "shannonFano": {
    "codes": [{ "symbol": "o", "code": "10", "length": 2 }],
    "encoded": "10101...",
    "compressedBits": 35,
    "averageLength": 2.7,
    "compressionRate": 56.25,
    "efficiency": 81.0
  }
}
```

---

### `POST /api/compression/decode`

Decodifica una cadena binaria dada una tabla de codigos y el algoritmo utilizado.

**Request:**

```json
{
  "algorithm": "huffman",
  "encoded": "1010100011",
  "codes": [
    { "symbol": "a", "code": "10" },
    { "symbol": "b", "code": "0" },
    { "symbol": "c", "code": "11" }
  ]
}
```

**Response:**

```json
{ "decoded": "mensaje original" }
```

---

## Instalacion y arranque local

### Requisitos previos

- Python 3.10 o superior
- Node.js 20 o superior
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt
python3 run.py
```

El servidor queda disponible en `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

> Ambos procesos deben estar corriendo al mismo tiempo para que el frontend pueda comunicarse con el backend.

---

## Manual de usuario

### Vista Codificar

Es la vista principal de la aplicacion. Se accede desde el primer item de la barra lateral.

**Pasos basicos:**

1. **Escribir o pegar texto** en el area de entrada. El contador en la esquina superior derecha del panel muestra en tiempo real la cantidad de caracteres y bits sin comprimir.

2. **Cargar desde archivo** usando el boton "Abrir .txt". Solo se aceptan archivos de texto plano con extension `.txt`.

3. **Presionar "Codificar"**. El sistema envia el texto al backend, aplica Huffman y Shannon-Fano y muestra los resultados.

**Que se muestra luego de codificar:**

| Panel                  | Contenido                                                                 |
|------------------------|---------------------------------------------------------------------------|
| KPI cards (fila superior) | Cantidad de caracteres, bits Huffman, bits Shannon-Fano, eficiencia de cada algoritmo y total de simbolos unicos |
| Simbolos y codigos     | Tabla con cada simbolo, su frecuencia, porcentaje y los codigos binarios asignados por cada algoritmo |
| Arbol de Huffman       | Visualizacion interactiva del arbol binario. Los nodos hoja (simbolos) aparecen en azul solido. Se puede hacer clic y arrastrar para mover el arbol. |
| Frecuencias            | Grafico de barras con la frecuencia de cada simbolo                       |
| Comparacion de metricas| Tabla con todos los valores comparativos entre Huffman y Shannon-Fano. El valor ganador en cada fila se resalta. |
| Codigos generados      | Cadena binaria completa producida por cada algoritmo, con opcion de copiar al portapapeles |

**Acciones disponibles en la barra superior:**

- **CSV** — descarga una tabla con simbolos, frecuencias y codigos de ambos algoritmos.
- **PDF** — genera un documento con graficos, arbol, tablas y metricas.

---

### Vista Decodificar

Permite reconstruir el texto original a partir de una cadena binaria y una tabla de codigos.

**Pasos:**

1. Seleccionar el algoritmo que se uso para codificar: Huffman o Shannon-Fano.
2. Pegar la cadena binaria comprimida en el campo correspondiente.
3. Ingresar o pegar la tabla de codigos (pares simbolo-codigo necesarios para decodificar).
4. Presionar "Decodificar".

El sistema valida que la cadena solo contenga `0` y `1`, que la tabla no este vacia y que los codigos no esten duplicados. Si hay errores, se muestran mensajes claros.

---

### Vista Comparar

Vista dedicada a la comparacion de Huffman y Shannon-Fano sobre un mismo texto.

Muestra:

- Tamano original en bits.
- Tamano comprimido de cada algoritmo.
- Tasa de compresion de cada algoritmo.
- Diferencia porcentual entre ambos.
- Longitud promedio de codigo.
- Eficiencia respecto a la entropia de Shannon.
- Graficos de frecuencias y longitudes de codigo por simbolo.

Se puede ingresar texto directamente en esta vista o reutilizar el resultado de la vista Codificar si ya se proceso un texto en la sesion actual.

---

### Vista Imagenes / Mapas de bits

Vista preparada para aplicar compresion sobre imagenes en blanco y negro o mapas de bits simples.

Estado actual: la estructura de la vista esta disponible. La carga de imagen, conversion a secuencia binaria y aplicacion de algoritmos estan pendientes de implementacion completa. No hay datos simulados — la vista indica claramente que la funcionalidad esta en desarrollo.

---

### Vista Acerca de

Explica brevemente el proposito de la aplicacion, una descripcion de cada algoritmo, las metricas que se comparan y las tecnologias utilizadas. No tiene interaccion.

---

## Exportacion de resultados

### CSV

El archivo exportado contiene una fila por simbolo con las siguientes columnas:

```
Simbolo, Frecuencia, Codigo Huffman, Long. Huffman, Codigo Shannon-Fano, Long. Shannon-Fano
```

El espacio se representa como `[espacio]` para legibilidad.

### PDF

El documento incluye:

- Cabecera con nombre del texto procesado y fecha.
- Tabla de simbolos y codigos.
- Imagen del arbol de Huffman.
- Grafico de frecuencias.
- Tabla de comparacion de metricas.

---

## Validaciones

### Backend

- Texto vacio o ausente.
- Archivo con extension distinta a `.txt`.
- Cadena binaria con caracteres fuera del conjunto `{0, 1}`.
- Tabla de codigos vacia al decodificar.
- Codigos duplicados en la tabla de decodificacion.
- Algoritmo no reconocido.

### Frontend

- El boton "Codificar" permanece deshabilitado si el area de texto esta vacia.
- Los errores del backend se muestran en un panel de alerta rojo con el mensaje exacto devuelto por la API.
- El estado de la operacion se refleja en la barra inferior (inactivo / procesando / completado / error).

---

## Tests

Los tests unitarios cubren los modulos de dominio del backend.

```bash
cd backend
pytest tests/
```

Archivos de test:

| Archivo                  | Cubre                                      |
|--------------------------|--------------------------------------------|
| `test_huffman.py`        | Construccion del arbol y asignacion de codigos |
| `test_shannon_fano.py`   | Particion recursiva y asignacion de codigos    |
| `test_metrics.py`        | Calculo de tasa de compresion y eficiencia     |

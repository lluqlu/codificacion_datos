# Backend — Codificacion de Datos

API REST construida con Flask. Expone los algoritmos de compresion Huffman y Shannon-Fano y los sirve al frontend via JSON.

## Estructura

```
backend/
├── run.py                          # Punto de entrada
└── app/
    ├── __init__.py                 # create_app(), registro de blueprints, CORS
    ├── config.py                   # DevelopmentConfig / ProductionConfig / TestingConfig
    │
    ├── routes/                     # Definicion de URLs (blueprints)
    │   ├── compression_routes.py   # /api/compression/encode  /api/compression/decode
    │   └── health_routes.py        # /api/health
    │
    ├── controllers/                # Entrada HTTP: parsea request, llama al servicio, devuelve JSON
    │   └── compression_controller.py
    │
    ├── services/                   # Orquestacion: coordina dominio y utils
    │   ├── compression_service.py  # encode() y decode() de alto nivel
    │   └── file_service.py         # Lectura de archivos .txt (utf-8 / latin-1)
    │
    ├── domain/                     # Logica pura, sin dependencias HTTP
    │   ├── huffman.py              # Algoritmo de Huffman
    │   ├── shannon_fano.py         # Algoritmo de Shannon-Fano
    │   ├── frequencies.py          # Calculo de frecuencias por simbolo
    │   ├── metrics.py              # Entropia, longitud media, tasa de compresion, eficiencia
    │   └── models.py               # TreeNode, SymbolCode, AlgorithmResult, EncodeResponse
    │
    └── utils/
        ├── validators.py           # Validacion de inputs (texto, cadena binaria, tabla de codigos)
        └── bit_utils.py            # text_to_bits: len(text) * 8
```

## Endpoints

| Metodo | URL | Descripcion |
|--------|-----|-------------|
| `GET`  | `/api/health` | Estado del servidor |
| `POST` | `/api/compression/encode` | Codifica texto con Huffman y Shannon-Fano |
| `POST` | `/api/compression/decode` | Decodifica cadena binaria dado un algoritmo y tabla de codigos |

### POST /api/compression/encode

Acepta JSON `{ "text": "..." }` o `multipart/form-data` con un campo `file` (`.txt`).

Devuelve frecuencias, codigos, cadena codificada, arbol de Huffman y metricas para ambos algoritmos.

### POST /api/compression/decode

```json
{
  "algorithm": "huffman",
  "encoded": "0110100...",
  "codes": [{ "symbol": "a", "code": "0" }, ...]
}
```

`algorithm` acepta `"huffman"` o `"shannon_fano"`. Devuelve `{ "decoded": "..." }`.

## Donde estan los algoritmos

### Huffman — `app/domain/huffman.py`

- `build_huffman_tree(frequencies)` — construye el arbol con un min-heap (`heapq`).
- `generate_huffman_codes(frequencies)` — devuelve el diccionario de codigos y la raiz del arbol.
- `encode_text(text, codes)` — concatena los codigos de cada caracter.
- `decode_text(encoded, codes)` — invierte el diccionario y lee bit a bit.

### Shannon-Fano — `app/domain/shannon_fano.py`

- `generate_shannon_fano_codes(frequencies)` — divide recursivamente el conjunto ordenado por frecuencia buscando el corte de menor diferencia acumulada.
- `encode_text` / `decode_text` — identicos en logica a Huffman.

### Metricas — `app/domain/metrics.py`

- `calculate_entropy` — entropia de Shannon: `-sum(p * log2(p))`.
- `calculate_average_length` — longitud media ponderada por frecuencia.
- `calculate_compression_rate` — porcentaje de reduccion respecto a 8 bits/caracter.
- `calculate_efficiency` — entropia / longitud media, expresado en porcentaje.

## Flujo de una request de codificacion

```
POST /api/compression/encode
        |
compression_controller.encode()
        |-- valida input (validators.py o file_service.py si es archivo)
        |
compression_service.encode(text)
        |-- frequencies.calculate_frequencies(text)
        |-- huffman.generate_huffman_codes(freqs)
        |-- shannon_fano.generate_shannon_fano_codes(freqs)
        |-- metrics.*  (entropia, longitud media, tasa, eficiencia)
        |
        -> JSON con original, frequencies, huffman{}, shannonFano{}
```

## Configuracion

La app se construye con `create_app(env)` definida en `app/__init__.py`. El entorno se lee desde la variable `FLASK_ENV` en `run.py`. CORS esta configurado para aceptar solo el origen del frontend en produccion.

## Tests

```bash
cd backend
pytest tests/
```

Los tests cubren `test_huffman.py`, `test_shannon_fano.py` y `test_metrics.py` de forma aislada, sin levantar el servidor.

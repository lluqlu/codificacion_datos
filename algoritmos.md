# Algoritmos de codificacion: Huffman y Shannon-Fano

## Contexto del problema

La transmision y almacenamiento de informacion tiene un costo asociado al numero de bits necesarios para representarla. En la codificacion binaria convencional (ASCII, UTF-8), cada caracter ocupa una cantidad fija de bits independientemente de con que frecuencia aparece en el texto. Esto es ineficiente: si la letra `e` aparece 40 veces y la letra `z` aparece una sola vez, ambas consumen el mismo espacio.

Los codigos de longitud variable resuelven este problema asignando representaciones mas cortas a los simbolos mas frecuentes. El limite teorico de esta compresion esta dado por la **entropia de Shannon**:

```
H = -sum( p_i * log2(p_i) )
```

donde `p_i` es la probabilidad de ocurrencia del simbolo `i`. Ningun codigo libre de prefijos puede lograr una longitud media menor que `H` bits por simbolo. Tanto Huffman como Shannon-Fano son algoritmos que intentan aproximarse a ese limite.

---

## Huffman

### Descripcion

El algoritmo de Huffman (David Huffman, 1952) construye el arbol de codificacion de forma **bottom-up**: parte de las hojas (los simbolos) y va fusionando los nodos de menor frecuencia hasta obtener una unica raiz.

### Procedimiento

1. Se calcula la frecuencia de cada simbolo en el texto de entrada.
2. Cada simbolo se convierte en un nodo hoja con su frecuencia y se inserta en un min-heap (cola de prioridad por frecuencia).
3. Se repite hasta que queda un solo nodo en el heap:
   - Extraer los dos nodos de menor frecuencia (`left`, `right`).
   - Crear un nodo interno cuya frecuencia es `left.frequency + right.frequency`.
   - Insertar el nuevo nodo en el heap.
4. El nodo restante es la raiz del arbol.
5. Se recorre el arbol recursivamente: cada bifurcacion hacia la izquierda agrega un bit `0`, hacia la derecha un bit `1`. Al llegar a una hoja se registra el codigo del simbolo.

### Implementacion

La estructura de datos central es `TreeNode`, un dataclass que implementa `__lt__` para ordenarse por frecuencia, lo que permite usarlo directamente con `heapq` de Python sin necesidad de una clave auxiliar.

El caso de un unico simbolo distinto se trata explicitamente: se crea la raiz con ese nodo como hijo izquierdo y se le asigna el codigo `"0"`, ya que no hay bifurcacion posible.

### Propiedades

- Produce codigos **optimos** para una distribucion de frecuencias dada: ninguna asignacion de codigos libres de prefijo puede lograr una longitud media menor.
- El arbol se construye en `O(n log n)` donde `n` es el numero de simbolos distintos.
- La decodificacion es univoca porque el codigo resultante es **libre de prefijos** (prefix-free): ningun codigo es prefijo de otro.

---

## Shannon-Fano

### Descripcion

El algoritmo de Shannon-Fano (Claude Shannon y Robert Fano, independientemente, ~1949) construye el arbol de forma **top-down**: parte del conjunto completo de simbolos y lo divide recursivamente en dos grupos de frecuencia acumulada lo mas similares posible.

### Procedimiento

1. Se ordena el conjunto de simbolos de mayor a menor frecuencia.
2. Se busca el punto de corte que minimiza la diferencia entre la suma acumulada del grupo izquierdo y el grupo derecho: se recorre el arreglo calculando `|total - 2 * acumulado|` y se elige el indice que minimiza ese valor.
3. Al grupo izquierdo se le asigna el bit `0` al prefijo actual; al derecho, el bit `1`.
4. Se aplica recursivamente hasta llegar a grupos de un solo simbolo.

### Implementacion

La funcion `_partition` implementa la busqueda del punto de corte optimo en `O(n)`. La recursion en `_assign_codes` opera directamente sobre sublistas del arreglo ordenado, sin construir explicitamente una estructura de arbol.

### Propiedades

- No garantiza optimalidad: en ciertos casos la division no produce los codigos mas cortos posibles.
- Es historicamente relevante por ser anterior a Huffman y por el trabajo teorico de Shannon que dio origen a la teoria de la informacion.
- Comparte con Huffman la propiedad de generar codigos libres de prefijos, lo que permite la misma estrategia de decodificacion.

---

## Comparacion

| Aspecto | Huffman | Shannon-Fano |
|---|---|---|
| Direccion de construccion | bottom-up | top-down |
| Optimalidad | garantizada | no garantizada |
| Complejidad | O(n log n) | O(n log n) en promedio |
| Estructura auxiliar | arbol binario explicito | division recursiva de listas |
| Eficiencia tipica | mayor o igual a Shannon-Fano | puede ser suboptima |

En la practica, Huffman produce sistematicamente longitudes medias iguales o menores. La inclusion de Shannon-Fano en el proyecto permite observar y cuantificar esa diferencia sobre entradas reales, lo que justifica mostrar ambos algoritmos en paralelo.

---

## Decodificacion

La decodificacion es identica en ambos algoritmos. Se invierte el diccionario `{simbolo: codigo}` para obtener `{codigo: simbolo}` y se lee la cadena binaria bit a bit acumulando en un buffer. Cada vez que el buffer coincide con algun codigo en el diccionario se emite el simbolo correspondiente y se limpia el buffer. Esto funciona correctamente porque la propiedad libre de prefijos garantiza que no existe ambiguedad: en ningun momento el buffer puede corresponder a dos simbolos distintos.

---

## Metricas de evaluacion

Para comparar los resultados se calculan cuatro metricas:

**Entropia de Shannon**
```
H = -sum( p_i * log2(p_i) )
```
Es el limite inferior teorico de bits por simbolo para cualquier codigo libre de prefijos sobre esa distribucion. No depende del algoritmo sino del texto de entrada.

**Longitud media del codigo**
```
L = sum( p_i * len(codigo_i) )
```
Cantidad promedio de bits por simbolo que produce el codigo generado. Siempre `L >= H`.

**Tasa de compresion**
```
CR = (1 - bits_comprimidos / bits_originales) * 100
```
Porcentaje de reduccion respecto a la representacion de 8 bits por caracter (ASCII).

**Eficiencia**
```
E = (H / L) * 100
```
Que tan cerca esta el codigo de su limite teorico. Un valor de 100% significa que se alcanzo la entropia exacta. En la practica Huffman suele acercarse mucho mas que Shannon-Fano.

---

## Justificacion de las decisiones de implementacion

**Uso de `heapq` en Huffman.** Python no tiene una estructura de cola de prioridad integrada con inserciones y extracciones eficientes en otro tipo. `heapq` opera sobre listas en `O(log n)` por operacion y es la opcion idiomatica para este patron.

**Shannon-Fano sin arbol explicito.** A diferencia de Huffman, Shannon-Fano no necesita el arbol para decodificar: basta con el diccionario de codigos. Construir el arbol seria redundante. La implementacion refleja eso operando directamente sobre listas.

**Separacion entre dominio y servicio.** Los algoritmos viven en `domain/` y no conocen ni HTTP ni la estructura de la respuesta. La capa de servicio en `services/` orquesta las llamadas y construye los objetos de respuesta. Esto permite testear los algoritmos de forma aislada sin levantar el servidor.

**Calculo de frecuencias previo y compartido.** Ambos algoritmos reciben las mismas frecuencias calculadas una sola vez por `calculate_frequencies`. Esto evita recalcular y garantiza que la comparacion entre ambos se hace sobre exactamente la misma distribucion de entrada.

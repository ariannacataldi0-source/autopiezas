# Autopiezas Warnes — Nueva tienda de Retenes

## Fases 1 a 5: Análisis, investigación, propuesta, productos y diseño

> Estado: **propuesta para aprobación**. No se escribió código de la tienda todavía.
> Hay decisiones marcadas con **🟡 DECISIÓN** que necesitan tu aprobación antes de la Fase 6.

---

## ⚠️ Limitación importante sobre cómo se hizo este análisis

El entorno de trabajo tiene una política de red que **bloquea el acceso directo** a
`autopiezaswarnes.com.ar` (y también a `sabo.com.br`, `dbh.com.ar` y `web.archive.org`).
Solo pude usar el **buscador web**, que devuelve el contenido indexado de cada página.

Consecuencias concretas:

1. **Los datos de productos vienen del índice del buscador, no de una lectura directa.**
   En la mayoría de los casos el dato fue consistente, pero detecté **dos contradicciones**
   (Retén 7340 con dos precios distintos; Retén 2686 con dos aplicaciones distintas).
   Esos productos quedaron **excluidos**.
2. **Los precios pueden estar desactualizados** (el índice no dice de qué fecha son).
3. **No pude ver el logo ni medir el azul exacto** de la marca.
4. **No pude descargar ni verificar fotografías.**

**Cómo destrabarlo (recomendado):**
- **Opción A (la mejor):** el sitio actual es **WooCommerce** (se ve por las URLs
  `/product/` y `/product-category/`). Desde el panel de WordPress →
  *Productos → Exportar* se obtiene un **CSV con todos los productos**: código, precio,
  stock, categorías, descripción e imagen. Es la fuente más confiable posible y elimina
  cualquier riesgo de dato inventado o desactualizado.
- **Opción B:** habilitar en la configuración de red del entorno los dominios
  `autopiezaswarnes.com.ar`, `sabo.com.br`, `catalogo.sabo.com.br` y `dbh.com.ar`
  para poder verificar directamente cada ficha y cada foto.

---

# FASE 1 — Análisis del sitio actual

### 1.1 Qué es hoy el sitio

- Plataforma: **WordPress + WooCommerce**.
- Empresa: *"Desde 1965 en Av. Warnes, distribuimos a nivel nacional retenes, juntas,
  mangueras, filtros de aire, bulones de tapa de cilindro, correas, tensores, kits de
  distribución, kits de rueda y lámparas Philips"* (texto del sitio, según el índice).
- El catálogo de retenes supera los **2.000 productos**.

### 1.2 Cómo está estructurado el catálogo de retenes

Jerarquía real de categorías (tomada de las URLs):

```
Reténes
 └── MARCA DE VEHÍCULO            (ej: VOLKSWAGEN, FORD, FIAT, MERCEDES BENZ, SCANIA…)
      └── GRUPO DE MODELOS        (ej: GOL-GACEL-SENDA-SAVEIRO)
           └── APLICACIÓN         (ej: DISTRIBUCION, CAJA DE VELOCIDAD, RUEDA TRASERA)
                └── producto
```

Ejemplos reales:
- `retenes-2/volkswagen/gol-gacel-senda-saveiro/…`
- `retenes-2/ford/ranger/caja-de-transferencia/`
- `retenes-2/ford/transit/distribucion/`
- `retenes-2/volvo/varios/pinon-de-diferencial/`
- `retenes-2/borgward/rastrojero/guia-de-valvulas/`

**Observación clave:** el "modelo" no es un modelo individual sino un **grupo de modelos
que comparten piezas** (ej. `GOL TREND-GOLF-BORA-POLO-FOX-SURAN-AUDI3`,
`205-206-207-306-307-405-BERLINGO-XANTIA-XSARA-C3`). Esto es información valiosa
(la empresa ya agrupó por compatibilidad), pero es muy difícil de leer para un usuario.

### 1.3 Qué información tiene cada producto

Formato típico de la ficha:

| Campo | Ejemplo real (Retén 5159 - Sabo) |
|---|---|
| Título | `Reten 5159- Sabo` |
| Descripción corta | `DISTRIBUCION // <detalle> // 32X42X7` |
| Precio | `$9.023,73` |
| Código fabricante | `SABO RETENES: 05159BRAGF` |
| Categorías | `DISTRIBUCION, GOL-GACEL-SENDA-SAVEIRO, Retenes, VOLKSWAGEN` |

La descripción sigue el patrón **`APLICACIÓN // DETALLE // MEDIDAS`**, donde el detalle
puede ser un **motor** (`ECOTEC 1.8 16V`, `OM 904/6`, `Motor 1.3`), una **posición**
(`Semieje derecho`, `Salida I`, `Interior F-4000`), o un **rango de años**
(`1970 – 80`, `Modelo '92 en adelante`, `2005/...`). A veces está vacío.

Fabricantes de retenes detectados: **SABÓ** (la gran mayoría) y **DBH**.

### 1.4 Categorías de aplicación que existen realmente

Confirmadas en el catálogo:

| Zona | Aplicación (nombre en el catálogo) |
|---|---|
| Motor | DISTRIBUCION · BANCADA · ARBOL DE LEVAS · GUIA DE VALVULAS |
| Caja / transmisión | CAJA DE VELOCIDAD · CAJA DE TRANSFERENCIA · SEMIEJE |
| Diferencial | PIÑON / PIÑON DE DIFERENCIAL |
| Ruedas | RUEDA DELANTERA · RUEDA TRASERA |

Es posible que existan más (ej. dirección, bomba) que el índice no mostró. Con el CSV
de WooCommerce se obtiene la lista completa en un minuto.

**No existen** en el catálogo categorías como "Dirección" o "Motor" genérico en los
productos relevados, por eso no las uso.

### 1.5 Problemas de UX detectados

1. **Navegación por árbol de 3–4 niveles** con nombres en mayúsculas y jerga
   (`L1112-L1114-O140-O170-OC1214`). El usuario necesita saber de antemano en qué
   rama está su auto.
2. **Grupos de modelos ilegibles**: el usuario busca "Fox", pero tiene que adivinar que
   está dentro de `GOL TREND-GOLF-BORA-POLO-FOX-SURAN-AUDI3`.
3. **Títulos de producto sin información**: "Reten 5159- Sabo" no dice para qué sirve.
   La información útil está escondida en la descripción con separadores `//`.
4. **Terminología técnica sin explicación**: "Distribución", "Bancada", "Guía de válvulas"
   no significan nada para un no-experto.
5. **Mezcla de categorías**: retenes, juntas, bombas y lámparas conviven en el mismo menú.
6. **Listados muy largos y paginados** (la categoría Retenes tiene al menos 6+ páginas).
7. **URLs y productos duplicados** (`reten-2005-sabo-6`, `reten-2424-sabo-2`) que sugieren
   el mismo retén cargado varias veces para distintos vehículos → **el modelo de datos
   actual duplica productos en vez de tener un producto con varias compatibilidades.**
8. **Precios inconsistentes** entre vistas (detectado en el Retén 7340).
9. **Fotos malas o genéricas** (según tu descripción).
10. **Años casi ausentes**: la mayoría de los productos no tiene año de compatibilidad.

### 1.6 Qué información falta

| Dato | Situación |
|---|---|
| Años de compatibilidad | **Falta en la mayoría.** Aparece solo en ~15% de lo relevado y como texto libre. |
| Motor | Aparece a veces, como texto libre. |
| Stock | **No publicado** en lo relevado. |
| Número de WhatsApp | **No lo encontré.** Hay que pedirlo. |
| Teléfonos | Encontré dos: `(54) 11 3989 6816` y `(54) 11 4854-6867 / 4355`. Hay que confirmar cuál está vigente. |
| Redes sociales | **No encontradas.** |
| Azul exacto y logo en alta | No accesible desde el entorno. |
| Fotos correctas | No verificadas. |

### 1.7 Qué conservar

- Logo, nombre, azul institucional.
- **"Desde 1965 en Av. Warnes"** (es el mayor activo de confianza).
- Dirección **Warnes 1151, CABA**, horario **8:30 a 18:00**, email
  **autopiezas@autopiezaswarnes.com.ar**.
- La **lógica de clasificación Marca → Modelo → Aplicación** (es correcta y útil;
  el problema es la presentación, no la lógica).
- Los **grupos de modelos** como dato interno de compatibilidad.
- El **código de fabricante** (`05159BRAGF`) — lo buscan los mecánicos.
- Las **medidas** en formato `interior x exterior x ancho`.

### 1.8 Qué cambiar

- Separar **producto** de **compatibilidades** (un retén, muchos vehículos).
- Convertir los grupos de modelos en **modelos individuales** buscables
  (Fox, Suran, Polo… por separado), apuntando al mismo producto.
- Títulos legibles: **"Retén de distribución — VW Gol / Gacel / Senda / Saveiro"**
  en vez de "Reten 5159- Sabo" (el código queda visible, pero como dato secundario).
- Explicar cada aplicación en lenguaje simple.
- Buscador por medida que entienda `35x52x7`, `35 x 52 x 7`, `35*52*7`, `35,0x52x7`.

---

# FASE 2 — Investigación de otros sitios

Referencias analizadas: catálogo online de **Sabó** (búsqueda por patente, vehículo,
código y medidas), **Kessel** y **AG** (búsqueda por patente en Argentina),
**Mercado Libre** (compatibilidades en autopartes), **ChileRepuestos** / **NubeParts**
(patente/VIN), **AUTODOC** y **RockAuto** (patrones clásicos de e-commerce de repuestos).

| Patrón | Quién lo usa | ¿Lo adoptamos? | Por qué |
|---|---|---|---|
| **"Mi vehículo" persistente**: el auto elegido queda fijado arriba y filtra todo el sitio | AUTODOC, Mercado Libre, AutoZone | ✅ Sí | El usuario elige el auto **una vez**; después cada producto le dice "✔ Compatible con tu Gol". Reduce el miedo a equivocarse. |
| **Selector por pasos** (uno a la vez, con botones grandes en vez de dropdowns) | Sabó, ChileRepuestos | ✅ Sí | Mucho mejor en celular y para gente mayor que 4 dropdowns. |
| **Búsqueda por patente** | Sabó, Kessel, AG | 🔜 Futuro | Excelente UX, pero requiere un proveedor de datos de patentes (costo/contrato). Ver propuesta P4. |
| **Búsqueda por medidas con campos separados** (Ø int, Ø ext, ancho) | Sabó, distribuidores de rodamientos | ✅ Sí (además del campo libre) | Los mecánicos piensan en 3 números; campos separados evitan errores de formato. |
| **Aplicación agrupada en zonas visuales** (Motor / Transmisión / Ruedas) | AUTODOC, RockAuto | ✅ Sí | Reduce 10 opciones técnicas a 3–4 zonas entendibles. |
| **Badge de compatibilidad en la tarjeta** | Mercado Libre ("Es compatible con tu vehículo") | ✅ Sí | Es exactamente la respuesta que busca el usuario. |
| **Equivalencias / "también sirve para"** | AUTODOC, catálogos Sabó | ✅ Sí, en la ficha | Muestra todos los vehículos que usan el mismo retén. |
| **Checkout con pago online** | Todos los e-commerce | ❌ No | Pedido explícito: el cierre es por WhatsApp. |
| Carruseles, pop-ups, chat bots | Muchos | ❌ No | Pedido explícito, y distraen. |

---

# FASE 3 — Propuesta

## 3.1 Propuestas de cambio sobre tus requisitos (requieren tu decisión)

### 🟡 DECISIÓN P1 — El paso "Año" no puede funcionar como filtro con los datos actuales

- **Problema:** pediste `Marca → Modelo → Año → Parte`. Pero en el catálogo actual
  **casi ningún retén tiene año**. Si el año es obligatorio, el sistema tendría que
  inventar años (prohibido) o descartar productos válidos (el usuario vería "0 resultados"
  cuando el retén sí existe).
- **Propuesta:** `Marca → Modelo → ¿Dónde va el retén? → (Motor, solo si hace falta)`.
  - El **año se muestra** en la tarjeta cuando existe ("1970–1980", "desde 1992")
    y cuando no existe se muestra **"Año: consultar"**.
  - El paso **Motor** aparece **solo** si para ese modelo+parte hay retenes distintos
    según el motor (ej. Fiat Palio: E-TORQ 1.6/1.8 vs otros). Si hay uno solo, se saltea.
  - El paso **Año** se activa automáticamente en el futuro, cuando los datos lo tengan
    (el modelo de datos ya lo soporta).
- **Ventajas:** no se inventan datos; nunca se descartan productos válidos; menos pasos;
  el motor es lo que realmente distingue retenes en muchos casos (distribución, levas).
- **Desventajas:** el usuario que "espera" elegir año no lo verá (por ahora); en algunos
  modelos con muchos años puede aparecer más de un retén posible → se resuelve mostrando
  el detalle ("Motor 1.3", "Semieje derecho") en grande y el botón de WhatsApp.
- **Alternativa si preferís mantener Año:** mostrar el paso Año con la opción
  "No sé / Todos los años" preseleccionada. Funciona, pero agrega un paso que hoy no filtra nada.

### 🟡 DECISIÓN P2 — "¿Dónde va el retén?" en dos niveles simples

- **Problema:** las 10 aplicaciones reales usan jerga (Bancada, Distribución, Guía de válvulas).
- **Propuesta:** primero **zona** (grandes botones con ícono), después **aplicación**
  con una línea de explicación:
  - 🔧 **Motor** → Distribución *(retén delantero del cigüeñal, detrás de la polea)*,
    Bancada *(retén trasero del cigüeñal, del lado del embrague)*,
    Árbol de levas, Guía de válvulas.
  - ⚙️ **Caja y transmisión** → Caja de velocidad, Caja de transferencia, Semieje, Piñón de diferencial.
  - 🛞 **Ruedas** → Rueda delantera, Rueda trasera.
  - Solo se muestran las zonas/aplicaciones **que tienen productos para ese vehículo**.
- **Ventajas:** entendible para no expertos; nunca muestra opciones vacías.
- **Desventajas:** un clic más. Si la zona tiene una sola aplicación, se saltea automáticamente.
- ⚠️ Las explicaciones de cada término deben **validarse con el equipo de Warnes** antes de publicarse.

### 🟡 DECISIÓN P3 — Fotos: dibujo técnico con medidas mientras no haya foto verificada

- **Problema:** no se puede usar una foto genérica, y hoy no hay fotos verificadas.
- **Propuesta:** si el producto no tiene foto verificada, mostrar un **dibujo técnico
  generado a partir de las medidas reales** (un aro con las cotas Ø int / Ø ext / ancho)
  con la leyenda "Imagen ilustrativa de medidas — foto del producto no disponible".
- **Ventajas:** no es una foto engañosa; aporta información útil (las medidas); estética uniforme.
- **Desventajas:** menos "vendedor" que una foto real.

### 🟡 DECISIÓN P4 — Búsqueda por patente (fase futura, no v1)

- Recomiendo dejarla para una v2. Requiere contratar un servicio de datos de patentes.
  La arquitectura la contempla (entra como un tercer camino de búsqueda).

### 🟡 DECISIÓN P5 — Fuente de datos: pedir el export de WooCommerce

- Ver la limitación al comienzo. Es lo que más reduce el riesgo del proyecto.

## 3.2 Arquitectura de información

```
Inicio
├── Retenes (catálogo)
│   ├── Buscar por vehículo        /retenes/vehiculo
│   ├── Buscar por código/medida    /retenes/buscar?q=
│   └── Ficha de producto           /retenes/<slug>
├── Cómo encontrar mi retén        /como-encontrar-mi-reten
├── Ayuda (preguntas frecuentes)   /ayuda
├── Contacto                       /contacto
└── Carrito                        /carrito  → WhatsApp
```

Futuras categorías: `/juntas`, `/correas`, etc., reutilizando los mismos componentes.

## 3.3 Navegación

- **Desktop:** Logo · Buscar por vehículo · Buscar por código · Cómo encontrar mi retén · Ayuda · Contacto · 🛒 Carrito (n)
- **Mobile:** Logo · 🔎 · 🛒 (n) · ☰ Menú. **Barra inferior fija** con 3 botones grandes:
  *Buscar por vehículo · Buscar código · WhatsApp*.
- Chip persistente **"Tu vehículo: VW Gol ✕"** debajo del header cuando hay uno elegido.

## 3.4 Homepage

1. **Header** (logo, nav, carrito).
2. **Hero:** "Encontrá el retén que necesitás" / "Buscá por tu vehículo o directamente por
   código, marca o medida." Dos tarjetas-botón grandes:
   `🚗 Buscar por vehículo` — `🔎 Buscar por código o medida`.
   El buscador de código está **visible directamente** en el hero (un campo + botón),
   no escondido detrás de un clic.
3. **¿No sabés cuál necesitás?** → selector de vehículo embebido (paso 1: marcas con logos/nombres grandes).
4. **¿Ya sabés qué retén buscás?** → campo de búsqueda + campos separados de medida.
5. **Retenes destacados** (4–8 tarjetas).
6. **Confianza:** "Desde 1965 en Av. Warnes" · "Distribuimos a todo el país" ·
   "Atención personalizada" · "Consultanos por WhatsApp". *(Solo datos confirmados.)*
7. **¿No encontrás tu retén?** → bloque WhatsApp.
8. **Footer:** dirección, horario, teléfono, email, WhatsApp, (redes si existen).

## 3.5 Flujo de búsqueda por vehículo

```
Paso 1  ¿Qué vehículo tenés?     [ Volkswagen ] [ Ford ] [ Fiat ] [ Chevrolet ] … (+ buscar marca)
Paso 2  ¿Qué modelo?             [ Gol ] [ Gacel ] [ Senda ] [ Saveiro ] [ Gol Trend ] [ Fox ] …
Paso 3  ¿Dónde va el retén?      [ 🔧 Motor (2) ] [ ⚙️ Caja y transmisión (3) ] [ 🛞 Ruedas (0 — oculto) ]
Paso 3b ¿Qué parte del motor?    [ Distribución ] [ Bancada ]  (con explicación de cada una)
(Paso 4 Motor — solo si hace falta)
→ Resultados: "Encontramos 1 retén para tu VW Gol · Distribución"
```

- Cada paso es una pantalla/sección con **botones grandes** (no dropdowns). En desktop
  se ven como una "migas" de pasos arriba: `Volkswagen › Gol › Motor › Distribución`,
  cada una clickeable para volver.
- Los números entre paréntesis muestran cuántos retenes hay → el usuario nunca llega a un callejón vacío.
- Estado guardado en la URL (`/retenes/vehiculo?marca=vw&modelo=gol&parte=distribucion`)
  → se puede compartir el link por WhatsApp y el botón "atrás" funciona.

## 3.6 Búsqueda directa (código / medida / texto)

- Un solo campo que entiende:
  - Código corto: `5159`, `9888`
  - Código de fabricante: `05159BRAGF`
  - Marca + código: `SABÓ 5159`, `sabo 5159` (sin tilde también)
  - Medidas: `32x42x7`, `32 x 42 x 7`, `32*42*7`, `32X42X7`, `31,5x42x7`
  - Texto: `gol distribución`, `ranger semieje`
- Búsqueda por medida con **tolerancia opcional** (± 0,5 mm) desactivada por defecto;
  si no hay coincidencia exacta se ofrece "Ver medidas similares".
- Normaliza tildes, mayúsculas y separadores.

## 3.7 Resultados y límite de 20

- Encabezado: **"Encontramos X retenes"** + filtros activos en chips removibles.
- Si hay **más de 20**: no se muestran; se muestra
  *"No encontramos una coincidencia suficientemente específica. Agregá un filtro para
  encontrar el retén correcto."* + los filtros sugeridos (marca, parte, medida)
  con la cantidad de resultados que dejaría cada uno.
- Si hay **0**: pantalla "¿No encontrás tu retén?" con WhatsApp (nunca vacía).
- Desktop: filtros en columna izquierda (Marca de retén, Parte, Motor) + grilla de 3 columnas.
- Mobile: botón "Filtros" que abre un panel inferior; tarjetas en 1 columna.

## 3.8 Tarjeta de producto (jerarquía)

```
┌────────────────────────────────────────┐
│ [foto o dibujo de medidas]             │
│ ✔ Compatible con tu VW Gol   (si aplica)│
│ Retén de distribución                  │  ← título grande (aplicación)
│ VW Gol · Gacel · Senda · Saveiro       │  ← vehículos
│ Medidas: 32 × 42 × 7 mm                │  ← destacado
│ Año: consultar   ·   Motor: —          │
│ SABÓ · Código 5159 (05159BRAGF)        │  ← secundario
│ $ 9.023,73  precio de referencia       │
│ Stock: consultar                       │
│ [ Ver producto ]  [ Agregar al carrito ]│
└────────────────────────────────────────┘
```

## 3.9 Ficha de producto

Secciones: **Información del producto** (foto grande, título, marca, código, precio,
cantidad, Agregar al carrito, Consultar por WhatsApp) → **Compatibilidad** (lista de
vehículos en tarjetas, no tabla; "¿Es compatible con mi auto?" → WhatsApp) →
**Medidas** (dibujo con cotas + lista) → **Información técnica** (código fabricante,
material si está confirmado) → **Consultas** (bloque WhatsApp con mensaje prearmado
que incluye el código del producto).

## 3.10 Carrito

- Drawer lateral en desktop / página completa en mobile.
- Ítems con: nombre, código, medidas, precio unitario, `[ − ] 2 [ + ]`, subtotal, "Eliminar".
- **Total estimado** con la leyenda: *"Precios de referencia. El precio final y los
  descuentos se confirman por WhatsApp."*
- "Seguir buscando retenes" + **"Finalizar pedido por WhatsApp"**.
- Persistencia en `localStorage` (no se pierde al cerrar la pestaña).

## 3.11 Flujo a WhatsApp

1. "Finalizar pedido" → pantalla **"Revisá tu pedido"** con el mensaje en un cuadro
   de texto **editable** (se puede agregar nombre, CUIT, "soy cliente de siempre", etc.).
2. Campos opcionales: *Nombre* y *Localidad* (ayudan a Warnes a identificar al cliente
   antiguo y cotizar envío). No obligatorios.
3. Botón **"Enviar por WhatsApp"** → abre `https://wa.me/<número>?text=<mensaje>`.

Mensaje generado:
```
Hola, quiero realizar el siguiente pedido:

• Retén SABÓ 5159 (05159BRAGF) — Distribución VW Gol/Gacel/Senda/Saveiro — 32x42x7
  2 x $9.023,73 = $18.047,46
• Retén DBH 9888 — Semieje der. 4x4 Ford Ranger — 44,45x66,57x12
  1 x $15.447,32 = $15.447,32

Total estimado: $33.494,78
(Precios de referencia de la web)

Nombre: …
Quisiera finalizar el pedido.
```

## 3.12 Modelo de datos

```ts
// Producto: una sola vez por retén físico
Product {
  id: "sabo-05159bragf"
  category: "retenes"            // permite /juntas, /correas en el futuro
  brand: "SABÓ"                  // fabricante del retén
  shortCode: "5159"              // código que usa Warnes en el título
  manufacturerCode: "05159BRAGF" // código de fabricante
  application: "distribucion"    // clave de Application
  detail: "Motor 1.3" | null     // texto libre original (motor/posición)
  dimensions: { inner: 32, outer: 42, width: 7, widthAlt?: number, raw: "32X42X7" }
  price: { amount: 9023.73, currency: "ARS", isReference: true, source, capturedAt }
  stock: "consultar" | number
  image: { url, source, license, verified: boolean } | null
  sourceUrl: "https://autopiezaswarnes.com.ar/product/reten-5159-sabo/"
}

// Compatibilidad: N por producto
Fitment {
  productId: "sabo-05159bragf"
  vehicleMake: "volkswagen"
  vehicleModels: ["gol","gacel","senda","saveiro"]   // modelos individuales buscables
  modelGroupLabel: "GOL-GACEL-SENDA-SAVEIRO"          // grupo original de Warnes
  yearFrom: null, yearTo: null                        // null = no disponible
  engine: null
  position: null                                      // "derecho", "salida I", etc.
}

// Catálogos de referencia
Application { key, zone: "motor"|"transmision"|"ruedas", label, explanation }
VehicleMake { key, label }
VehicleModel { key, makeKey, label }
```

Formato de almacenamiento para v1: **archivos JSON en el repositorio**
(`data/products.json`, `data/fitments.json`, `data/vehicles.json`,
`data/applications.json`). Un script puede importar el CSV de WooCommerce y generarlos.

## 3.13 Tecnología recomendada

| Opción | Pros | Contras | Veredicto |
|---|---|---|---|
| **Astro** (sitio estático) + TypeScript + JS mínimo para buscador/carrito | Muy rápido, SEO excelente (cada retén es una página HTML real), hosting gratis, simple | El catálogo se "compila" (al cambiar un precio hay que volver a publicar, ~1 min automático) | ✅ **Recomendado** |
| Next.js | Muy flexible | Más complejo de lo necesario | Posible, sobra |
| Seguir en WooCommerce con un tema nuevo | Mismo panel de siempre | El problema de datos (duplicados, sin compatibilidades) sigue; buscador por vehículo requiere plugins pagos | Posible, peor UX |

Detalles: CSS propio con variables (sin framework pesado), búsqueda 100 % en el
navegador (con 2.000 productos sigue siendo instantánea), carrito en `localStorage`,
deploy en Netlify / Cloudflare Pages / Vercel. Tests con **Vitest** (lógica de búsqueda,
carrito, mensaje de WhatsApp) y **Playwright** (flujos completos, mobile y desktop).

Escalabilidad: agregar "Juntas" = agregar `category: "juntas"` a los datos + una página de
listado; componentes, buscador, carrito y WhatsApp se reutilizan tal cual.

## 3.14 Responsive y accesibilidad

- Mobile-first; breakpoints 640 / 1024 px.
- **Texto base 18 px**, títulos 24–36 px, interlineado 1.5.
- **Botones mínimos 48 × 48 px**, principales 56 px de alto.
- Contraste AA mínimo (AAA en textos principales).
- Nada comunicado solo con color (compatible = ✔ + texto; sin stock = ícono + texto).
- Foco visible, navegación completa por teclado, `label` en todos los campos,
  mensajes de error en texto claro ("Escribí al menos 3 caracteres o un código").
- Sin tablas con scroll horizontal: compatibilidades y medidas como listas/tarjetas.
- Sin animaciones salvo transiciones cortas; respeta `prefers-reduced-motion`.

---

# FASE 4 — Los 20 retenes seleccionados

Criterios: que existan hoy en el catálogo, que sus datos fueran **consistentes** en el
índice, variedad de marcas de vehículo (autos, utilitarios, pesados) y de aplicaciones,
y priorizar autos populares.

Datos completos con fuente por producto: [`data/retenes-v1.draft.json`](../data/retenes-v1.draft.json).

| # | Retén | Marca | Cód. fabricante | Vehículo (grupo Warnes) | Aplicación | Detalle | Medidas | Precio ref.* |
|---|---|---|---|---|---|---|---|---|
| 1 | 5159 | SABÓ | 05159BRAGF | VW Gol-Gacel-Senda-Saveiro | Distribución | — | 32×42×7 | $9.023,73 |
| 2 | 7452 | SABÓ | 07452BRAGP | VW Gol Trend-Golf-Bora-Polo-Fox-Suran-Audi A3 | Caja de velocidad | Semieje derecho | 50×65×8 | $8.287,80 |
| 3 | 7451 | SABÓ | 07451BRP | VW Gol Trend-Golf-Bora-Polo-Fox-Suran-Audi A3 | Caja de velocidad | Eje piloto-directa | 24×38×6 | $9.268,08 |
| 4 | 2371 | SABÓ | 02371BAG | Chevrolet Corsa | Caja de velocidad | Directa | 21×32×7,5 | $6.135,54 |
| 5 | 5439 | SABÓ | 05439BRAGF | Chevrolet Vectra-Astra-Omega-Zafira-Cruze-Tracker | Distribución | Ecotec 1.8 16V | 31,5×42×7 | $6.826,29 |
| 6 | 5547 | SABÓ | 05547BRAGF | Fiat Palio-Siena | Distribución | Motor 1.6/1.8 16v E-TORQ | 32×45×6,5 | $6.135,54 |
| 7 | 5420 | SABÓ | 05420BRGF | Peugeot-Citroën 205-206-207-306-307-405-Berlingo-Xantia-Xsara-C3 | Bancada | Ancho 11 mm | 90×110×9 | $21.779,66 |
| 8 | 4247 | SABÓ | 04247BRGF | Peugeot-Citroën (mismo grupo) | Árbol de levas | — | 36×50×8 | $8.145,21 |
| 9 | 5780 | SABÓ | 05780BRGP | Renault Clio-Express-Megane-Laguna-Master | Árbol de levas | D4F/D4D 1.2 16v | 28×47×8 | $5.614,32 |
| 10 | 5658 | SABÓ | 05658BRS | Renault R18-Fuego | Árbol de levas | Motor 2 litros | 35×47×7 | $7.160,19 |
| 11 | 5167 | SABÓ | 05167BRAGEF | Ford Fiesta-Courier-Ka-Zetec-Focus-EcoSport | Distribución | Motor 1.3 | 36,8×52×8 | $11.460,33 |
| 12 | 9888 | DBH | 9888 | Ford Ranger | Semieje | Derecho 4×4 | 44,45×66,57×12 | $15.447,32 |
| 13 | 7375 | SABÓ | 07375BY | Ford F100-F150-F1000-F4000 Diesel | Rueda trasera | Interior F-4000 | 82,5×114,3×12,7 | $16.254,32 |
| 14 | 7552 | SABÓ | 07552BAGE | Ford F250-2500-F350-3500 | Rueda trasera | 1970–80 | 79×98,5×11 | $12.440,61 |
| 15 | 2153 | SABÓ | 02153BRG | Dodge Valiant | Caja de velocidad | Salida I | 29,4×42,8×8 | $4.758,80 |
| 16 | 8383 | SABÓ | 08383BRY | Mercedes-Benz O400-O500-1218-Axor-Accelo | Rueda trasera | — | 121,1×160,2×30 | $31.146,79 |
| 17 | 5214 | SABÓ | 05214GRAHF | Mercedes-Benz L700-L800-900 (OM904/6) | Distribución | OM 904/6 | 78×104×11 | $21.940,39 |
| 18 | 1924 | SABÓ | 01924BAEP | Mercedes-Benz L1112-L1114-O140-O170-OC1214 | Guía de válvulas | — | 9,9×15×10/14 | $5.940,99 |
| 19 | 2235 | SABÓ | S02235 | Scania L111-S111-T111 | Distribución | — | 80×100×12 | $3.246,69 |
| 20 | 8099 | DBH | DBH8099 | Deutz | Distribución | Motor 913 | 65×85×12 | $23.168,17 |

\* **Precio de referencia tomado del índice del buscador, fecha desconocida.
Debe validarse contra el sitio/ERP antes de publicar.** Stock: **no disponible → "Consultar"**.

**Años:** solo el #14 tiene rango de años (1970–80). En todos los demás: *no disponible*.

**Excluidos por datos contradictorios o incompletos:** Retén 7340 (dos precios distintos),
Retén 2686 (dos aplicaciones distintas), Retén 2424 (no se pudo confirmar el vehículo),
Retén 5801 (medidas incompletas: "85X–X–").

**Observación de negocio:** la muestra tiene muchos pesados/utilitarios porque así es el
catálogo real. Si el público objetivo de la v1 son autos particulares, puedo reemplazar
los #13–#20 por más retenes de autos (Gol, Corsa, Palio, 206, Clio, Fiesta…) —
**🟡 DECISIÓN P6**.

## 4.1 Fotografías

**Estado: ninguna foto verificada todavía** (no hay acceso a los sitios de los fabricantes
desde este entorno). No voy a usar una foto que no pueda verificar.

Plan por prioridad:
1. **SABÓ (18 productos):** el catálogo oficial `catalogo.sabo.com.br` tiene foto real por
   código de fabricante (ej. `05159BRAGF`). Es fuente primaria y permite verificar
   producto → código → marca → foto.
2. **DBH (2 productos):** catálogo oficial en `dbh.com.ar/productos`.
3. **Foto propia** en Warnes (tienen el producto físico): fondo blanco, misma luz, 2 tomas.
   *Es la opción legalmente más limpia y visualmente más uniforme.*

**Licencias:** las fotos de catálogos de fabricantes tienen derechos de autor del
fabricante. Es práctica común que los revendedores las usen, pero **no hay una licencia
pública que lo autorice**. Recomendación: pedir por escrito a SABÓ Argentina / DBH
(o a su distribuidor) autorización para usar las imágenes del catálogo en el sitio de
Warnes (suele concederse a revendedores). No usar fotos de Mercado Libre ni de otras
tiendas. Mientras tanto: dibujo técnico de medidas (propuesta P3).

---

# FASE 5 — Diseño visual

### Identidad
- **Logo actual** sin modificaciones, sobre fondo blanco, en header y footer.
- **Azul institucional** como único color de marca: header, botones primarios, links.
  *Necesito el hex exacto (o acceso al sitio) para calibrarlo; mientras tanto se define
  como variable `--brand` y se ajusta en un solo lugar.*
- **Verde WhatsApp** (#25D366 / texto oscuro para contraste) exclusivamente para acciones de WhatsApp.
- Neutros: blanco, gris muy claro (#F5F7FA) para fondos de sección, gris oscuro (#1F2937) para texto.
- Un solo color de acento para estados (✔ compatible: verde oscuro + ícono + texto).

### Tipografía
- **Atkinson Hyperlegible** (diseñada para máxima legibilidad, gratuita) o **Inter**.
- 18 px base; precio 24 px bold; títulos de tarjeta 20 px semibold.
- Números tabulares para medidas y precios.

### Componentes
- Botones: 56 px de alto, radios 10 px, texto 18 px, ícono + palabra (nunca solo ícono).
- Tarjetas: fondo blanco, borde 1 px gris, sombra muy suave, 24 px de padding.
- Selector por pasos: grilla de "botones-tarjeta" (2 columnas mobile, 4–6 desktop).
- Chips de filtros activos con ✕ grande.

### Wireframe mobile (home)

```
┌──────────────────────────┐
│ [LOGO Warnes]     🔎  🛒2 │
├──────────────────────────┤
│ Encontrá el retén        │
│ que necesitás            │
│ Buscá por tu vehículo o  │
│ por código o medida.     │
│ ┌──────────────────────┐ │
│ │ 🚗 Buscar por vehículo│ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🔎 Código o medida…  │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ ¿No sabés cuál necesitás?│
│ [VW] [Ford] [Fiat] [GM]  │
│ [Peugeot] [Renault] [+]  │
├──────────────────────────┤
│ Retenes destacados       │
│ [tarjeta]                │
├──────────────────────────┤
│ Desde 1965 en Av. Warnes │
├──────────────────────────┤
│ ¿No encontrás tu retén?  │
│ [ 💬 Consultar WhatsApp ]│
├──────────────────────────┤
│ 🚗 Vehículo │🔎 Código│💬 │ ← barra fija
└──────────────────────────┘
```

---

# Lo que necesito de vos para pasar a la Fase 6

1. **Aprobación o cambios** en las decisiones P1 a P6.
2. **Número de WhatsApp** para pedidos (y confirmar teléfono vigente).
3. **Redes sociales** (si las hay).
4. **Logo en buena calidad** (SVG o PNG) y **hex del azul** — o habilitar el dominio.
5. Idealmente, el **CSV exportado de WooCommerce** (o habilitar los dominios en la
   configuración de red del entorno) para validar precios, stock e imágenes.
6. Confirmar tecnología (Astro estático) y dónde se va a publicar.

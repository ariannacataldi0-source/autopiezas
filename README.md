# Autopiezas Warnes — Retenes

Tienda online de retenes de Autopiezas Warnes (primera versión). Sitio 100 % estático:
HTML + CSS + JavaScript, sin build ni dependencias. Funciona en GitHub Pages abriendo
`index.html` desde la raíz de la rama.

## Estructura

```
index.html          Página única (las secciones se navegan con #/ruta)
css/styles.css      Estilos (colores de marca en variables al principio)
js/config.js        Datos de la empresa, número de WhatsApp, zonas y aplicaciones
js/data.js          Productos y compatibilidades (generado desde data/retenes-v1.draft.json)
js/search.js        Búsqueda por vehículo, código y medida (sin DOM)
js/cart.js          Carrito (localStorage) y armado del mensaje de WhatsApp
js/app.js           Interfaz y navegación
assets/             Logo (negro y blanco) y favicon
data/               Datos fuente de los 20 retenes (con link a la ficha original)
docs/               Análisis y propuesta (fases 1 a 5)
tests/              Tests de lógica (node) y de navegador (Playwright)
```

## Pendientes antes de publicar como sitio oficial

- **Número de WhatsApp** → `whatsappNumber` en `js/config.js`. Mientras esté vacío,
  WhatsApp se abre con el mensaje listo y el usuario elige el contacto.
- **Teléfono vigente** → `js/config.js` (se encontraron dos números distintos).
- **Azul exacto de la marca** → variable `--brand` en `css/styles.css`.
- **Precios y stock** → validar contra el sistema; hoy son de referencia.
- **Fotos** → sin fotos verificadas; se muestra un dibujo generado con las medidas reales.

## Tests

```
node --test tests/unit.test.js
npx http-server .. -p 8123   # en otra terminal, sirve la carpeta padre
NODE_PATH=$(npm root -g) node tests/e2e.js http://127.0.0.1:8123/autopiezas/
```

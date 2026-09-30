/* Prueba de punta a punta en navegador.
   Uso: servir la carpeta padre (ej. `npx http-server .. -p 8123`) y ejecutar
   `NODE_PATH=$(npm root -g) node tests/e2e.js http://127.0.0.1:8123/autopiezas/` */
const { chromium } = require("playwright");
const assert = require("node:assert");

const BASE = process.argv[2] || "http://127.0.0.1:8123/autopiezas/";
const OUT = process.env.SCREENSHOTS || null;

async function run(viewport, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
  const shot = async (name) => OUT && page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: true });

  // Home
  await page.goto(BASE);
  await page.waitForSelector("h1");
  assert.match(await page.textContent("h1"), /Encontrá el retén que necesitás/);
  await shot("home");

  // Vehículo: VW → Gol → resultados (se saltean pasos con una sola opción)
  await page.click("a.btn-hero[href='#/vehiculo']");
  await page.waitForSelector("text=¿Qué vehículo tenés?");
  await page.click(".options a:has-text('Volkswagen')");
  await page.waitForSelector("text=¿Qué modelo?");
  const models = await page.$$eval(".options .option-label", (els) => els.map((e) => e.textContent));
  assert.ok(models.includes("Gol") && !models.includes("Corsa"));
  await page.click(".options a:has-text('Gol'):not(:has-text('Trend'))");
  await page.waitForSelector("h1:has-text('Encontramos 1 retén')");
  assert.ok(await page.isVisible("#vehicle-chip:has-text('Volkswagen Gol')"));
  assert.ok(await page.isVisible(".badge-ok"));
  await shot("vehiculo-resultados");

  // Peugeot 206 → Motor → Bancada
  await page.goto(BASE + "#/vehiculo?marca=peugeot&modelo=206");
  await page.waitForSelector("h1:has-text('¿En qué parte del motor?')");
  await page.click(".options a:has-text('Bancada')");
  await page.waitForSelector("h1:has-text('Encontramos 1 retén')");

  // Búsqueda por código
  await page.goto(BASE + "#/buscar");
  await page.fill("input[name=q]", "SABÓ 4247");
  await page.press("input[name=q]", "Enter");
  await page.waitForSelector("h1:has-text('Encontramos 1 retén')");

  // Búsqueda por medidas con campos separados
  await page.goto(BASE + "#/buscar");
  await page.click(".dims-box summary");
  await page.fill("input[name=di]", "32");
  await page.fill("input[name=de]", "42");
  await page.fill("input[name=an]", "7");
  await page.click("button[value=dims]");
  await page.waitForSelector("h1:has-text('Encontramos 1 retén')");
  assert.ok((await page.textContent(".card-title")).includes("distribución"));
  await shot("buscar-medida");

  // Medidas incompletas → error comprensible
  await page.goto(BASE + "#/buscar");
  await page.click(".dims-box summary");
  await page.fill("input[name=di]", "32");
  await page.click("button[value=dims]");
  assert.ok(await page.isVisible("[data-dims-error]"));

  // Sin resultados → bloque de ayuda
  await page.goto(BASE + "#/buscar?q=zzzz");
  await page.waitForSelector("text=¿No encontrás tu retén?");
  assert.ok(await page.isVisible(".notfound a.btn-whatsapp"));
  await shot("sin-resultados");

  // Ficha de producto y carrito
  await page.goto(BASE + "#/producto/sabo-5159");
  await page.waitForSelector("h1:has-text('Retén de distribución')");
  await shot("producto");
  await page.click("[data-qty-step='1']");
  await page.click("button[data-add-qty]");
  await page.waitForSelector("#toast:has-text('x2')");
  await page.goto(BASE + "#/producto/dbh-9888");
  await page.click("button[data-add-qty]");
  await page.goto(BASE + "#/carrito");
  await page.waitForSelector("h1:has-text('Tu pedido')");
  assert.strictEqual(await page.$$eval(".cart-line", (l) => l.length), 2);
  assert.match(await page.textContent("[data-total]"), /33\.494,78/);
  await page.click("[data-cart-step='1'][data-id='dbh-9888']");
  assert.match(await page.textContent("[data-total]"), /48\.942,10/);
  await page.fill("[data-cart-qty='dbh-9888']", "1");
  await page.dispatchEvent("[data-cart-qty='dbh-9888']", "change");
  assert.match(await page.textContent("[data-total]"), /33\.494,78/);
  await shot("carrito");
  await page.click("[data-remove='dbh-9888']");
  assert.strictEqual(await page.$$eval(".cart-line", (l) => l.length), 1);

  // Persistencia al recargar
  await page.reload();
  await page.waitForSelector(".cart-line");

  // Pedido por WhatsApp
  await page.click("a[href='#/pedido']");
  await page.waitForSelector("h1:has-text('Revisá tu pedido')");
  await page.fill("input[name=name]", "Juan Pérez");
  const msg = await page.inputValue("textarea[name=message]");
  assert.match(msg, /Retén SABÓ 5159 \(05159BRAGF\)/);
  assert.match(msg, /Nombre: Juan Pérez/);
  const href = await page.getAttribute("[data-send]", "href");
  assert.ok(href.startsWith("https://wa.me/"));
  assert.ok(decodeURIComponent(href).includes("Total estimado: $ 18.047,46"));
  await page.fill("textarea[name=message]", "Mensaje editado");
  assert.ok((await page.getAttribute("[data-send]", "href")).endsWith(encodeURIComponent("Mensaje editado")));
  await shot("pedido");

  // Otras páginas
  for (const r of ["retenes", "como-encontrar", "ayuda", "contacto", "no-existe"]) {
    await page.goto(BASE + "#/" + r);
    await page.waitForSelector("h1");
  }

  // Sin scroll horizontal
  for (const r of ["", "#/buscar?q=sabo", "#/producto/sabo-1924", "#/carrito", "#/vehiculo?marca=ford"]) {
    await page.goto(BASE + r);
    await page.waitForSelector("h1");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `scroll horizontal en ${r || "home"} (${label}): ${overflow}px`);
  }

  assert.deepStrictEqual(errors, [], "errores en consola o recursos: " + errors.join(" | "));
  await browser.close();
  console.log("OK", label);
}

(async () => {
  await run({ width: 390, height: 844 }, "mobile");
  await run({ width: 1366, height: 900 }, "desktop");
})().catch((e) => { console.error(e); process.exit(1); });

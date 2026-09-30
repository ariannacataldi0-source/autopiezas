/* Tests de lógica. Ejecutar con: node --test tests/unit.test.js (no requiere instalar nada). */
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function load() {
  const ctx = { window: {}, Intl, URLSearchParams };
  vm.createContext(ctx);
  for (const f of ["config.js", "data.js", "search.js", "cart.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8"), ctx);
  }
  return ctx.window.AW;
}
const AW = load();
const { data, config: cfg, search: S } = AW;
const ids = (r) => Array.from(r.items, (p) => p.shortCode); // arrays del contexto vm -> realm actual

test("datos: 20 productos, cada uno con al menos una compatibilidad", () => {
  assert.strictEqual(data.products.length, 20);
  for (const p of data.products) assert.ok(S.fitmentsFor(data, p.id).length > 0, p.id);
  for (const p of data.products) assert.ok(cfg.applications[p.application], p.application);
});

test("parseDimensions acepta distintos formatos", () => {
  for (const q of ["35x52x7", "35 x 52 x 7", "35X52X7", "35*52*7", "35 × 52 × 7"]) {
    const d = S.parseDimensions(q);
    assert.deepStrictEqual([d.inner, d.outer, d.width], [35, 52, 7], q);
  }
  const d = S.parseDimensions("31,5x42x7");
  assert.strictEqual(d.inner, 31.5);
  assert.strictEqual(S.parseDimensions("35x52").width, null);
  assert.strictEqual(S.parseDimensions("5159"), null);
});

test("búsqueda por código corto, código de fabricante y marca+código", () => {
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "5159")), ["5159"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "05159BRAGF")), ["5159"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "SABÓ 4247")), ["4247"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "sabo 4247")), ["4247"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "DBH 9888")), ["9888"]);
});

test("búsqueda por medida", () => {
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "32x42x7")), ["5159"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "31,5 x 42 x 7")), ["5439"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "9,9x15x14")), ["1924"]); // ancho alternativo
  const r = S.directSearch(data, cfg, "32x42x8");
  assert.strictEqual(r.status, "empty");
  assert.ok(r.similar.some((p) => p.shortCode === "5159"));
});

test("búsqueda por texto de vehículo y parte", () => {
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "ranger semieje")), ["9888"]);
  assert.deepStrictEqual(ids(S.directSearch(data, cfg, "gol distribución")), ["5159"]);
  assert.strictEqual(S.directSearch(data, cfg, "fox").total, 2);
});

test("sin resultados y consulta vacía", () => {
  assert.strictEqual(S.directSearch(data, cfg, "zzzz").status, "empty");
  assert.strictEqual(S.directSearch(data, cfg, "   ").status, "invalid");
  assert.strictEqual(S.directSearch(data, cfg, "reten de").status, "invalid");
});

test("nunca devuelve más de 20: con más resultados pide un filtro", () => {
  const big = JSON.parse(JSON.stringify({ products: data.products, fitments: data.fitments, makes: data.makes, models: data.models }));
  for (let i = 0; i < 30; i++) {
    const p = JSON.parse(JSON.stringify(data.products[0]));
    p.id = "extra-" + i; p.shortCode = "9" + i;
    big.products.push(p);
    big.fitments.push({ ...data.fitments[0], productId: p.id });
  }
  const r = S.directSearch(big, cfg, "sabo");
  assert.strictEqual(r.status, "too-many");
  assert.strictEqual(r.items.length, 0);
  assert.ok(r.total > 20);
  const filtered = S.directSearch(big, cfg, "sabo", { application: "bancada" });
  assert.strictEqual(filtered.status, "ok");
  assert.ok(filtered.items.length <= 20);
});

test("filtros dependientes por vehículo", () => {
  let st = S.vehicleState(data, cfg, {});
  assert.strictEqual(st.step, "make");
  assert.ok(st.makes.find((m) => m.key === "volkswagen"));

  st = S.vehicleState(data, cfg, { make: "volkswagen" });
  assert.strictEqual(st.step, "model");
  const vwModels = st.models.map((m) => m.key);
  assert.ok(vwModels.includes("gol") && vwModels.includes("fox"));
  assert.ok(!vwModels.includes("corsa"), "solo modelos de la marca elegida");

  st = S.vehicleState(data, cfg, { make: "volkswagen", model: "gol" });
  // el Gol solo tiene retenes de motor: se saltea el paso de zona y de parte
  assert.strictEqual(st.step, "results");
  assert.deepStrictEqual(ids(st.results), ["5159"]);

  st = S.vehicleState(data, cfg, { make: "peugeot", model: "206" });
  assert.strictEqual(st.step, "app");
  assert.deepStrictEqual(Array.from(st.apps, (a) => a.key).sort(), ["arbol-de-levas", "bancada"]);
  st = S.vehicleState(data, cfg, { make: "peugeot", model: "206", zone: "motor", app: "bancada" });
  assert.deepStrictEqual(ids(st.results), ["5420"]);

  st = S.vehicleState(data, cfg, { make: "ford" });
  assert.ok(st.models.every((m) => m.count > 0));
});

test("carrito: agregar, modificar, eliminar, subtotal", () => {
  const mem = {}; const storage = { getItem: (k) => mem[k] || null, setItem: (k, v) => { mem[k] = v; } };
  const cart = AW.createCart(storage);
  cart.add("sabo-5159", 2);
  cart.add("dbh-9888");
  assert.strictEqual(cart.count(), 3);
  cart.set("dbh-9888", 3);
  assert.strictEqual(cart.get("dbh-9888"), 3);
  cart.set("sabo-5159", 200);
  assert.strictEqual(cart.get("sabo-5159"), 99);
  cart.set("sabo-5159", 2);
  const sum = AW.order.summarize(data, cart);
  assert.strictEqual(sum.totalCents, 902373 * 2 + 1544732 * 3);
  cart.remove("dbh-9888");
  assert.strictEqual(cart.count(), 2);
  const reloaded = AW.createCart(storage);
  assert.strictEqual(reloaded.get("sabo-5159"), 2);
});

test("mensaje de WhatsApp con productos reales del carrito", () => {
  const mem = {}; const storage = { getItem: (k) => mem[k] || null, setItem: (k, v) => { mem[k] = v; } };
  const cart = AW.createCart(storage);
  cart.add("sabo-5159", 2);
  cart.add("dbh-9888", 1);
  const msg = AW.order.buildMessage(data, cfg, AW.order.summarize(data, cart), { name: "Juan" });
  assert.match(msg, /^Hola, quiero realizar el siguiente pedido:/);
  assert.match(msg, /Retén SABÓ 5159 \(05159BRAGF\)/);
  assert.match(msg, /2 x \$ 9\.023,73 = \$ 18\.047,46/);
  assert.match(msg, /Retén DBH 9888 —/);
  assert.match(msg, /Total estimado: \$ 33\.494,78/);
  assert.match(msg, /Nombre: Juan/);
  assert.match(msg, /Quisiera finalizar el pedido\.$/);
  const url = AW.order.whatsappUrl({ whatsappNumber: "+54 9 11 1234-5678" }, msg);
  assert.ok(url.startsWith("https://wa.me/5491112345678?text=Hola%2C"));
});

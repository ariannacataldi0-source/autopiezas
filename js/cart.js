/* Carrito (persistido en localStorage) y armado del mensaje de WhatsApp. */
(function (AW) {
  "use strict";

  var KEY = "aw_cart_v1";
  var MAX_QTY = 99;

  function safeStorage() {
    try { var t = "__aw"; window.localStorage.setItem(t, t); window.localStorage.removeItem(t); return window.localStorage; }
    catch (e) { return null; }
  }

  function createCart(storage) {
    var items = {}; // { productId: qty }
    var listeners = [];
    try {
      var raw = storage && storage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        Object.keys(parsed).forEach(function (id) {
          var q = parseInt(parsed[id], 10);
          if (q > 0) items[id] = Math.min(q, MAX_QTY);
        });
      }
    } catch (e) { items = {}; }

    function save() {
      try { if (storage) storage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* sin almacenamiento */ }
      listeners.forEach(function (fn) { fn(); });
    }

    return {
      MAX_QTY: MAX_QTY,
      get: function (id) { return items[id] || 0; },
      entries: function () { return Object.keys(items).map(function (id) { return { id: id, qty: items[id] }; }); },
      count: function () { return Object.keys(items).reduce(function (s, id) { return s + items[id]; }, 0); },
      add: function (id, qty) {
        qty = parseInt(qty, 10) || 1;
        items[id] = Math.min((items[id] || 0) + qty, MAX_QTY);
        save();
      },
      set: function (id, qty) {
        qty = parseInt(qty, 10);
        if (!(qty > 0)) delete items[id];
        else items[id] = Math.min(qty, MAX_QTY);
        save();
      },
      remove: function (id) { delete items[id]; save(); },
      clear: function () { items = {}; save(); },
      onChange: function (fn) { listeners.push(fn); }
    };
  }

  /* Calcula líneas y total en centavos para evitar errores de redondeo. */
  function summarize(data, cart) {
    var lines = [];
    cart.entries().forEach(function (e) {
      var p = AW.search.getProduct(data, e.id);
      if (!p) return;
      // price null = precio a consultar: no suma al total.
      var unitCents = p.price == null ? null : Math.round(p.price * 100);
      lines.push({ product: p, qty: e.qty, unitCents: unitCents, subtotalCents: unitCents == null ? null : unitCents * e.qty });
    });
    var totalCents = lines.reduce(function (s, l) { return s + (l.subtotalCents || 0); }, 0);
    var pending = lines.filter(function (l) { return l.unitCents == null; }).length;
    return { lines: lines, totalCents: totalCents, pending: pending };
  }

  function buildOrderMessage(data, cfg, summary, extra) {
    extra = extra || {};
    var fp = AW.util.formatPrice;
    var out = ["Hola, quiero realizar el siguiente pedido:", ""];
    summary.lines.forEach(function (l) {
      var p = l.product;
      out.push("• Retén " + AW.search.codeLabel(p) + " — " + AW.search.appLabel(cfg, p.application) + " — " +
        AW.search.vehicleSummary(data, p.id, 3) + " — " + AW.util.formatDims(p.dimensions).replace(/ /g, ""));
      out.push(l.unitCents == null ? "  " + l.qty + " x precio a consultar" :
        "  " + l.qty + " x " + fp(l.unitCents / 100) + " = " + fp(l.subtotalCents / 100));
    });
    out.push("");
    out.push("Total estimado: " + fp(summary.totalCents / 100) +
      (summary.pending ? " (sin incluir " + (summary.pending === 1 ? "1 producto" : summary.pending + " productos") + " con precio a consultar)" : ""));
    out.push("(Precios de referencia de la web)");
    if (extra.name || extra.city) out.push("");
    if (extra.name) out.push("Nombre: " + extra.name);
    if (extra.city) out.push("Localidad: " + extra.city);
    out.push("", "Quisiera finalizar el pedido.");
    return out.join("\n").replace(/ /g, " ");
  }

  function whatsappUrl(cfg, text) {
    var num = String(cfg.whatsappNumber || "").replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
  }

  AW.createCart = createCart;
  AW.cart = createCart(typeof window !== "undefined" ? safeStorage() : null);
  AW.order = { summarize: summarize, buildMessage: buildOrderMessage, whatsappUrl: whatsappUrl };
})(window.AW = window.AW || {});

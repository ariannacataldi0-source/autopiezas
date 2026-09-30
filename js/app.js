/* Interfaz: router por hash, vistas y eventos. */
(function (AW) {
  "use strict";

  var data = AW.data, cfg = AW.config, S = AW.search, U = AW.util, cart = AW.cart;
  var main = document.getElementById("main");
  var VEHICLE_KEY = "aw_vehicle_v1";

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function qs(params) {
    var parts = [];
    Object.keys(params).forEach(function (k) {
      if (params[k] != null && params[k] !== "") parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  function getVehicle() {
    try { var v = JSON.parse(localStorage.getItem(VEHICLE_KEY)); return v && v.make && v.model ? v : null; }
    catch (e) { return null; }
  }
  function setVehicle(v) {
    try { if (v) localStorage.setItem(VEHICLE_KEY, JSON.stringify(v)); else localStorage.removeItem(VEHICLE_KEY); }
    catch (e) { /* sin almacenamiento */ }
    renderVehicleChip();
  }
  function vehicleName(v) { return S.makeLabel(data, v.make) + " " + S.modelLabel(data, v.make, v.model); }

  function icon(name) {
    var paths = {
      car: '<path d="M5 17h14M6.5 17v2M17.5 17v2M4 13l1.6-4.8A2 2 0 0 1 7.5 7h9a2 2 0 0 1 1.9 1.2L20 13v4H4z"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/>',
      search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
      cart: '<path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
      whatsapp: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-1.9-.9-.8.8a4 4 0 0 1-2.5-2.5l.8-.8-.9-1.9z"/>',
      engine: '<path d="M4 10h2V8h3V6h5v2h2l2 2h2v6h-2l-2 2H9l-2-2H4z"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
      wheel: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      back: '<path d="M15 5l-7 7 7 7"/>',
      trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
      pin: '<path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
      phone: '<path d="M5 4h4l1.5 4.5-2.3 1.4a11 11 0 0 0 5.9 5.9l1.4-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
      mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
      steering: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M3.8 10.5h6.3M13.9 10.5h6.3M12 14v6.5"/>'
    };
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (paths[name] || "") + "</svg>";
  }
  var ZONE_ICON = { motor: "engine", transmision: "gear", ruedas: "wheel", direccion: "steering" };

  /* Dibujo técnico generado a partir de las medidas reales (no es una foto). */
  function dimensionDrawing(p, large) {
    var d = p.dimensions, W = 200, cx = 78, cy = 80, R = 58;
    var r = Math.max(10, R * d.inner / d.outer);
    var wPx = Math.max(8, Math.min(40, R * 2 * d.width / d.outer));
    var sx = 160;
    return '<figure class="drawing' + (large ? " drawing--large" : "") + '">' +
      '<svg viewBox="0 0 ' + W + ' 170" role="img" aria-label="Dibujo de medidas: diámetro interior ' + esc(U.formatNumber(d.inner)) +
      ' mm, diámetro exterior ' + esc(U.formatNumber(d.outer)) + ' mm, ancho ' + esc(U.formatNumber(d.width)) + ' mm">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="dr-outer"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + ((R + r) / 2).toFixed(1) + '" class="dr-lip"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r.toFixed(1) + '" class="dr-inner"/>' +
      '<rect x="' + (sx - wPx / 2).toFixed(1) + '" y="' + (cy - R) + '" width="' + wPx.toFixed(1) + '" height="' + (2 * R) + '" rx="2" class="dr-side"/>' +
      '<text x="' + cx + '" y="' + (cy + 4) + '" class="dr-t">Ø ' + esc(U.formatNumber(d.inner)) + '</text>' +
      '<text x="' + cx + '" y="' + (cy - R - 6) + '" class="dr-t">Ø ext ' + esc(U.formatNumber(d.outer)) + '</text>' +
      '<text x="' + sx + '" y="' + (cy + R + 16) + '" class="dr-t">' + esc(U.formatNumber(d.width)) + (d.widthAlt ? "/" + esc(U.formatNumber(d.widthAlt)) : "") + '</text>' +
      '</svg><figcaption>Dibujo de medidas en mm · foto del producto no disponible</figcaption></figure>';
  }

  function productImage(p, large) {
    if (p.image && p.image.url && p.image.verified) {
      return '<img class="product-img" src="' + esc(p.image.url) + '" alt="' + esc(S.productTitle(cfg, p) + " " + p.brand + " " + p.shortCode) + '" loading="lazy">';
    }
    return dimensionDrawing(p, large);
  }

  function priceHtml(p, large) {
    if (p.price == null) {
      return '<p class="price price--ask' + (large ? " price--lg" : "") + '">Precio a consultar</p>';
    }
    return '<p class="price' + (large ? " price--lg" : "") + '">' + esc(U.formatPrice(p.price)) +
      (large ? "" : ' <span class="price-note">precio de referencia</span>') + "</p>";
  }

  function addButton(p) {
    var inCart = cart.get(p.id);
    return '<button type="button" class="btn btn-primary" data-add="' + esc(p.id) + '">' + icon("cart") +
      (inCart ? "Agregar otro (" + inCart + " en carrito)" : "Agregar al carrito") + "</button>";
  }

  function productCard(p) {
    var v = getVehicle();
    var compatible = v && S.isCompatible(data, p.id, v);
    var years = S.yearsLabel(data, p.id);
    var engine = S.engineLabel(data, p.id);
    return '<article class="card product-card">' +
      '<a class="card-media" href="#/producto/' + esc(p.id) + '" tabindex="-1" aria-hidden="true">' + productImage(p) + "</a>" +
      '<div class="card-body">' +
      (compatible ? '<p class="badge badge-ok">' + icon("check") + "Compatible con tu " + esc(vehicleName(v)) + "</p>" : "") +
      '<h3 class="card-title"><a href="#/producto/' + esc(p.id) + '">' + esc(S.productTitle(cfg, p)) + "</a></h3>" +
      '<p class="card-vehicles">' + esc(S.vehicleSummary(data, p.id, 4)) + "</p>" +
      '<p class="card-dims"><span class="label">Medidas</span> ' + esc(U.formatDims(p.dimensions)) + "</p>" +
      '<dl class="card-facts">' +
      "<div><dt>Parte</dt><dd>" + esc(S.appLabel(cfg, p.application)) + (p.detail && p.detail !== engine ? " · " + esc(p.detail) : "") + "</dd></div>" +
      "<div><dt>Año</dt><dd>" + (years ? esc(years) : "Consultar") + "</dd></div>" +
      (engine ? "<div><dt>Motor</dt><dd>" + esc(engine) + "</dd></div>" : "") +
      "<div><dt>Marca</dt><dd>" + esc(p.brand) + " · Cód. " + esc(p.shortCode) + "</dd></div>" +
      "</dl>" +
      priceHtml(p) +
      '<p class="stock">Stock: consultar</p>' +
      '<div class="card-actions"><a class="btn btn-secondary" href="#/producto/' + esc(p.id) + '">Ver producto</a>' + addButton(p) + "</div>" +
      "</div></article>";
  }

  function productGrid(items) {
    return '<div class="grid">' + items.map(productCard).join("") + "</div>";
  }

  function waLink(text, label, cls) {
    return '<a class="btn btn-whatsapp ' + (cls || "") + '" href="' + esc(AW.order.whatsappUrl(cfg, text)) + '" target="_blank" rel="noopener">' +
      icon("whatsapp") + esc(label || "Consultar por WhatsApp") + "</a>";
  }

  function helpBlock(title, context) {
    return '<section class="help-block" aria-labelledby="help-title">' +
      '<h2 id="help-title">' + esc(title || "¿No encontrás el retén que necesitás?") + "</h2>" +
      "<p>Mandanos los datos de tu vehículo o una foto del retén y te ayudamos.</p>" +
      waLink("Hola, necesito ayuda para encontrar un retén." + (context ? " " + context : "")) +
      "</section>";
  }

  function notFoundBlock(context) {
    return '<section class="notfound" aria-labelledby="nf-title">' +
      '<h2 id="nf-title">¿No encontrás tu retén?</h2>' +
      "<p><strong>No te preocupes. Podemos ayudarte.</strong> Podés enviarnos:</p>" +
      '<ul class="checklist"><li>Marca</li><li>Modelo</li><li>Año</li><li>Parte del vehículo</li></ul>' +
      "<p>o incluso una foto del retén que tenés.</p>" +
      waLink("Hola, no encontré el retén que necesito en la web." + (context ? " " + context : "") + " Les paso los datos:") +
      "</section>";
  }

  /* ---------- Vistas ---------- */
  function viewHome() {
    var featured = ["sabo-5159", "sabo-2371", "sabo-5547", "sabo-4247", "sabo-5420", "dbh-9888"].map(function (id) { return S.getProduct(data, id); }).filter(Boolean);
    var makes = S.vehicleState(data, cfg, {}).makes;
    return {
      title: "Retenes",
      html:
        '<section class="hero"><div class="container">' +
        '<h1 tabindex="-1">Encontrá el retén que necesitás</h1>' +
        '<p class="lead">Buscá por tu vehículo o directamente por código, marca o medida.</p>' +
        '<div class="hero-actions">' +
        '<a class="btn btn-hero" href="#/vehiculo">' + icon("car") + "Buscar por vehículo</a>" +
        '<a class="btn btn-hero btn-hero--alt" href="#/buscar">' + icon("search") + "Buscar por código o medida</a>" +
        "</div>" +
        searchForm("", true) +
        "</div></section>" +

        '<section class="section"><div class="container">' +
        "<h2>¿No sabés cuál necesitás?</h2>" +
        '<p class="section-lead">Elegí tu vehículo y te ayudamos a encontrarlo.</p>' +
        '<div class="options options--makes">' + makes.map(function (m) {
          return '<a class="option" href="#/vehiculo' + qs({ marca: m.key }) + '"><span class="option-label">' + esc(m.label) + "</span></a>";
        }).join("") + "</div>" +
        '<p><a class="btn btn-primary" href="#/vehiculo">' + icon("car") + "Buscar por vehículo</a></p>" +
        "</div></section>" +

        '<section class="section section--tint"><div class="container">' +
        "<h2>¿Ya sabés qué retén buscás?</h2>" +
        '<p class="section-lead">Escribí el código, la marca o las medidas. Por ejemplo: <kbd>5159</kbd>, <kbd>SABÓ 4247</kbd> o <kbd>32x42x7</kbd>.</p>' +
        '<p><a class="btn btn-primary" href="#/buscar">' + icon("search") + "Buscar por código, marca o medida</a></p>" +
        "</div></section>" +

        '<section class="section"><div class="container">' +
        "<h2>Retenes destacados</h2>" + productGrid(featured) +
        "</div></section>" +

        '<section class="section section--tint"><div class="container">' +
        "<h2>Por qué comprar en Autopiezas Warnes</h2>" +
        '<ul class="trust">' +
        "<li><strong>Desde " + cfg.company.since + " en Av. Warnes</strong><span>Más de medio siglo en el rubro de autopartes.</span></li>" +
        "<li><strong>Distribuimos a todo el país</strong><span>Enviamos a clientes de todo el país.</span></li>" +
        "<li><strong>Atención personalizada</strong><span>Te ayudamos a identificar el retén correcto.</span></li>" +
        "<li><strong>Consultas por WhatsApp</strong><span>Mandanos una foto o los datos de tu vehículo.</span></li>" +
        "</ul></div></section>" +

        '<div class="container">' + helpBlock() + "</div>"
    };
  }

  function viewRetenes() {
    var apps = {};
    data.products.forEach(function (p) { apps[p.application] = (apps[p.application] || 0) + 1; });
    return {
      title: "Retenes",
      html: '<div class="container page">' +
        '<h1 tabindex="-1">Retenes</h1>' +
        '<p class="lead">Elegí cómo querés buscar.</p>' +
        '<div class="path-cards">' +
        '<a class="path-card" href="#/vehiculo">' + icon("car") + "<strong>No sé qué retén necesito</strong><span>Elegí tu vehículo y dónde va el retén.</span></a>" +
        '<a class="path-card" href="#/buscar">' + icon("search") + "<strong>Sé qué retén busco</strong><span>Buscá por código, marca o medida.</span></a>" +
        "</div>" +
        "<h2>Explorar por parte del vehículo</h2>" +
        cfg.zones.map(function (z) {
          var list = Object.keys(cfg.applications).filter(function (k) { return cfg.applications[k].zone === z.key && apps[k]; });
          if (!list.length) return "";
          return '<h3 class="zone-title">' + icon(ZONE_ICON[z.key]) + esc(z.label) + '</h3><div class="options">' +
            list.map(function (k) {
              return '<a class="option" href="#/buscar' + qs({ parte: k }) + '"><span class="option-label">' + esc(cfg.applications[k].label) +
                '</span><span class="option-hint">' + esc(cfg.applications[k].explanation) + '</span><span class="option-count">' + plural(apps[k], "retén", "retenes") + "</span></a>";
            }).join("") + "</div>";
        }).join("") +
        helpBlock() + "</div>"
    };
  }

  function stepsNav(sel, st) {
    var crumbs = [{ label: "Marca", href: "#/vehiculo" }];
    if (sel.make) crumbs.push({ label: S.makeLabel(data, sel.make), href: "#/vehiculo" + qs({ marca: sel.make }) });
    if (sel.model) crumbs.push({ label: S.modelLabel(data, sel.make, sel.model), href: "#/vehiculo" + qs({ marca: sel.make, modelo: sel.model }) });
    if (st.zone) crumbs.push({ label: (cfg.zones.filter(function (z) { return z.key === st.zone; })[0] || {}).label, href: "#/vehiculo" + qs({ marca: sel.make, modelo: sel.model, zona: st.zone }) });
    if (st.app) crumbs.push({ label: S.appLabel(cfg, st.app), href: "#/vehiculo" + qs({ marca: sel.make, modelo: sel.model, zona: st.zone, parte: st.app }) });
    return '<nav class="steps" aria-label="Tu búsqueda"><ol>' + crumbs.map(function (c, i) {
      var last = i === crumbs.length - 1;
      return "<li>" + (last ? '<span aria-current="step">' + esc(c.label) + "</span>" : '<a href="' + esc(c.href) + '">' + esc(c.label) + "</a>") + "</li>";
    }).join("") + "</ol></nav>";
  }

  function viewVehicle(params) {
    var sel = { make: params.get("marca"), model: params.get("modelo"), zone: params.get("zona"), app: params.get("parte"), engine: params.get("motor") };
    var st = S.vehicleState(data, cfg, sel);
    if (sel.make && sel.model && st.step !== "model" && st.step !== "make") setVehicle({ make: sel.make, model: sel.model });

    var body = "", title = "Buscar por vehículo", q;
    if (st.step === "make") {
      q = "¿Qué vehículo tenés?";
      body = '<p class="step-help">Elegí la marca.</p><div class="options options--makes">' + st.makes.map(function (m) {
        return '<a class="option" href="#/vehiculo' + qs({ marca: m.key }) + '"><span class="option-label">' + esc(m.label) + "</span></a>";
      }).join("") + "</div>";
    } else if (st.step === "model") {
      q = "¿Qué modelo?";
      body = '<p class="step-help">Elegí el modelo de tu ' + esc(S.makeLabel(data, sel.make)) + ".</p>" +
        (st.models.length > 10 ? '<label class="field filter-field"><span>Filtrar modelos</span><input type="search" id="model-filter" autocomplete="off" placeholder="Escribí el modelo"></label>' : "") +
        '<div class="options" id="model-options">' + st.models.map(function (m) {
          return '<a class="option" data-name="' + esc(U.normalize(m.label)) + '" href="#/vehiculo' + qs({ marca: sel.make, modelo: m.key }) + '"><span class="option-label">' + esc(m.label) +
            '</span><span class="option-count">' + plural(m.count, "retén", "retenes") + "</span></a>";
        }).join("") + "</div>";
    } else if (st.step === "zone") {
      q = "¿Dónde va el retén?";
      body = '<p class="step-help">Elegí la zona del vehículo. Solo mostramos las que tienen retenes para tu ' + esc(S.modelLabel(data, sel.make, sel.model)) + ".</p>" +
        '<div class="options options--big">' + st.zones.map(function (z) {
          return '<a class="option" href="#/vehiculo' + qs({ marca: sel.make, modelo: sel.model, zona: z.key }) + '">' + icon(ZONE_ICON[z.key]) +
            '<span class="option-label">' + esc(z.label) + '</span><span class="option-hint">' + esc(z.hint) + '</span><span class="option-count">' + plural(z.count, "retén", "retenes") + "</span></a>";
        }).join("") + "</div>";
    } else if (st.step === "app") {
      var zl = (cfg.zones.filter(function (z) { return z.key === st.zone; })[0] || {}).label;
      q = "¿En qué parte " + ({ ruedas: "de las ruedas", motor: "del motor", direccion: "de la dirección" }[st.zone] || "de la transmisión") + "?";
      body = '<p class="step-help">' + esc(zl) + ": elegí dónde va el retén.</p>" +
        '<div class="options options--big">' + st.apps.map(function (a) {
          return '<a class="option" href="#/vehiculo' + qs({ marca: sel.make, modelo: sel.model, zona: st.zone, parte: a.key }) + '"><span class="option-label">' + esc(a.label) +
            '</span><span class="option-hint">' + esc(a.explanation) + '</span><span class="option-count">' + plural(a.count, "retén", "retenes") + "</span></a>";
        }).join("") + "</div>";
    } else if (st.step === "engine") {
      q = "¿Qué motor tiene?";
      body = '<p class="step-help">Para este modelo hay retenes distintos según el motor.</p><div class="options">' +
        st.engines.map(function (e) {
          return '<a class="option" href="#/vehiculo' + qs({ marca: sel.make, modelo: sel.model, zona: st.zone, parte: st.app, motor: e.key }) + '"><span class="option-label">' + esc(e.label) + '</span><span class="option-count">' + plural(e.count, "retén", "retenes") + "</span></a>";
        }).join("") +
        '<a class="option" href="#/vehiculo' + qs({ marca: sel.make, modelo: sel.model, zona: st.zone, parte: st.app, motor: "todos" }) + '"><span class="option-label">No sé / ver todos</span></a>' +
        "</div>";
    } else {
      var r = st.results, vname = S.makeLabel(data, sel.make) + " " + S.modelLabel(data, sel.make, sel.model);
      title = "Retenes para " + vname;
      q = r.status === "ok" ? "Encontramos " + plural(r.total, "retén", "retenes") : r.status === "too-many" ? "Encontramos " + r.total + " retenes" : "No encontramos retenes";
      body = '<p class="results-context">Para tu <strong>' + esc(vname) + "</strong> · " + esc(S.appLabel(cfg, st.app)) + "</p>" +
        '<p class="note">' + icon("info") + "El año de compatibilidad no está disponible para la mayoría de los retenes. Si tenés dudas, consultanos antes de comprar.</p>" +
        (r.status === "ok" ? productGrid(r.items) + helpBlock("¿No es el que buscabas?", "Tengo un " + vname + ".") :
          r.status === "too-many" ? '<p class="alert">No encontramos una coincidencia suficientemente específica. Agregá un filtro para encontrar el retén correcto.</p>' :
          notFoundBlock("Tengo un " + vname + "."));
    }
    return {
      title: title,
      html: '<div class="container page">' + stepsNav(sel, st) +
        (st.step !== "make" ? '<p><a class="back-link" href="javascript:history.back()">' + icon("back") + "Volver</a></p>" : "") +
        '<h1 tabindex="-1" aria-live="polite">' + esc(q) + "</h1>" + body +
        (st.step !== "results" ? '<p class="step-alt">¿Ya sabés el código o la medida? <a href="#/buscar">Buscá directamente</a>.</p>' : "") +
        "</div>"
    };
  }

  function searchForm(q, compact) {
    var dims = S.parseDimensions(q) || {};
    return '<form class="search-form' + (compact ? " search-form--hero" : "") + '" data-search-form role="search">' +
      '<label class="field"><span>' + (compact ? "Código, marca o medida" : "Código, marca, medida o vehículo") + "</span>" +
      '<div class="search-row"><input type="search" name="q" value="' + esc(q) + '" placeholder="Ej: 5159, SABÓ 4247, 32x42x7" autocomplete="off" enterkeyhint="search">' +
      '<button class="btn btn-primary" type="submit">' + icon("search") + "Buscar</button></div></label>" +
      (compact ? "" :
        '<details class="dims-box"' + (dims.inner ? " open" : "") + "><summary>Buscar por medidas (en mm)</summary>" +
        '<div class="dims-fields">' +
        '<label class="field"><span>Ø interior</span><input name="di" inputmode="decimal" value="' + esc(dims.inner ? U.formatNumber(dims.inner) : "") + '" placeholder="32"></label>' +
        '<label class="field"><span>Ø exterior</span><input name="de" inputmode="decimal" value="' + esc(dims.outer ? U.formatNumber(dims.outer) : "") + '" placeholder="42"></label>' +
        '<label class="field"><span>Ancho</span><input name="an" inputmode="decimal" value="' + esc(dims.width ? U.formatNumber(dims.width) : "") + '" placeholder="7"></label>' +
        '<button class="btn btn-secondary" type="submit" name="by" value="dims">Buscar medida</button>' +
        '</div><p class="form-error" data-dims-error hidden>Completá al menos el diámetro interior y el exterior.</p></details>') +
      "</form>";
  }

  function facetList(title, key, list, params) {
    if (!list || list.length < 2 && !params.get(key)) return "";
    var current = params.get(key);
    return '<div class="facet"><h3>' + esc(title) + "</h3><ul>" + list.map(function (f) {
      var p = {}; params.forEach(function (v, k) { p[k] = v; });
      p[key] = current === f.key ? "" : f.key;
      return '<li><a class="facet-link' + (current === f.key ? " is-active" : "") + '" href="#/buscar' + qs(p) + '"' + (current === f.key ? ' aria-current="true"' : "") + ">" +
        (current === f.key ? icon("check") : "") + esc(f.label) + ' <span class="count">(' + f.count + ")</span></a></li>";
    }).join("") + "</ul></div>";
  }

  function viewSearch(params) {
    var q = params.get("q") || "";
    var filters = { brand: params.get("marca"), application: params.get("parte"), make: params.get("vehiculo") };
    var hasQuery = q || filters.brand || filters.application || filters.make;
    var res = hasQuery ? S.directSearch(data, cfg, q, filters) : null;

    var chips = [];
    if (filters.application) chips.push(["parte", "Parte: " + S.appLabel(cfg, filters.application)]);
    if (filters.brand) chips.push(["marca", "Marca: " + filters.brand]);
    if (filters.make) chips.push(["vehiculo", "Vehículo: " + S.makeLabel(data, filters.make)]);
    var chipsHtml = chips.length ? '<ul class="chips">' + chips.map(function (c) {
      var p = {}; params.forEach(function (v, k) { p[k] = v; }); p[c[0]] = "";
      return '<li><a class="chip" href="#/buscar' + qs(p) + '" aria-label="Quitar filtro ' + esc(c[1]) + '">' + esc(c[1]) + ' <span aria-hidden="true">✕</span></a></li>';
    }).join("") + "</ul>" : "";

    var heading, content = "", sidebar = "";
    if (!res) {
      heading = "Buscar por código, marca o medida";
      content = '<div class="tips"><h2>Podés buscar así</h2><ul>' +
        '<li><a href="#/buscar?q=5159">5159</a> — código del retén</li>' +
        '<li><a href="#/buscar?q=05159BRAGF">05159BRAGF</a> — código del fabricante</li>' +
        '<li><a href="#/buscar?q=SAB%C3%93%204247">SABÓ 4247</a> — marca y código</li>' +
        '<li><a href="#/buscar?q=32x42x7">32x42x7</a> — medidas: interior × exterior × ancho</li>' +
        '<li><a href="#/buscar?q=ranger%20semieje">ranger semieje</a> — vehículo y parte</li></ul></div>' + helpBlock();
    } else if (res.status === "invalid") {
      heading = "Buscar por código, marca o medida";
      content = '<p class="alert" role="alert">Escribí un código, una marca, una medida o un vehículo para buscar.</p>';
    } else {
      if (res.facets) {
        sidebar = facetList("Parte del vehículo", "parte", res.facets.application, params) +
          facetList("Marca del retén", "marca", res.facets.brand, params) +
          facetList("Marca del vehículo", "vehiculo", res.facets.make, params);
      }
      if (res.status === "ok") {
        heading = "Encontramos " + plural(res.total, "retén", "retenes");
        content = productGrid(res.items) + helpBlock("¿No es el que buscabas?", q ? "Busqué: " + q + "." : "");
      } else if (res.status === "too-many") {
        heading = "Encontramos " + res.total + " retenes";
        var base = {}; params.forEach(function (v, k) { base[k] = v; });
        var suggest = res.facets.application.filter(function (f) { return f.key !== filters.application; });
        content = '<p class="alert">No encontramos una coincidencia suficientemente específica. Agregá un filtro para encontrar el retén correcto.</p>' +
          (suggest.length ? "<h2>¿Dónde va el retén?</h2>" + '<div class="options">' + suggest.map(function (f) {
            var p = Object.assign({}, base, { parte: f.key });
            return '<a class="option" href="#/buscar' + qs(p) + '"><span class="option-label">' + esc(f.label) +
              '</span><span class="option-count">' + plural(f.count, "retén", "retenes") + "</span></a>";
          }).join("") + "</div>" : "") +
          '<p class="step-alt">O buscá por tu vehículo: <a href="#/vehiculo">elegí marca y modelo</a>.</p>';
      } else {
        heading = "No encontramos retenes" + (q ? " para “" + q + "”" : "");
        content = (res.similar.length ?
          '<h2>Medidas parecidas</h2><p class="note">' + icon("info") + "Estos retenes <strong>no tienen exactamente</strong> la medida que buscaste (difieren hasta 1 mm). Verificá antes de comprar.</p>" + productGrid(res.similar) : "") +
          notFoundBlock(q ? "Busqué: " + q + "." : "");
      }
    }
    return {
      title: "Buscar retenes",
      html: '<div class="container page">' +
        '<h1 tabindex="-1" aria-live="polite">' + esc(heading) + "</h1>" + searchForm(q, false) + chipsHtml +
        (sidebar ? '<div class="with-sidebar"><aside class="sidebar" aria-label="Filtros">' +
          '<details class="filters" open><summary>Filtros</summary>' + sidebar + "</details></aside><div>" + content + "</div></div>" : content) +
        "</div>"
    };
  }

  function viewProduct(id) {
    var p = S.getProduct(data, id);
    if (!p) return viewNotFound();
    var v = getVehicle();
    var fits = S.fitmentsFor(data, p.id);
    var years = S.yearsLabel(data, p.id);
    var engine = S.engineLabel(data, p.id);
    var code = S.codeLabel(p);
    var consult = "Hola, quería consultar por el Retén " + code + " — " + S.appLabel(cfg, p.application) + " — " + U.formatDims(p.dimensions).replace(/ /g, " ") + ".";
    var compat = "";
    if (v) {
      compat = S.isCompatible(data, p.id, v) ?
        '<p class="badge badge-ok badge-lg">' + icon("check") + "Compatible con tu " + esc(vehicleName(v)) + "</p>" :
        '<p class="badge badge-warn badge-lg">' + icon("info") + "No figura como compatible con tu " + esc(vehicleName(v)) + ". Consultanos antes de comprar.</p>";
    }
    return {
      title: S.productTitle(cfg, p) + " " + p.brand + " " + p.shortCode,
      html: '<div class="container page">' +
        '<p><a class="back-link" href="javascript:history.back()">' + icon("back") + "Volver a los resultados</a></p>" +
        '<div class="product">' +
        '<div class="product-media">' + productImage(p, true) + "</div>" +
        '<section class="product-info" aria-labelledby="pi-title">' +
        compat +
        '<h1 id="pi-title" tabindex="-1">' + esc(S.productTitle(cfg, p)) + "</h1>" +
        '<p class="product-sub">' + esc(p.brand) + " · Código " + esc(p.shortCode) + "</p>" +
        '<p class="product-vehicles">' + esc(S.vehicleSummary(data, p.id)) + "</p>" +
        '<p class="product-dims">' + esc(U.formatDims(p.dimensions)) + "</p>" +
        priceHtml(p, true) +
        '<p class="price-note">' + (p.price == null ? esc(p.priceNote || "Consultanos el precio por WhatsApp.") :
          "Precio de referencia. El precio final y los descuentos se confirman por WhatsApp.") + "</p>" +
        '<p class="stock">Stock: consultar</p>' +
        '<div class="buy">' +
        '<div class="qty" role="group" aria-label="Cantidad">' +
        '<button type="button" class="qty-btn" data-qty-step="-1" aria-label="Restar uno">−</button>' +
        '<input id="qty" type="number" inputmode="numeric" min="1" max="' + cart.MAX_QTY + '" value="1" aria-label="Cantidad">' +
        '<button type="button" class="qty-btn" data-qty-step="1" aria-label="Sumar uno">+</button></div>' +
        '<button type="button" class="btn btn-primary btn-lg" data-add="' + esc(p.id) + '" data-add-qty="#qty">' + icon("cart") + "Agregar al carrito</button>" +
        "</div>" +
        waLink(consult, "Consultar por WhatsApp", "btn-lg") +
        "</section></div>" +

        '<div class="product-sections">' +
        '<section class="panel"><h2>Información del producto</h2><dl class="specs">' +
        "<div><dt>Producto</dt><dd>" + esc(S.productTitle(cfg, p)) + "</dd></div>" +
        "<div><dt>Marca</dt><dd>" + esc(p.brand) + "</dd></div>" +
        "<div><dt>Código</dt><dd>" + esc(p.shortCode) + "</dd></div>" +
        "<div><dt>Código de fabricante</dt><dd>" + esc(p.manufacturerCode || "No disponible") + "</dd></div>" +
        "<div><dt>Parte del vehículo</dt><dd>" + esc(S.appLabel(cfg, p.application)) + "</dd></div>" +
        "<div><dt>Detalle</dt><dd>" + esc(p.detail || "No disponible") + "</dd></div>" +
        "<div><dt>Motor</dt><dd>" + esc(engine || "No especificado") + "</dd></div>" +
        "<div><dt>Años</dt><dd>" + esc(years || "No disponible — consultar") + "</dd></div>" +
        "</dl>" +
        '<p class="muted">' + esc((cfg.applications[p.application] || {}).explanation || "") + "</p></section>" +

        '<section class="panel"><h2>Compatibilidad</h2><ul class="fitments">' + fits.map(function (f) {
          return "<li><strong>" + esc(S.makeLabel(data, f.make)) + "</strong>" +
            '<ul class="model-chips">' + f.models.map(function (m) { return "<li>" + esc(S.modelLabel(data, f.make, m)) + "</li>"; }).join("") + "</ul>" +
            (f.engine ? "<p>Motor: " + esc(f.engine) + "</p>" : "") +
            (f.position ? "<p>Posición: " + esc(f.position) + "</p>" : "") +
            "<p>Años: " + (f.yearFrom || f.yearTo ? esc((f.yearFrom || "?") + " a " + (f.yearTo || "?")) : "no disponible") + "</p>" +
            '<p class="muted">Grupo en el catálogo: ' + esc(f.groupLabel) + "</p></li>";
        }).join("") + "</ul>" +
        '<p>¿No estás seguro de que sea para tu vehículo? ' + waLink("Hola, ¿el Retén " + code + " sirve para mi vehículo? Tengo un ", "Preguntanos", "btn-sm") + "</p></section>" +

        '<section class="panel"><h2>Medidas</h2><dl class="specs">' +
        "<div><dt>Diámetro interior</dt><dd>" + esc(U.formatNumber(p.dimensions.inner)) + " mm</dd></div>" +
        "<div><dt>Diámetro exterior</dt><dd>" + esc(U.formatNumber(p.dimensions.outer)) + " mm</dd></div>" +
        "<div><dt>Ancho</dt><dd>" + esc(U.formatNumber(p.dimensions.width)) + (p.dimensions.widthAlt ? " / " + esc(U.formatNumber(p.dimensions.widthAlt)) : "") + " mm</dd></div>" +
        "<div><dt>Como figura en el catálogo</dt><dd>" + esc(p.dimensions.raw) + "</dd></div>" +
        "</dl></section>" +

        '<section class="panel"><h2>Consultas</h2><p>Si tenés dudas sobre este retén, escribinos con el código <strong>' + esc(p.shortCode) + "</strong> y los datos de tu vehículo.</p>" +
        waLink(consult) +
        '<p class="muted small">Ficha en el catálogo actual: <a href="' + esc(p.sourceUrl) + '" target="_blank" rel="noopener">' + esc(p.sourceUrl.replace("https://", "")) + "</a>" +
        (p.sourceNote ? " (" + esc(p.sourceNote) + ")" : "") + "</p></section>" +
        "</div></div>"
    };
  }

  function viewCart() {
    var sum = AW.order.summarize(data, cart);
    if (!sum.lines.length) {
      return { title: "Carrito", html: '<div class="container page"><h1 tabindex="-1">Tu carrito está vacío</h1>' +
        '<p class="lead">Buscá el retén que necesitás y agregalo al carrito.</p><div class="hero-actions">' +
        '<a class="btn btn-primary" href="#/vehiculo">' + icon("car") + "Buscar por vehículo</a>" +
        '<a class="btn btn-secondary" href="#/buscar">' + icon("search") + "Buscar por código o medida</a></div></div>" };
    }
    return {
      title: "Carrito",
      html: '<div class="container page"><h1 tabindex="-1">Tu pedido</h1>' +
        '<ul class="cart-lines">' + sum.lines.map(function (l) {
          var p = l.product;
          return '<li class="cart-line">' +
            '<div class="cart-desc"><a href="#/producto/' + esc(p.id) + '"><strong>' + esc(S.productTitle(cfg, p)) + "</strong></a>" +
            "<span>" + esc(p.brand) + " · Código " + esc(p.shortCode) + " · " + esc(U.formatDims(p.dimensions)) + "</span>" +
            "<span>" + esc(S.vehicleSummary(data, p.id, 3)) + "</span>" +
            "<span>Precio unitario: " + (l.unitCents == null ? "a consultar" : esc(U.formatPrice(l.unitCents / 100))) + "</span></div>" +
            '<div class="cart-qty"><div class="qty" role="group" aria-label="Cantidad de ' + esc(p.brand + " " + p.shortCode) + '">' +
            '<button type="button" class="qty-btn" data-cart-step="-1" data-id="' + esc(p.id) + '" aria-label="Restar uno">−</button>' +
            '<input type="number" inputmode="numeric" min="1" max="' + cart.MAX_QTY + '" value="' + l.qty + '" data-cart-qty="' + esc(p.id) + '" aria-label="Cantidad">' +
            '<button type="button" class="qty-btn" data-cart-step="1" data-id="' + esc(p.id) + '" aria-label="Sumar uno">+</button></div>' +
            '<button type="button" class="link-btn" data-remove="' + esc(p.id) + '">' + icon("trash") + "Eliminar</button></div>" +
            '<div class="cart-sub"><span class="label">Subtotal</span> <strong>' + (l.subtotalCents == null ? "A consultar" : esc(U.formatPrice(l.subtotalCents / 100))) + "</strong></div>" +
            "</li>";
        }).join("") + "</ul>" +
        '<div class="cart-total"><p><span>Total estimado</span> <strong data-total>' + esc(U.formatPrice(sum.totalCents / 100)) + "</strong></p>" +
        (sum.pending ? '<p class="price-note"><strong>No incluye ' + plural(sum.pending, "producto", "productos") + " con precio a consultar.</strong></p>" : "") +
        '<p class="price-note">Precios de referencia. El precio final y los descuentos se confirman por WhatsApp.</p>' +
        '<div class="cart-actions"><a class="btn btn-secondary" href="#/buscar">Seguir buscando retenes</a>' +
        '<a class="btn btn-whatsapp btn-lg" href="#/pedido">' + icon("whatsapp") + "Finalizar pedido</a></div></div>" +
        helpBlock("¿Tenés dudas antes de finalizar?") + "</div>"
    };
  }

  function viewOrder() {
    var sum = AW.order.summarize(data, cart);
    if (!sum.lines.length) return viewCart();
    var msg = AW.order.buildMessage(data, cfg, sum, {});
    return {
      title: "Finalizar pedido",
      html: '<div class="container page narrow"><p><a class="back-link" href="#/carrito">' + icon("back") + "Volver al carrito</a></p>" +
        '<h1 tabindex="-1">Revisá tu pedido</h1>' +
        '<ol class="how"><li>Revisá el mensaje. Podés modificarlo.</li><li>Tocá <strong>Enviar por WhatsApp</strong>.</li><li>Terminamos de coordinar precio final, descuentos y entrega por WhatsApp.</li></ol>' +
        '<form class="order-form" data-order-form>' +
        '<div class="two-cols"><label class="field"><span>Tu nombre (opcional)</span><input name="name" autocomplete="name"></label>' +
        '<label class="field"><span>Localidad (opcional)</span><input name="city" autocomplete="address-level2"></label></div>' +
        '<label class="field"><span>Mensaje que se va a enviar</span><textarea name="message" rows="14">' + esc(msg) + "</textarea></label>" +
        '<p class="price-note">Si sos cliente con condiciones especiales, aclaralo en el mensaje: los descuentos se aplican por WhatsApp.</p>' +
        '<div class="cart-actions"><button type="button" class="btn btn-secondary" data-copy>Copiar mensaje</button>' +
        '<a class="btn btn-whatsapp btn-lg" data-send href="' + esc(AW.order.whatsappUrl(cfg, msg)) + '" target="_blank" rel="noopener">' + icon("whatsapp") + "Enviar por WhatsApp</a></div>" +
        '<p class="small muted" data-copy-status role="status"></p>' +
        "</form></div>"
    };
  }

  function viewHowTo() {
    return {
      title: "Cómo encontrar mi retén",
      html: '<div class="container page narrow"><h1 tabindex="-1">Cómo encontrar mi retén</h1>' +
        '<h2>Si no sabés qué retén necesitás</h2><ol class="how">' +
        "<li>Entrá a <a href=\"#/vehiculo\">Buscar por vehículo</a>.</li>" +
        "<li>Elegí la <strong>marca</strong> y el <strong>modelo</strong> de tu vehículo.</li>" +
        "<li>Elegí <strong>dónde va el retén</strong>: motor, caja y transmisión, o ruedas.</li>" +
        "<li>Elegí la parte exacta. Cada opción tiene una explicación corta.</li>" +
        "<li>Te mostramos los retenes compatibles. Si hay dudas, consultanos por WhatsApp.</li></ol>" +
        '<h2>Si ya tenés el retén viejo o el código</h2><ol class="how">' +
        "<li>Buscá el <strong>código</strong> impreso en el retén o en la caja (por ejemplo <kbd>5159</kbd> o <kbd>05159BRAGF</kbd>).</li>" +
        "<li>Si no se lee, medilo: <strong>diámetro interior × diámetro exterior × ancho</strong>, en milímetros (por ejemplo <kbd>32x42x7</kbd>).</li>" +
        "<li>Escribilo en <a href=\"#/buscar\">Buscar por código o medida</a>.</li></ol>" +
        dimensionDrawing({ dimensions: { inner: 32, outer: 42, width: 7 } }, true) +
        "<h2>Qué significa cada parte</h2><dl class=\"glossary\">" +
        Object.keys(cfg.applications).map(function (k) {
          return "<div><dt>" + esc(cfg.applications[k].label) + "</dt><dd>" + esc(cfg.applications[k].explanation) + "</dd></div>";
        }).join("") + "</dl>" + helpBlock() + "</div>"
    };
  }

  function viewHelp() {
    var faqs = [
      ["¿Cómo compro?", "Agregá los retenes al carrito y tocá “Finalizar pedido”. Se arma un mensaje de WhatsApp con tu pedido y terminamos de coordinar por ahí."],
      ["¿Tengo que pagar en la web?", "No. En la web no se paga. El pago y la entrega se coordinan por WhatsApp."],
      ["¿Los precios son finales?", "Son precios de referencia. El precio final puede cambiar por descuentos especiales, condiciones comerciales o acuerdos con clientes."],
      ["Soy cliente de hace años, ¿mantengo mi descuento?", "Sí. Los descuentos particulares se aplican por WhatsApp, como siempre."],
      ["No sé qué retén necesito", "Usá “Buscar por vehículo”, o mandanos por WhatsApp una foto del retén y los datos de tu vehículo."],
      ["¿Cómo mido un retén?", "Diámetro interior × diámetro exterior × ancho, en milímetros. Por ejemplo: 32 × 42 × 7."],
      ["¿Hay stock?", "Consultanos por WhatsApp para confirmar disponibilidad."]
    ];
    return {
      title: "Ayuda",
      html: '<div class="container page narrow"><h1 tabindex="-1">Ayuda</h1><div class="faq">' +
        faqs.map(function (f) { return "<details><summary>" + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") +
        "</div>" + helpBlock("¿Te quedó alguna duda?") + "</div>"
    };
  }

  function contactList() {
    var c = cfg.company;
    return '<ul class="contact-list">' +
      "<li>" + icon("pin") + '<a href="' + esc(c.mapsUrl) + '" target="_blank" rel="noopener">' + esc(c.address) + "</a></li>" +
      "<li>" + icon("clock") + esc(c.hours) + "</li>" +
      "<li>" + icon("phone") + '<a href="' + esc(c.phoneHref) + '">' + esc(c.phone) + "</a></li>" +
      "<li>" + icon("mail") + '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a></li>" +
      "</ul>";
  }

  function viewContact() {
    return {
      title: "Contacto",
      html: '<div class="container page narrow"><h1 tabindex="-1">Contacto</h1>' +
        '<p class="lead">' + esc(cfg.company.name) + ". Desde " + cfg.company.since + " en Av. Warnes.</p>" +
        contactList() + '<p>' + waLink("Hola, quería hacer una consulta.", "Escribinos por WhatsApp", "btn-lg") + "</p></div>"
    };
  }

  function viewNotFound() {
    return { title: "Página no encontrada", html: '<div class="container page"><h1 tabindex="-1">No encontramos esta página</h1>' +
      '<p><a class="btn btn-primary" href="#/">Ir al inicio</a></p></div>' };
  }

  /* ---------- Router ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, "") || "/";
    var i = h.indexOf("?");
    var path = i === -1 ? h : h.slice(0, i);
    var params = new URLSearchParams(i === -1 ? "" : h.slice(i + 1));
    return { path: path.replace(/\/+$/, "") || "/", params: params };
  }

  /* keep === true: re-dibuja la vista actual sin mover el scroll ni el foco (carrito). */
  function route(keep) {
    keep = keep === true;
    var r = parseHash(), view, parts = r.path.split("/").filter(Boolean);
    switch (parts[0]) {
      case undefined: view = viewHome(); break;
      case "retenes": view = viewRetenes(); break;
      case "vehiculo": view = viewVehicle(r.params); break;
      case "buscar": view = viewSearch(r.params); break;
      case "producto": view = viewProduct(decodeURIComponent(parts[1] || "")); break;
      case "carrito": view = viewCart(); break;
      case "pedido": view = viewOrder(); break;
      case "como-encontrar": view = viewHowTo(); break;
      case "ayuda": view = viewHelp(); break;
      case "contacto": view = viewContact(); break;
      default: view = viewNotFound();
    }
    main.innerHTML = view.html;
    document.title = view.title + " | " + cfg.company.name;
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var active = a.getAttribute("data-nav") === (parts[0] || "inicio");
      if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    closeMenu();
    if (keep) return;
    window.scrollTo(0, 0);
    var h1 = main.querySelector("h1");
    if (h1 && route.initialized) h1.focus({ preventScroll: true });
    route.initialized = true;
  }

  /* ---------- Header, carrito, chip de vehículo ---------- */
  function renderCartCount() {
    var n = cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll("[data-cart-label]").forEach(function (el) {
      el.setAttribute("aria-label", "Carrito, " + plural(n, "producto", "productos"));
    });
  }

  function renderVehicleChip() {
    var el = document.getElementById("vehicle-chip");
    var v = getVehicle();
    if (!v) { el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false;
    el.innerHTML = '<div class="container vehicle-chip-inner">' + icon("car") +
      '<span>Tu vehículo: <a href="#/vehiculo' + qs({ marca: v.make, modelo: v.model }) + '"><strong>' + esc(vehicleName(v)) + "</strong></a></span>" +
      '<button type="button" class="chip-close" data-clear-vehicle aria-label="Quitar vehículo">✕ <span class="sr-only">Quitar</span></button></div>';
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    t.innerHTML = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, 4000);
  }

  function closeMenu() {
    var btn = document.getElementById("menu-toggle");
    if (btn) { btn.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;

    if (t.id === "menu-toggle") {
      var open = t.getAttribute("aria-expanded") !== "true";
      t.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
      return;
    }
    if (t.hasAttribute("data-add")) {
      var id = t.getAttribute("data-add");
      var qtySel = t.getAttribute("data-add-qty");
      var qty = qtySel ? parseInt(document.querySelector(qtySel).value, 10) || 1 : 1;
      qty = Math.max(1, Math.min(qty, cart.MAX_QTY));
      cart.add(id, qty);
      var p = S.getProduct(data, id);
      toast(icon("check") + "<span>Agregaste " + esc(p.brand + " " + p.shortCode) + " x" + qty + '.</span> <a href="#/carrito">Ver carrito</a>');
      if (!qtySel) t.outerHTML = addButton(p);
      return;
    }
    if (t.hasAttribute("data-qty-step")) {
      var input = document.getElementById("qty");
      var v = (parseInt(input.value, 10) || 1) + parseInt(t.getAttribute("data-qty-step"), 10);
      input.value = Math.max(1, Math.min(v, cart.MAX_QTY));
      return;
    }
    if (t.hasAttribute("data-cart-step")) {
      var cid = t.getAttribute("data-id");
      var nq = cart.get(cid) + parseInt(t.getAttribute("data-cart-step"), 10);
      if (nq < 1) return;
      cart.set(cid, nq);
      route(true);
      var again = main.querySelector('[data-cart-step="' + t.getAttribute("data-cart-step") + '"][data-id="' + cid + '"]');
      if (again) again.focus();
      return;
    }
    if (t.hasAttribute("data-remove")) {
      var rp = S.getProduct(data, t.getAttribute("data-remove"));
      cart.remove(rp.id);
      route(true);
      var h = main.querySelector("h1"); if (h) h.focus({ preventScroll: true });
      toast("<span>Eliminaste " + esc(rp.brand + " " + rp.shortCode) + " del carrito.</span>");
      return;
    }
    if (t.hasAttribute("data-clear-vehicle")) {
      setVehicle(null);
      if (!/^#\/vehiculo/.test(location.hash)) route();
      return;
    }
    if (t.hasAttribute("data-copy")) {
      var ta = main.querySelector("textarea[name=message]");
      var status = main.querySelector("[data-copy-status]");
      var done = function () { status.textContent = "Mensaje copiado."; };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand("copy"); done(); });
      else { ta.select(); document.execCommand("copy"); done(); }
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.hasAttribute("data-cart-qty")) {
      var q = parseInt(t.value, 10);
      var id = t.getAttribute("data-cart-qty");
      if (!(q > 0)) { q = 1; }
      q = Math.min(q, cart.MAX_QTY);
      if (q === cart.get(id)) { t.value = q; return; }
      cart.set(id, q);
      // Se re-dibuja fuera del evento: quitar el input con foco dispara otro "change" al perder el foco.
      setTimeout(function () { route(true); }, 0);
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "model-filter") {
      var q = U.normalize(t.value);
      main.querySelectorAll("#model-options .option").forEach(function (o) {
        o.hidden = q && o.getAttribute("data-name").indexOf(q) === -1;
      });
    }
    var form = t.closest("[data-order-form]");
    if (form) {
      var ta = form.querySelector("textarea[name=message]");
      if (t === ta) ta.setAttribute("data-edited", "1");
      else if (!ta.hasAttribute("data-edited")) {
        ta.value = AW.order.buildMessage(data, cfg, AW.order.summarize(data, cart), { name: form.name.value.trim(), city: form.city.value.trim() });
      }
      form.querySelector("[data-send]").href = AW.order.whatsappUrl(cfg, ta.value);
    }
  });

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.hasAttribute("data-search-form")) return;
    e.preventDefault();
    var q = form.q.value.trim();
    var byDims = e.submitter && e.submitter.value === "dims";
    if (byDims) {
      var di = form.di.value.trim(), de = form.de.value.trim(), an = form.an.value.trim();
      var err = form.querySelector("[data-dims-error]");
      if (!di || !de) { err.hidden = false; form.di.focus(); return; }
      err.hidden = true;
      q = di + "x" + de + (an ? "x" + an : "");
    }
    var target = "#/buscar" + qs({ q: q });
    if (location.hash === target) route(); else location.hash = target;
  });

  window.addEventListener("hashchange", route);
  cart.onChange(renderCartCount);

  /* Footer con datos de contacto */
  document.getElementById("footer-contact").innerHTML = contactList();
  document.getElementById("footer-wa").innerHTML = waLink("Hola, quería hacer una consulta.", "WhatsApp");
  document.getElementById("bottom-wa").href = AW.order.whatsappUrl(cfg, "Hola, necesito ayuda para encontrar un retén.");
  document.getElementById("year").textContent = new Date().getFullYear();

  renderCartCount();
  renderVehicleChip();
  route();
})(window.AW);

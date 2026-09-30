/* Lógica de búsqueda (sin acceso al DOM, para poder testearla). */
(function (AW) {
  "use strict";

  var STOPWORDS = ["reten", "retenes", "de", "del", "para", "la", "el", "los", "las", "y", "con", "en", "mm"];

  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toNumber(s) {
    return parseFloat(String(s).replace(",", "."));
  }

  var numberFormat = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatPrice(n) {
    return "$ " + numberFormat.format(n);
  }
  function formatNumber(n) {
    return String(n).replace(".", ",");
  }
  function formatDims(d) {
    var w = formatNumber(d.width) + (d.widthAlt ? "/" + formatNumber(d.widthAlt) : "");
    return formatNumber(d.inner) + " × " + formatNumber(d.outer) + " × " + w + " mm";
  }

  /* Detecta medidas tipo "35x52x7", "35 X 52 X 7", "35*52*7", "31,5x42x7" o "35x52". */
  var DIM_RE = /(\d+(?:[.,]\d+)?)\s*[x×*]\s*(\d+(?:[.,]\d+)?)(?:\s*[x×*]\s*(\d+(?:[.,]\d+)?))?/i;
  function parseDimensions(q) {
    var m = DIM_RE.exec(String(q || ""));
    if (!m) return null;
    return {
      inner: toNumber(m[1]),
      outer: toNumber(m[2]),
      width: m[3] != null ? toNumber(m[3]) : null,
      matched: m[0]
    };
  }

  function near(a, b, tol) { return Math.abs(a - b) <= tol + 1e-9; }

  function matchesDimensions(product, dims, tol) {
    tol = tol || 0;
    var d = product.dimensions;
    if (!near(d.inner, dims.inner, tol) || !near(d.outer, dims.outer, tol)) return false;
    if (dims.width == null) return true;
    return near(d.width, dims.width, tol) || (d.widthAlt != null && near(d.widthAlt, dims.width, tol));
  }

  /* ---------- Índices ---------- */
  function indexData(data) {
    if (data._index) return data._index;
    var byId = {}, fitByProduct = {};
    data.products.forEach(function (p) { byId[p.id] = p; fitByProduct[p.id] = []; });
    data.fitments.forEach(function (f) { if (fitByProduct[f.productId]) fitByProduct[f.productId].push(f); });
    var makeLabel = {}, modelLabel = {};
    data.makes.forEach(function (m) { makeLabel[m.key] = m.label; });
    data.models.forEach(function (m) { modelLabel[m.make + "/" + m.key] = m.label; });
    data._index = { byId: byId, fitByProduct: fitByProduct, makeLabel: makeLabel, modelLabel: modelLabel };
    return data._index;
  }

  function getProduct(data, id) { return indexData(data).byId[id] || null; }
  function fitmentsFor(data, id) { return indexData(data).fitByProduct[id] || []; }
  function makeLabel(data, key) { return indexData(data).makeLabel[key] || key; }
  function modelLabel(data, make, key) { return indexData(data).modelLabel[make + "/" + key] || key; }

  function appLabel(cfg, key) { return (cfg.applications[key] || { label: key }).label; }

  /* "VW Gol · Gacel · Senda" */
  function vehicleSummary(data, productId, maxModels) {
    var parts = fitmentsFor(data, productId).map(function (f) {
      var models = f.models.map(function (m) { return modelLabel(data, f.make, m); });
      if (maxModels && models.length > maxModels) models = models.slice(0, maxModels).concat("y más");
      return makeLabel(data, f.make) + " " + models.join(" · ");
    });
    return parts.join(" / ");
  }

  function yearsLabel(data, productId) {
    var fs = fitmentsFor(data, productId).filter(function (f) { return f.yearFrom || f.yearTo; });
    if (!fs.length) return null;
    var f = fs[0];
    if (f.yearFrom && f.yearTo) return f.yearFrom + " a " + f.yearTo;
    if (f.yearFrom) return "Desde " + f.yearFrom;
    return "Hasta " + f.yearTo;
  }

  function engineLabel(data, productId) {
    var e = fitmentsFor(data, productId).map(function (f) { return f.engine; }).filter(Boolean);
    return e.length ? e[0] : null;
  }

  function productTitle(cfg, p) {
    return "Retén de " + appLabel(cfg, p.application).toLowerCase();
  }

  function isCompatible(data, productId, vehicle) {
    if (!vehicle || !vehicle.make || !vehicle.model) return false;
    return fitmentsFor(data, productId).some(function (f) {
      return f.make === vehicle.make && f.models.indexOf(vehicle.model) !== -1;
    });
  }

  /* ---------- Búsqueda directa ---------- */
  function haystackWords(data, cfg, p) {
    var words = [p.brand, p.shortCode, p.manufacturerCode, appLabel(cfg, p.application), p.application, p.detail, p.dimensions.raw];
    fitmentsFor(data, p.id).forEach(function (f) {
      words.push(makeLabel(data, f.make), f.make, f.groupLabel, f.engine, f.position);
      f.models.forEach(function (m) { words.push(modelLabel(data, f.make, m), m); });
    });
    if (fitmentsFor(data, p.id).some(function (f) { return f.make === "volkswagen"; })) words.push("vw");
    if (fitmentsFor(data, p.id).some(function (f) { return f.make === "chevrolet"; })) words.push("gm");
    return normalize(words.filter(Boolean).join(" ")).split(/[^a-z0-9]+/).filter(Boolean);
  }

  function tokenMatches(token, words, p) {
    var code = normalize(p.manufacturerCode);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w === token) return true;
      if (token.length >= 3 && w.indexOf(token) === 0) return true;
    }
    if (/^\d{3,}$/.test(token) && code.indexOf(token) !== -1) return true;
    if (/^[a-z0-9]{4,}$/.test(token) && code === token) return true;
    return false;
  }

  function score(p, tokens) {
    var s = 0, code = normalize(p.manufacturerCode);
    tokens.forEach(function (t) {
      if (t === p.shortCode) s += 100;
      else if (t === code) s += 100;
      else if (code.indexOf(t) !== -1) s += 50;
      else s += 1;
    });
    return s;
  }

  /* filters: { brand, application, make } */
  function applyFilters(list, data, filters) {
    filters = filters || {};
    return list.filter(function (p) {
      if (filters.brand && normalize(p.brand) !== normalize(filters.brand)) return false;
      if (filters.application && p.application !== filters.application) return false;
      if (filters.make && !fitmentsFor(data, p.id).some(function (f) { return f.make === filters.make; })) return false;
      return true;
    });
  }

  function facets(list, data, cfg) {
    var brands = {}, apps = {}, makes = {};
    list.forEach(function (p) {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
      apps[p.application] = (apps[p.application] || 0) + 1;
      var seen = {};
      fitmentsFor(data, p.id).forEach(function (f) {
        if (seen[f.make]) return; seen[f.make] = 1;
        makes[f.make] = (makes[f.make] || 0) + 1;
      });
    });
    function toList(obj, labelFn) {
      return Object.keys(obj).map(function (k) { return { key: k, label: labelFn(k), count: obj[k] }; })
        .sort(function (a, b) { return a.label.localeCompare(b.label, "es"); });
    }
    return {
      brand: toList(brands, function (k) { return k; }),
      application: toList(apps, function (k) { return appLabel(cfg, k); }),
      make: toList(makes, function (k) { return makeLabel(data, k); })
    };
  }

  /* Devuelve { status: "ok"|"empty"|"too-many"|"invalid", items, total, dims, similar, facets } */
  function directSearch(data, cfg, query, filters) {
    var max = cfg.maxResults || 20;
    var q = normalize(query);
    var dims = parseDimensions(q);
    var rest = dims ? q.replace(normalize(dims.matched), " ") : q;
    var tokens = rest.split(/[^a-z0-9]+/).filter(function (t) { return t && STOPWORDS.indexOf(t) === -1; });
    var hasFilters = filters && (filters.brand || filters.application || filters.make);

    if (!dims && !tokens.length && !hasFilters) {
      return { status: "invalid", items: [], total: 0, dims: null, similar: [], facets: null };
    }

    var list = data.products.filter(function (p) {
      if (dims && !matchesDimensions(p, dims, 0)) return false;
      if (tokens.length) {
        var words = haystackWords(data, cfg, p);
        for (var i = 0; i < tokens.length; i++) if (!tokenMatches(tokens[i], words, p)) return false;
      }
      return true;
    });
    var fac = facets(list, data, cfg);
    list = applyFilters(list, data, filters);
    list.sort(function (a, b) { return score(b, tokens) - score(a, tokens) || a.shortCode.localeCompare(b.shortCode); });

    var similar = [];
    if (!list.length && dims) {
      similar = applyFilters(data.products, data, filters).filter(function (p) { return matchesDimensions(p, dims, 1); }).slice(0, max);
    }
    var status = !list.length ? "empty" : list.length > max ? "too-many" : "ok";
    return {
      status: status,
      items: status === "ok" ? list : [],
      total: list.length,
      dims: dims,
      similar: similar,
      facets: fac
    };
  }

  /* ---------- Búsqueda por vehículo ---------- */
  function productsForVehicle(data, make, model) {
    var ids = {};
    data.fitments.forEach(function (f) {
      if (f.make === make && (!model || f.models.indexOf(model) !== -1)) ids[f.productId] = 1;
    });
    return data.products.filter(function (p) { return ids[p.id]; });
  }

  function engineOf(data, p, make, model) {
    var f = fitmentsFor(data, p.id).filter(function (f) {
      return f.make === make && f.models.indexOf(model) !== -1;
    })[0];
    return f && f.engine ? f.engine : null;
  }

  /* sel: { make, model, zone, app, engine }. Devuelve las opciones disponibles para cada paso. */
  function vehicleState(data, cfg, sel) {
    sel = sel || {};
    var state = { makes: [], models: [], zones: [], apps: [], engines: [], results: null, step: "make" };

    var makeCount = {};
    data.fitments.forEach(function (f) { makeCount[f.make] = makeCount[f.make] || {}; makeCount[f.make][f.productId] = 1; });
    state.makes = data.makes.filter(function (m) { return makeCount[m.key]; })
      .map(function (m) { return { key: m.key, label: m.label, count: Object.keys(makeCount[m.key]).length }; })
      .sort(function (a, b) { return a.label.localeCompare(b.label, "es"); });
    if (!sel.make || !makeCount[sel.make]) return state;

    state.step = "model";
    state.models = data.models.filter(function (m) { return m.make === sel.make; }).map(function (m) {
      return { key: m.key, label: m.label, count: productsForVehicle(data, sel.make, m.key).length };
    }).sort(function (a, b) { return a.label.localeCompare(b.label, "es", { numeric: true }); });
    if (!sel.model || !state.models.some(function (m) { return m.key === sel.model; })) return state;

    var products = productsForVehicle(data, sel.make, sel.model);
    state.step = "zone";
    state.zones = cfg.zones.map(function (z) {
      return { key: z.key, label: z.label, hint: z.hint,
        count: products.filter(function (p) { return (cfg.applications[p.application] || {}).zone === z.key; }).length };
    }).filter(function (z) { return z.count > 0; });

    var zone = sel.zone;
    if (!zone && state.zones.length === 1) zone = state.zones[0].key; // se saltea si hay una sola
    if (!zone || !state.zones.some(function (z) { return z.key === zone; })) return state;
    state.zone = zone;

    var inZone = products.filter(function (p) { return (cfg.applications[p.application] || {}).zone === zone; });
    var appCount = {};
    inZone.forEach(function (p) { appCount[p.application] = (appCount[p.application] || 0) + 1; });
    state.step = "app";
    state.apps = Object.keys(cfg.applications).filter(function (k) { return appCount[k]; }).map(function (k) {
      return { key: k, label: cfg.applications[k].label, explanation: cfg.applications[k].explanation, count: appCount[k] };
    });

    var app = sel.app;
    if (!app && state.apps.length === 1) app = state.apps[0].key;
    if (!app || !appCount[app]) return state;
    state.app = app;

    var candidates = inZone.filter(function (p) { return p.application === app; });
    var engines = {};
    candidates.forEach(function (p) {
      var e = engineOf(data, p, sel.make, sel.model) || "";
      engines[e] = (engines[e] || 0) + 1;
    });
    var engineKeys = Object.keys(engines);
    if (engineKeys.length > 1) {
      state.engines = engineKeys.map(function (e) {
        return { key: e || "sin-especificar", label: e || "Sin motor especificado", count: engines[e] };
      });
      if (!sel.engine) { state.step = "engine"; return state; }
      if (sel.engine !== "todos") {
        candidates = candidates.filter(function (p) {
          var e = engineOf(data, p, sel.make, sel.model) || "sin-especificar";
          return e === sel.engine;
        });
      }
    }

    state.step = "results";
    var max = cfg.maxResults || 20;
    state.results = {
      status: !candidates.length ? "empty" : candidates.length > max ? "too-many" : "ok",
      items: candidates.length > max ? [] : candidates,
      total: candidates.length
    };
    return state;
  }

  AW.util = { normalize: normalize, formatPrice: formatPrice, formatDims: formatDims, formatNumber: formatNumber };
  AW.search = {
    parseDimensions: parseDimensions,
    matchesDimensions: matchesDimensions,
    directSearch: directSearch,
    vehicleState: vehicleState,
    getProduct: getProduct,
    fitmentsFor: fitmentsFor,
    makeLabel: makeLabel,
    modelLabel: modelLabel,
    appLabel: appLabel,
    vehicleSummary: vehicleSummary,
    yearsLabel: yearsLabel,
    engineLabel: engineLabel,
    productTitle: productTitle,
    isCompatible: isCompatible
  };
})(window.AW = window.AW || {});

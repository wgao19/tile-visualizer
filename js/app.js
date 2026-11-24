(function () {
  var TV = window.TileViz;

  /* ---------- option lists ---------- */
  var LAYOUTS = { straight: { id: "straight", name: "Straight" }, drop: { id: "drop", name: "Half drop" } };
  var ANGLES = [{ id: 0, name: "Vertical" }, { id: 90, name: "Horizontal" }, { id: 45, name: "Diagonal" }];
  var MIXES = [{ id: "random", name: "Random" }, { id: "columns", name: "By strip" }, { id: "rows", name: "By row" }];
  var PATTERNS = [
    { id: "dash", name: "All dash" },
    { id: "dot", name: "All dot" },
    { id: "split-h", name: "Top / bottom" },
    { id: "split-v", name: "Left / right" },
    { id: "alt", name: "Alternate" }
  ];

  /* ---------- small helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function assign(t) {
    for (var k = 1; k < arguments.length; k++) {
      var s = arguments[k];
      if (s) for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = Array.isArray(s[p]) ? s[p].slice() : s[p];
    }
    return t;
  }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function inRange(v, lo, hi) { return isFinite(v) && v >= lo && v <= hi; }
  function groutName(hex) {
    var g = TV.GROUTS.filter(function (x) { return x.c.toLowerCase() === hex.toLowerCase(); })[0];
    return g ? g.name : "Custom";
  }
  function productOf(place) { return TV.PRODUCTS[place.product]; }
  function layoutsFor(product) {
    return (product.layouts || ["straight"]).map(function (k) { return LAYOUTS[k]; }).filter(Boolean);
  }
  function parseQuery(q) {
    var out = {};
    (q || "").split("&").forEach(function (kv) {
      var k = kv.indexOf("=");
      if (k > 0) {
        try { out[decodeURIComponent(kv.slice(0, k))] = decodeURIComponent(kv.slice(k + 1)); } catch (e) { /* skip bad pair */ }
      }
    });
    return out;
  }
  function toQuery(pairs) {
    return pairs.map(function (p) { return p[0] + "=" + encodeURIComponent(p[1]); }).join("&");
  }
  function parseGrout(p, st) {
    if (/^[0-9a-f]{6}$/i.test(p.g || "")) st.grout = "#" + p.g.toLowerCase();
  }
  function parseJoint(p, st) {
    var j = parseFloat(p.j);
    if (inRange(j, 1, 8)) st.joint = Math.round(j * 2) / 2;
  }

  /* ---------- per-kind behaviour ----------
   * base:      fallback defaults for anything a place doesn't set
   * normalize: make a state valid for its product
   * serialize: [key, value] pairs written to the URL
   * parse:     apply URL params on top of a state (invalid values are ignored)
   * facts:     [label, value, chip colour?] rows for the readout and overview cards
   */
  var KINDS = {
    strip: {
      base: { tiles: [], mix: "random", grout: "#cdbfa6", layout: "straight", angle: 0, joint: 3, wall: 90 },
      normalize: function (product, st) {
        st.tiles = st.tiles.filter(function (id, i, a) { return a.indexOf(id) === i && byId(product.colors, id); });
        if (!st.tiles.length) st.tiles = [product.colors[0].id];
        var ls = layoutsFor(product);
        if (!byId(ls, st.layout)) st.layout = ls[0].id;
      },
      serialize: function (st) {
        return [["t", st.tiles.join(",")], ["m", st.mix], ["g", st.grout.slice(1)], ["l", st.layout],
          ["a", st.angle], ["j", st.joint], ["w", st.wall]];
      },
      parse: function (p, product, st) {
        if (p.t) st.tiles = p.t.split(",");
        if (byId(MIXES, p.m)) st.mix = p.m;
        parseGrout(p, st);
        if (p.l) st.layout = p.l;
        var a = parseFloat(p.a);
        if (byId(ANGLES, a)) st.angle = a;
        parseJoint(p, st);
        var w = parseFloat(p.w);
        if (inRange(w, 40, 200)) st.wall = Math.round(w / 5) * 5;
      },
      facts: function (product, st) {
        var f = [
          ["Tile", product.colors.filter(function (t) { return st.tiles.indexOf(t.id) >= 0; }).map(function (t) { return t.name; }).join(", ")]
        ];
        if (st.tiles.length > 1) f.push(["Mix", byId(MIXES, st.mix).name]);
        f.push(["Layout", LAYOUTS[st.layout].name + ", " + byId(ANGLES, st.angle).name.toLowerCase()]);
        f.push(["Grout", groutName(st.grout) + " " + st.grout.toUpperCase(), st.grout]);
        f.push(["Joint", st.joint + " mm"]);
        return f;
      }
    },

    decor: {
      base: { color: null, pattern: "dash", swap: false, grout: "#f2efe9", joint: 2, w: 240, h: 60 },
      normalize: function (product, st) {
        if (!byId(product.colors, st.color)) st.color = product.colors[0].id;
        if (!byId(PATTERNS, st.pattern)) st.pattern = "dash";
        st.swap = !!st.swap;
      },
      serialize: function (st) {
        return [["c", st.color], ["p", st.pattern], ["s", st.swap ? 1 : 0], ["g", st.grout.slice(1)],
          ["j", st.joint], ["w", st.w], ["h", st.h]];
      },
      parse: function (p, product, st) {
        if (p.c) st.color = p.c;
        if (p.p) st.pattern = p.p;
        if (p.s === "1" || p.s === "0") st.swap = p.s === "1";
        parseGrout(p, st);
        parseJoint(p, st);
        var w = parseFloat(p.w), h = parseFloat(p.h);
        if (inRange(w, 15, 600)) st.w = Math.round(w);
        if (inRange(h, 15, 300)) st.h = Math.round(h);
      },
      facts: function (product, st) {
        var L = TV.decorLayout(product, st);
        var pat = byId(PATTERNS, st.pattern).name;
        if (st.pattern === "split-h") pat = "Top " + (st.swap ? "dot" : "dash") + ", bottom " + (st.swap ? "dash" : "dot");
        if (st.pattern === "split-v") pat = "Left " + (st.swap ? "dot" : "dash") + ", right " + (st.swap ? "dash" : "dot");
        if (st.pattern === "alt") pat = "Alternate, starting " + (st.swap ? "dot" : "dash");
        var mix = [];
        if (L.counts.dash) mix.push(L.counts.dash + " dash");
        if (L.counts.dot) mix.push(L.counts.dot + " dot");
        return [
          ["Colour", byId(product.colors, st.color).name],
          ["Pattern", pat],
          ["Grout", groutName(st.grout) + " " + st.grout.toUpperCase(), st.grout],
          ["Joint", st.joint + " mm"],
          ["Surface", st.w + " × " + st.h + " cm"],
          ["Tiles", L.total + " (" + mix.join(", ") + (L.cut ? "; " + L.cut + " cut" : "") + ")"]
        ];
      }
    }
  };

  /* ---------- state per place ---------- */
  var STORE = "tileviz:";
  var states = {};

  function kindOf(place) { return KINDS[productOf(place).kind]; }
  function defaultsFor(place) {
    var k = kindOf(place), st = assign({}, k.base, place.defaults);
    k.normalize(productOf(place), st);
    return st;
  }
  function stateFromQuery(place, q) {
    var k = kindOf(place), st = defaultsFor(place);
    k.parse(parseQuery(q), productOf(place), st);
    k.normalize(productOf(place), st);
    return st;
  }
  function serialize(place, st) { return toQuery(kindOf(place).serialize(st)); }
  function getState(place) {
    if (!states[place.id]) {
      var saved = null;
      try { saved = localStorage.getItem(STORE + place.id); } catch (e) { /* storage unavailable */ }
      states[place.id] = saved ? stateFromQuery(place, saved) : defaultsFor(place);
    }
    return states[place.id];
  }
  function saveState(place) {
    try { localStorage.setItem(STORE + place.id, serialize(place, states[place.id])); } catch (e) { /* ignore */ }
  }

  /* ---------- routing ----------
   *   #/                         overview (current picks)
   *   #/?foyer=<enc>&island-front=<enc>   overview of shared picks
   *   #/<place>?<options>        one place
   *   #<place>?<options>         older links, still accepted
   */
  function parseRoute() {
    var h = location.hash.replace(/^#\/?/, "");
    var q = h.indexOf("?");
    return { path: q < 0 ? h : h.slice(0, q), query: q < 0 ? "" : h.slice(q + 1) };
  }
  function placeHash(place, st) { return "#/" + place.id + "?" + serialize(place, st); }
  function writeUrl(next) {
    if (location.hash !== next && history.replaceState) history.replaceState(null, "", next);
  }

  var current = null;   // the place being edited, or null on the overview
  var indexStates = {}; // what the overview is showing

  function route() {
    var r = parseRoute();
    var place = byId(TV.PLACES, r.path);
    if (place) {
      if (r.query) { states[place.id] = stateFromQuery(place, r.query); saveState(place); }
      showPlace(place);
    } else {
      showIndex(r.query ? parseQuery(r.query) : null);
    }
  }

  /* ---------- tabs ---------- */
  var tabs = el("tabs");
  function buildTabs() {
    var items = [{ id: "", name: "Overview" }].concat(TV.PLACES);
    items.forEach(function (it) {
      var a = document.createElement("a");
      a.href = "#/" + it.id;
      a.textContent = it.name;
      a.dataset.id = it.id;
      tabs.appendChild(a);
    });
  }
  function syncTabs() {
    var id = current ? current.id : "";
    Array.prototype.forEach.call(tabs.children, function (a) {
      if (a.dataset.id === id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- overview ---------- */
  var cardsWrap = el("cards");

  function showIndex(shared) {
    current = null;
    TV.PLACES.forEach(function (p) {
      indexStates[p.id] = shared && shared[p.id] ? stateFromQuery(p, shared[p.id]) : getState(p);
    });
    el("indexView").hidden = false;
    el("placeView").hidden = true;
    document.title = "Tile Visualizer";
    syncTabs();
    buildCards();
    writeUrl("#/?" + TV.PLACES.map(function (p) {
      return p.id + "=" + encodeURIComponent(serialize(p, indexStates[p.id]));
    }).join("&"));
  }

  function buildCards() {
    cardsWrap.innerHTML = "";
    TV.PLACES.forEach(function (place) {
      var product = productOf(place), st = indexStates[place.id];
      var a = document.createElement("a");
      a.className = "card";
      a.href = placeHash(place, st);

      var pv = document.createElement("div");
      pv.className = "pv";
      var cv = document.createElement("canvas");
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", place.name + " preview");
      pv.appendChild(cv);
      a.appendChild(pv);

      var body = document.createElement("div");
      body.className = "body";
      var h = document.createElement("h2");
      h.textContent = place.name;
      var pr = document.createElement("p");
      pr.className = "prod";
      pr.textContent = product.brand + " " + product.name;
      var dl = document.createElement("dl");
      kindOf(place).facts(product, st).forEach(function (f) {
        var dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = f[0];
        if (f[2]) dd.appendChild(chip(f[2]));
        dd.appendChild(document.createTextNode(f[1]));
        dl.appendChild(dt); dl.appendChild(dd);
      });
      var open = document.createElement("span");
      open.className = "open";
      open.textContent = "Open " + place.name.toLowerCase() + " →";
      body.appendChild(h); body.appendChild(pr); body.appendChild(dl); body.appendChild(open);
      a.appendChild(body);
      cardsWrap.appendChild(a);
    });
    drawCards();
  }
  function drawCards() {
    Array.prototype.forEach.call(cardsWrap.querySelectorAll("canvas"), function (cv, k) {
      var place = TV.PLACES[k];
      TV.draw(cv, productOf(place), indexStates[place.id]);
    });
  }

  function chip(color) {
    var i = document.createElement("i");
    i.className = "chip";
    i.style.background = color;
    return i;
  }

  /* ---------- one place ---------- */
  var product, state;
  var cv = el("cv"), wrap = el("canvasWrap");

  function showPlace(place) {
    current = place;
    product = productOf(place);
    state = getState(place);
    el("indexView").hidden = true;
    el("placeView").hidden = false;
    el("title").textContent = place.name;
    el("subtitle").textContent = product.brand + " " + product.name +
      (product.credit ? " · " + product.credit : "") + (product.material ? ". " + product.material + "." : "");
    el("productNote").textContent = product.note || "";
    document.title = place.name + " · Tile Visualizer";
    Array.prototype.forEach.call(document.querySelectorAll("[data-kind]"), function (n) {
      n.hidden = n.dataset.kind !== product.kind;
    });
    wrap.classList.toggle("fit", product.kind === "decor");
    syncTabs();
    if (product.kind === "strip") buildStrip(); else buildDecor();
    syncShared();
    render();
  }

  function update() {
    saveState(current);
    render();
  }

  function render() {
    if (!current) return;
    sizeStage();
    TV.draw(cv, product, state);
    var r = el("readout");
    r.innerHTML = "";
    kindOf(current).facts(product, state).forEach(function (f) {
      var s = document.createElement("span"), b = document.createElement("b");
      s.appendChild(document.createTextNode(f[0] + " "));
      if (f[2]) b.appendChild(chip(f[2]));
      b.appendChild(document.createTextNode(f[1]));
      s.appendChild(b);
      r.appendChild(s);
    });
    el("jointOut").textContent = state.joint + " mm";
    el("customHex").textContent = state.grout;
    if (product.kind === "strip") el("wallOut").textContent = state.wall + " cm";
    writeUrl(placeHash(current, state));
  }

  /* Decor surfaces are drawn whole, so the canvas takes the surface's proportions. */
  function sizeStage() {
    if (product.kind !== "decor") { cv.style.width = ""; cv.style.height = ""; return; }
    var cs = getComputedStyle(wrap);
    var avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var maxH = Math.min(560, window.innerHeight * 0.6);
    var h = avail * state.h / state.w, w = avail;
    if (h > maxH) { h = maxH; w = h * state.w / state.h; }
    cv.style.width = Math.round(w) + "px";
    cv.style.height = Math.round(h) + "px";
  }

  /* Segmented control. Returns a sync function. */
  function seg(id, items, key) {
    var box = el(id);
    box.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.name;
      b.addEventListener("click", function () { state[key] = it.id; sync(); onSegChange(); update(); });
      box.appendChild(b);
    });
    function sync() {
      Array.prototype.forEach.call(box.children, function (b, k) {
        b.setAttribute("aria-pressed", String(items[k].id === state[key]));
      });
    }
    sync();
    return sync;
  }
  function onSegChange() {
    if (product.kind === "decor") el("swapRow").hidden = state.pattern === "dash" || state.pattern === "dot";
  }

  /* Shared: grout, joint */
  var swWrap = el("swatches");
  TV.GROUTS.forEach(function (gr) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.dataset.c = gr.c;
    var dot = document.createElement("span"), nm = document.createElement("span");
    dot.className = "dot"; dot.style.background = gr.c;
    nm.className = "nm"; nm.textContent = gr.name;
    b.appendChild(dot); b.appendChild(nm);
    b.addEventListener("click", function () { state.grout = gr.c; syncShared(); update(); });
    swWrap.appendChild(b);
  });
  function syncShared() {
    Array.prototype.forEach.call(swWrap.children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.c === state.grout));
    });
    el("custom").value = state.grout;
    el("joint").value = state.joint;
  }
  el("custom").addEventListener("input", function (e) { state.grout = e.target.value.toLowerCase(); syncShared(); update(); });
  el("joint").addEventListener("input", function (e) { state.joint = parseFloat(e.target.value); update(); });

  /* Strip controls */
  var tsw = el("tileSw");
  function buildStrip() {
    tsw.innerHTML = "";
    product.colors.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sw";
      b.dataset.id = t.id;
      var dot = document.createElement("span"), nm = document.createElement("span");
      dot.className = "dot"; dot.style.background = t.color;
      nm.className = "nm"; nm.textContent = t.name;
      b.appendChild(dot); b.appendChild(nm);
      b.addEventListener("click", function () {
        var k = state.tiles.indexOf(t.id);
        if (k >= 0) { if (state.tiles.length > 1) state.tiles.splice(k, 1); }
        else state.tiles.push(t.id);
        syncTiles(); update();
      });
      tsw.appendChild(b);
    });
    var many = product.colors.length > 1;
    el("allTiles").hidden = !many;
    el("allTiles").textContent = "Select all " + product.colors.length;
    el("mixField").hidden = !many;
    syncTiles();
    seg("mixSeg", MIXES, "mix");
    seg("layoutSeg", layoutsFor(product), "layout");
    seg("angleSeg", ANGLES, "angle");
    el("wall").value = state.wall;
  }
  function syncTiles() {
    Array.prototype.forEach.call(tsw.children, function (b) {
      b.setAttribute("aria-pressed", String(state.tiles.indexOf(b.dataset.id) >= 0));
    });
  }
  el("allTiles").addEventListener("click", function () {
    state.tiles = product.colors.map(function (t) { return t.id; });
    syncTiles(); update();
  });
  el("wall").addEventListener("input", function (e) { state.wall = parseFloat(e.target.value); update(); });

  /* Decor controls */
  var csw = el("colorSw");
  function buildDecor() {
    csw.innerHTML = "";
    product.colors.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sw";
      b.dataset.id = c.id;
      b.setAttribute("aria-label", c.name + " (Dash and Dot)");
      var swc = document.createElement("canvas"), nm = document.createElement("span");
      nm.className = "nm"; nm.textContent = c.name;
      b.appendChild(swc); b.appendChild(nm);
      b.addEventListener("click", function () { state.color = c.id; syncColors(); update(); });
      csw.appendChild(b);
    });
    syncColors();
    drawSwatches();
    seg("patternSeg", PATTERNS, "pattern");
    onSegChange();
    el("dimW").value = state.w;
    el("dimH").value = state.h;
  }
  function drawSwatches() {
    Array.prototype.forEach.call(csw.querySelectorAll("canvas"), function (c, k) {
      TV.drawDecorSwatch(c, product, product.colors[k]);
    });
  }
  function syncColors() {
    Array.prototype.forEach.call(csw.children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.id === state.color));
    });
  }
  el("swap").addEventListener("click", function () { state.swap = !state.swap; update(); });
  function dimInput(id, key, lo, hi) {
    var inp = el(id);
    inp.addEventListener("input", function () {
      var v = parseFloat(inp.value);
      if (inRange(v, lo, hi)) { state[key] = Math.round(v); update(); }
    });
    inp.addEventListener("change", function () { inp.value = state[key]; });
  }
  dimInput("dimW", "w", 15, 600);
  dimInput("dimH", "h", 15, 300);

  /* Reset */
  el("reset").addEventListener("click", function () {
    states[current.id] = defaultsFor(current);
    saveState(current);
    showPlace(current);
  });

  /* ---------- share ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand("copy")) resolve(); else reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  function shareButton(id) {
    var b = el(id), timer;
    b.addEventListener("click", function () {
      var url = location.href;
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      copyText(url).then(function () {
        b.textContent = "Link copied";
        clearTimeout(timer);
        timer = setTimeout(function () { b.textContent = "Share"; }, 1800);
      }, function () { window.prompt("Copy this link:", url); });
    });
  }
  shareButton("share");
  shareButton("shareIndex");

  /* ---------- boot ---------- */
  var raf;
  function redraw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      if (current) { render(); if (product.kind === "decor") drawSwatches(); }
      else drawCards();
    });
  }
  window.addEventListener("resize", redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(document.querySelector(".wrap"));
  window.addEventListener("hashchange", route);

  buildTabs();
  route();
})();

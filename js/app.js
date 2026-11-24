(function () {
  var TV = window.TileViz;

  var ALL_LAYOUTS = {
    straight: { id: "straight", name: "Straight" },
    drop: { id: "drop", name: "Half drop" }
  };
  var ANGLES = [
    { id: 0, name: "Vertical" },
    { id: 90, name: "Horizontal" },
    { id: 45, name: "Diagonal" }
  ];
  var MIXES = [
    { id: "random", name: "Random" },
    { id: "columns", name: "By strip" },
    { id: "rows", name: "By row" }
  ];
  var BASE_DEFAULTS = {
    mix: "random", grout: "#cdbfa6", groutName: "Sabbia",
    layout: "straight", angle: 0, joint: 3, wall: 90
  };

  var selection, product, state;

  var cv = document.getElementById("cv");
  var ctx = cv.getContext("2d");
  function el(id) { return document.getElementById(id); }

  /* ---------- helpers ---------- */
  function hexToRgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function shade(h, f) {
    var c = hexToRgb(h).map(function (v) { return Math.max(0, Math.min(255, Math.round(v * f))); });
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }
  function rnd(i, j) {
    var s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function assign(target) {
    for (var k = 1; k < arguments.length; k++) {
      var src = arguments[k];
      if (src) for (var p in src) if (Object.prototype.hasOwnProperty.call(src, p)) target[p] = src[p];
    }
    return target;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  var noise = (function () {
    var n = document.createElement("canvas");
    n.width = n.height = 192;
    var g = n.getContext("2d");
    for (var k = 0; k < 4200; k++) {
      var dark = Math.random() < 0.55;
      g.fillStyle = dark ? "rgba(0,0,0," + (0.05 + Math.random() * 0.09) + ")" : "rgba(255,255,255," + (0.05 + Math.random() * 0.1) + ")";
      var sz = Math.random() < 0.85 ? 1 : 2;
      g.fillRect(Math.random() * 192, Math.random() * 192, sz, sz);
    }
    return n;
  })();

  /* ---------- drawing ---------- */
  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var cssW = cv.clientWidth, cssH = cv.clientHeight;
    if (!cssW || !product) return;
    cv.width = Math.round(cssW * dpr);
    cv.height = Math.round(cssH * dpr);

    var TW = product.size.w, TL = product.size.l;
    var shapeFn = TV.SHAPES[product.shape.type] || TV.SHAPES.rect;
    var s = cssW / state.wall;            // css px per cm
    var g = state.joint / 10;             // grout joint in cm
    var sel = product.colors.filter(function (t) { return state.tiles.indexOf(t.id) >= 0; });
    var n = sel.length;
    function pick(i, j) {
      if (n === 1) return sel[0];
      if (state.mix === "columns") return sel[((i % n) + n) % n];
      if (state.mix === "rows") return sel[((j % n) + n) % n];
      return sel[Math.floor(rnd(i + 7.3, j + 3.9) * n) % n];
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = state.grout;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.fillStyle = ctx.createPattern(noise, "repeat");
    ctx.fillRect(0, 0, cssW, cssH);

    var wallH = cssH / s;
    var reach = Math.hypot(state.wall, wallH) / 2 + Math.max(TW, TL);
    var pitchX = TW + g, pitchY = TL + g;
    var nx = Math.ceil(reach / pitchX), ny = Math.ceil(reach / pitchY);

    ctx.save();
    ctx.translate(cssW / 2, cssH / 2);
    ctx.rotate(state.angle * Math.PI / 180);
    ctx.scale(s, s);
    var pat = ctx.createPattern(noise, "repeat");
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(1 / s));
    ctx.lineJoin = "round";

    for (var i = -nx; i <= nx; i++) {
      for (var j = -ny; j <= ny; j++) {
        var x = i * pitchX - TW / 2;
        var y = j * pitchY - TL / 2 + (state.layout === "drop" && (i & 1) ? pitchY / 2 : 0);
        var f = 0.965 + rnd(i, j) * 0.07;
        shapeFn(ctx, x, y, TW, TL, product.shape);
        ctx.fillStyle = shade(pick(i, j).color, f);
        ctx.fill();
        ctx.fillStyle = pat;
        ctx.fill();
        ctx.lineWidth = 1.3 / s;
        ctx.strokeStyle = "rgba(0,0,0,0.24)";
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function updateReadout() {
    el("r-tile").textContent = product.colors.filter(function (t) { return state.tiles.indexOf(t.id) >= 0; })
      .map(function (t) { return t.name; }).join(", ");
    el("r-grout").textContent = state.groutName + " " + state.grout.toUpperCase();
    el("r-chip").style.background = state.grout;
    el("r-joint").textContent = state.joint + " mm";
    el("r-wall").textContent = state.wall + " cm";
    el("jointOut").textContent = state.joint + " mm";
    el("wallOut").textContent = state.wall + " cm";
    el("customHex").textContent = state.grout;
  }

  function render() { updateReadout(); draw(); }

  /* ---------- controls ---------- */
  function seg(id, items, key, onPick) {
    var wrap = el(id);
    wrap.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.name;
      b.addEventListener("click", function () {
        if (onPick) return onPick(it);
        state[key] = it.id; sync(); render();
      });
      wrap.appendChild(b);
    });
    function sync() {
      Array.prototype.forEach.call(wrap.children, function (b, k) {
        var cur = onPick ? (selection && selection.id) : state[key];
        b.setAttribute("aria-pressed", String(items[k].id === cur));
      });
    }
    sync();
    return sync;
  }

  /* Grout swatches (shared across selections) */
  var swWrap = el("swatches");
  TV.GROUTS.forEach(function (gr) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.dataset.c = gr.c;
    b.dataset.name = gr.name;
    b.innerHTML = '<span class="dot" style="background:' + gr.c + '"></span><span class="nm">' + escapeHtml(gr.name) + "</span>";
    b.addEventListener("click", function () {
      state.grout = gr.c; state.groutName = gr.name;
      el("custom").value = gr.c;
      syncSwatches(); render();
    });
    swWrap.appendChild(b);
  });
  function syncSwatches() {
    Array.prototype.forEach.call(swWrap.children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.c === state.grout && b.dataset.name === state.groutName));
    });
  }
  el("custom").addEventListener("input", function (e) {
    state.grout = e.target.value; state.groutName = "Custom";
    syncSwatches(); render();
  });

  /* Tile colour swatches (per product) */
  var tsw = el("tileSw");
  function buildTiles() {
    tsw.innerHTML = "";
    product.colors.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sw";
      b.dataset.id = t.id;
      b.innerHTML = '<span class="dot" style="background:' + t.color + '"></span><span class="nm">' + escapeHtml(t.name) + "</span>";
      b.addEventListener("click", function () {
        var k = state.tiles.indexOf(t.id);
        if (k >= 0) { if (state.tiles.length > 1) state.tiles.splice(k, 1); }
        else state.tiles.push(t.id);
        syncTiles(); render();
      });
      tsw.appendChild(b);
    });
    var many = product.colors.length > 1;
    el("allTiles").hidden = !many;
    el("allTiles").textContent = "Select all " + product.colors.length;
    el("mixField").hidden = !many;
  }
  function syncTiles() {
    Array.prototype.forEach.call(tsw.children, function (b) {
      b.setAttribute("aria-pressed", String(state.tiles.indexOf(b.dataset.id) >= 0));
    });
  }
  el("allTiles").addEventListener("click", function () {
    state.tiles = product.colors.map(function (t) { return t.id; });
    syncTiles(); render();
  });

  el("joint").addEventListener("input", function (e) { state.joint = parseFloat(e.target.value); render(); });
  el("wall").addEventListener("input", function (e) { state.wall = parseFloat(e.target.value); render(); });

  /* ---------- selections ---------- */
  var syncSelection;

  function applySelection(id) {
    selection = TV.SELECTIONS.filter(function (s) { return s.id === id; })[0] || TV.SELECTIONS[0];
    product = TV.PRODUCTS[selection.product];

    state = assign({}, BASE_DEFAULTS, selection.defaults);
    state.tiles = (state.tiles || []).filter(function (tid) {
      return product.colors.some(function (c) { return c.id === tid; });
    });
    if (!state.tiles.length) state.tiles = [product.colors[0].id];

    var layouts = (product.layouts || ["straight"]).map(function (k) { return ALL_LAYOUTS[k]; }).filter(Boolean);
    if (!layouts.some(function (l) { return l.id === state.layout; })) state.layout = layouts[0].id;

    el("title").textContent = selection.name + " · " + product.brand + " " + product.name;
    el("subtitle").textContent = [product.name + (product.credit ? ", " + product.credit : ""), product.material]
      .filter(Boolean).join(". ") + ".";
    el("productNote").textContent = product.note || "";
    document.title = selection.name + " · " + product.name + " Tile Visualizer";

    el("custom").value = state.grout;
    el("joint").value = state.joint;
    el("wall").value = state.wall;

    buildTiles();
    syncTiles();
    syncSwatches();
    seg("mixSeg", MIXES, "mix");
    seg("layoutSeg", layouts, "layout");
    seg("angleSeg", ANGLES, "angle");
    if (syncSelection) syncSelection();
    render();
  }

  syncSelection = seg("selectionSeg", TV.SELECTIONS, null, function (it) {
    if (location.hash.slice(1) !== it.id) location.hash = it.id;
    else applySelection(it.id);
  });
  window.addEventListener("hashchange", function () { applySelection(location.hash.slice(1)); });

  var raf;
  function scheduleDraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
  window.addEventListener("resize", scheduleDraw);
  if (window.ResizeObserver) new ResizeObserver(scheduleDraw).observe(cv);

  applySelection(location.hash.slice(1));
})();

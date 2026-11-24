/*
 * Canvas rendering for both tile kinds (see js/kinds.js). Everything is drawn in centimetres
 * and scaled to the canvas, so the same code draws the main stage, the
 * overview cards and the colour swatches.
 */
(function () {
  var TV = (window.TileViz = window.TileViz || {});

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

  function noisePattern(ctx, s) {
    var pat = ctx.createPattern(noise, "repeat");
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(1 / s));
    return pat;
  }

  /* A colour with `tones` gets one of them per tile, in proportion to their weights. */
  function toneOf(col, i, j) {
    if (!col.tones || !col.tones.length) return col.color;
    var total = 0, k;
    for (k = 0; k < col.tones.length; k++) total += col.tones[k].w || 1;
    var r = rnd(i + 19.3, j + 5.7) * total;
    for (k = 0; k < col.tones.length; k++) {
      r -= col.tones[k].w || 1;
      if (r < 0) return col.tones[k].c;
    }
    return col.tones[col.tones.length - 1].c;
  }

  /* Size the backing store to the element and return a CSS-pixel context. */
  function setup(cv) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  /* ---------- mix kind (Bottone, plain rectangles) ---------- */
  TV.drawStrip = function (cv, product, st) {
    var c = setup(cv);
    if (!c) return;
    var ctx = c.ctx, cssW = c.w, cssH = c.h;
    var TW = product.size.w, TL = product.size.l;
    var shapeFn = TV.SHAPES[product.shape.type] || TV.SHAPES.rect;
    var s = cssW / st.wall;
    var g = st.joint / 10;
    var sel = product.colors.filter(function (t) { return st.tiles.indexOf(t.id) >= 0; });
    var n = sel.length;
    function pick(i, j) {
      if (n === 1) return sel[0];
      if (st.mix === "columns") return sel[((i % n) + n) % n];
      if (st.mix === "rows") return sel[((j % n) + n) % n];
      // Neighbours always differ: a checkerboard with two colours, diagonal steps with more.
      if (st.mix === "alt") return sel[(((i + j) % n) + n) % n];
      return sel[Math.floor(rnd(i + 7.3, j + 3.9) * n) % n];
    }

    ctx.fillStyle = st.grout;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.fillStyle = ctx.createPattern(noise, "repeat");
    ctx.fillRect(0, 0, cssW, cssH);

    var wallH = cssH / s;
    var reach = Math.hypot(st.wall, wallH) / 2 + Math.max(TW, TL);
    var pitchX = TW + g, pitchY = TL + g;
    var nx = Math.ceil(reach / pitchX), ny = Math.ceil(reach / pitchY);

    ctx.save();
    ctx.translate(cssW / 2, cssH / 2);
    ctx.rotate(st.angle * Math.PI / 180);
    ctx.scale(s, s);
    var pat = noisePattern(ctx, s);
    ctx.lineJoin = "round";
    for (var i = -nx; i <= nx; i++) {
      for (var j = -ny; j <= ny; j++) {
        var x = i * pitchX - TW / 2;
        var y = j * pitchY - TL / 2 + (st.layout === "drop" && (i & 1) ? pitchY / 2 : 0);
        var f = 0.965 + rnd(i, j) * 0.07;
        shapeFn(ctx, x, y, TW, TL, product.shape);
        ctx.fillStyle = shade(toneOf(pick(i, j), i, j), f);
        ctx.fill();
        ctx.fillStyle = pat;
        ctx.fill();
        ctx.lineWidth = 1.3 / s;
        ctx.strokeStyle = "rgba(0,0,0,0.24)";
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  /* ---------- decor kind (Homage to the Square) ---------- */

  /* Grid of tiles laid from the top-left corner; partial tiles on the right/bottom are cuts. */
  TV.decorLayout = function (product, st) {
    var T = product.size.w, g = st.joint / 10, pitch = T + g;
    var cols = Math.max(1, Math.ceil(st.w / pitch)), rows = Math.max(1, Math.ceil(st.h / pitch));
    var splitCol = Math.round(cols / 2), splitRow = Math.round(rows / 2);
    var counts = { dash: 0, dot: 0 }, cut = 0;
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        counts[TV.decorAt(st, i, j, splitCol, splitRow)]++;
        if (i * pitch + T > st.w + 1e-6 || j * pitch + T > st.h + 1e-6) cut++;
      }
    }
    return { T: T, pitch: pitch, cols: cols, rows: rows, splitCol: splitCol, splitRow: splitRow, counts: counts, cut: cut, total: cols * rows };
  };

  TV.decorAt = function (st, i, j, splitCol, splitRow) {
    var a = st.swap ? "dot" : "dash", b = st.swap ? "dash" : "dot";
    switch (st.pattern) {
      case "dot": return "dot";
      case "split-h": return j < splitRow ? a : b;
      case "split-v": return i < splitCol ? a : b;
      case "alt": return (i + j) % 2 === 0 ? a : b;
      default: return "dash";
    }
  };

  function gloss(ctx, x, y, w, h) {
    var gr = ctx.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.55, "rgba(255,255,255,0.04)");
    gr.addColorStop(1, "rgba(255,255,255,0.2)");
    ctx.fillStyle = gr;
    ctx.fillRect(x, y, w, h);
  }

  /* Paint one 15 cm tile at (x, y). `lw` is one device pixel in current units. */
  TV.paintDecorTile = function (ctx, x, y, T, border, col, decor, f, pat, lw) {
    var b = T * border, k;
    var corners = [[x, y], [x + T - b, y], [x, y + T - b], [x + T - b, y + T - b]];

    if (decor === "dash") {
      ctx.fillStyle = shade(col.bar, f);
      ctx.fillRect(x, y, T, T);
      ctx.fillStyle = shade(col.main, f);
      ctx.fillRect(x + b, y + b, T - 2 * b, T - 2 * b);
      gloss(ctx, x + b, y + b, T - 2 * b, T - 2 * b);
    } else {
      ctx.fillStyle = shade(col.main, f);
      ctx.fillRect(x, y, T, T);
    }
    for (k = 0; k < 4; k++) {
      ctx.fillStyle = shade(col.accent, f);
      ctx.fillRect(corners[k][0], corners[k][1], b, b);
      gloss(ctx, corners[k][0], corners[k][1], b, b);
    }
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(x, y, T, T); }

    // Glaze edges between the regions.
    ctx.lineWidth = lw;
    ctx.strokeStyle = "rgba(0,0,0,0.14)";
    if (decor === "dash") ctx.strokeRect(x + b, y + b, T - 2 * b, T - 2 * b);
    for (k = 0; k < 4; k++) ctx.strokeRect(corners[k][0], corners[k][1], b, b);
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.strokeRect(x, y, T, T);
  };

  /* Draws the whole wall, fitted and centred in the canvas. Returns the layout. */
  TV.drawDecor = function (cv, product, st) {
    var c = setup(cv);
    var L = TV.decorLayout(product, st);
    if (!c) return L;
    var ctx = c.ctx;
    var col = product.colors.filter(function (x) { return x.id === st.color; })[0] || product.colors[0];
    var s = Math.min(c.w / st.w, c.h / st.h);
    var ox = (c.w - st.w * s) / 2, oy = (c.h - st.h * s) / 2;

    ctx.clearRect(0, 0, c.w, c.h);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.rect(0, 0, st.w, st.h);
    ctx.clip();
    var pat = noisePattern(ctx, s);
    ctx.fillStyle = st.grout;
    ctx.fillRect(0, 0, st.w, st.h);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, st.w, st.h);

    for (var i = 0; i < L.cols; i++) {
      for (var j = 0; j < L.rows; j++) {
        var f = 0.975 + rnd(i, j) * 0.05;
        TV.paintDecorTile(ctx, i * L.pitch, j * L.pitch, L.T, product.border, col,
          TV.decorAt(st, i, j, L.splitCol, L.splitRow), f, pat, 1 / s);
      }
    }
    ctx.restore();
    return L;
  };

  /* Small swatch: the colour's Dash and Dot tiles side by side. */
  TV.drawDecorSwatch = function (cv, product, col) {
    var c = setup(cv);
    if (!c) return;
    var ctx = c.ctx, T = product.size.w, gap = 1.2;
    var s = Math.min(c.w / (2 * T + gap), c.h / T);
    ctx.clearRect(0, 0, c.w, c.h);
    ctx.save();
    ctx.translate((c.w - (2 * T + gap) * s) / 2, (c.h - T * s) / 2);
    ctx.scale(s, s);
    TV.paintDecorTile(ctx, 0, 0, T, product.border, col, "dash", 1, null, 1 / s);
    TV.paintDecorTile(ctx, T + gap, 0, T, product.border, col, "dot", 1, null, 1 / s);
    ctx.restore();
  };

  TV.draw = function (cv, tile, st) { TV.KINDS[tile.kind].draw(cv, tile, st); };
})();

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

  /* ---------- decor kind (Homage to the Square, Aurore, Betty, Fringe, Tape…) ---------- */

  /* Tile footprint on the wall: the nominal size, swapped when a non-square tile is turned. */
  function footprint(tile, st) {
    var w = tile.size.w, l = tile.size.l;
    return TV.decorTurned(tile, st) ? { w: l, h: w } : { w: w, h: l };
  }
  /* Is a non-square tile laid the other way round from how its size is given? */
  TV.decorTurned = function (tile, st) {
    if (tile.size.w === tile.size.l) return false;
    var longVertical = tile.size.l > tile.size.w;
    return (st.orient === "h") === longVertical;
  };

  /* Which of the selected decors (an index into st.decors) goes in grid cell (i, j). */
  TV.decorIndex = function (st, i, j, cols, rows) {
    var n = st.decors.length;
    if (n <= 1) return 0;
    switch (st.pattern) {
      case "split-h": return Math.min(n - 1, Math.floor(j * n / rows));
      case "split-v": return Math.min(n - 1, Math.floor(i * n / cols));
      case "rows": return j % n;
      case "columns": return i % n;
      case "alt": return (i + j) % n;
      default: return Math.floor(rnd(i + 3.1, j + 7.7) * n) % n;
    }
  };
  /* Quarter turns for the tile in cell (i, j). */
  TV.decorQuarter = function (st, i, j) {
    if (st.turn === "alt") return (i + j) % 2;
    if (st.turn === "random") return Math.floor(rnd(i + 11.3, j + 2.9) * 4) % 4;
    return 0;
  };

  /* Grid of tiles laid from the top-left corner; partial tiles on the right/bottom are cuts. */
  TV.decorLayout = function (tile, st) {
    var fp = footprint(tile, st), g = st.joint / 10, px = fp.w + g, py = fp.h + g;
    var cols = Math.max(1, Math.ceil(st.w / px)), rows = Math.max(1, Math.ceil(st.h / py));
    var counts = {}, cut = 0;
    st.decors.forEach(function (id) { counts[id] = 0; });
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        counts[st.decors[TV.decorIndex(st, i, j, cols, rows)]]++;
        if (i * px + fp.w > st.w + 1e-6 || j * py + fp.h > st.h + 1e-6) cut++;
      }
    }
    return { tw: fp.w, th: fp.h, px: px, py: py, cols: cols, rows: rows, counts: counts, cut: cut, total: cols * rows };
  };

  function gloss(ctx, x, y, w, h) {
    var gr = ctx.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.55, "rgba(255,255,255,0.04)");
    gr.addColorStop(1, "rgba(255,255,255,0.2)");
    ctx.fillStyle = gr;
    ctx.fillRect(x, y, w, h);
  }

  /* Paint one tile whose footprint's top-left is (x, y). `quarter` is extra quarter turns,
     `turned` swaps a non-square tile's sides; `lw` is one device pixel in current units. */
  TV.paintDecor = function (ctx, tile, col, decor, x, y, quarter, turned, opts) {
    var W = tile.size.w, L = tile.size.l;
    var fw = turned ? L : W, fh = turned ? W : L;
    var f = opts.f == null ? 1 : opts.f, seedBase = opts.seed || 0;
    var painter = TV.PAINTERS[decor.paint] || TV.PAINTERS.plain;
    ctx.save();
    ctx.translate(x + fw / 2, y + fh / 2);
    ctx.rotate(((quarter || 0) + (turned ? 1 : 0)) * Math.PI / 2);
    ctx.translate(-W / 2, -L / 2);
    ctx.beginPath();
    ctx.rect(0, 0, W, L);
    ctx.clip();
    painter(ctx, W, L, col, decor, {
      shade: function (hex) { return shade(hex, f); },
      gloss: function (gx, gy, gw, gh) { gloss(ctx, gx, gy, gw, gh); },
      lw: opts.lw,
      grout: opts.grout,
      seed: function (a, b) { return rnd(a + seedBase * 0.37, b + seedBase * 1.91); }
    });
    if (opts.noise) { ctx.fillStyle = opts.noise; ctx.fillRect(0, 0, W, L); }
    if (col.gloss) gloss(ctx, 0, 0, W, L);
    ctx.restore();
    ctx.lineWidth = opts.lw;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.strokeRect(x, y, fw, fh);
  };

  function colourOf(tile, st) {
    return tile.colors.filter(function (x) { return x.id === st.color; })[0] || tile.colors[0];
  }
  function decorById(tile, id) {
    return tile.decors.filter(function (x) { return x.id === id; })[0] || tile.decors[0];
  }

  /* Draws the whole wall, fitted and centred in the canvas. Returns the layout. */
  TV.drawDecor = function (cv, tile, st) {
    var c = setup(cv);
    var L = TV.decorLayout(tile, st);
    if (!c) return L;
    var ctx = c.ctx, col = colourOf(tile, st), turned = TV.decorTurned(tile, st);
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
        var decor = decorById(tile, st.decors[TV.decorIndex(st, i, j, L.cols, L.rows)]);
        TV.paintDecor(ctx, tile, col, decor, i * L.px, j * L.py, TV.decorQuarter(st, i, j), turned, {
          f: 0.975 + rnd(i, j) * 0.05, noise: pat, lw: 1 / s, grout: st.grout, seed: i * 31 + j
        });
      }
    }
    ctx.restore();
    return L;
  };

  /* Small swatch: the given decors (default: the tile's first two) side by side in one colour. */
  TV.drawDecorSwatch = function (cv, tile, col, decorIds, grout) {
    var c = setup(cv);
    if (!c) return;
    var ids = decorIds || tile.decors.slice(0, 2).map(function (d) { return d.id; });
    var ctx = c.ctx, W = tile.size.w, L = tile.size.l, gap = Math.max(W, L) * 0.08, n = ids.length;
    var totalW = n * W + (n - 1) * gap;
    var s = Math.min(c.w / totalW, c.h / L);
    ctx.clearRect(0, 0, c.w, c.h);
    ctx.save();
    ctx.translate((c.w - totalW * s) / 2, (c.h - L * s) / 2);
    ctx.scale(s, s);
    ids.forEach(function (id, k) {
      TV.paintDecor(ctx, tile, col, decorById(tile, id), k * (W + gap), 0, 0, false, { lw: 1 / s, grout: grout || "#cdbfa6", seed: k });
    });
    ctx.restore();
  };

  TV.draw = function (cv, tile, st) { TV.KINDS[tile.kind].draw(cv, tile, st); };
})();

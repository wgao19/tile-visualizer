/*
 * Decor painters: how one tile face of the "decor" kind is drawn.
 *
 * A tile's `decors` list names a painter for each decor, plus that decor's own
 * parameters (see js/tiles/*.js). A painter draws one tile in the tile's own
 * coordinates, in centimetres: (0, 0) to (W, L), where W × L is the tile's nominal
 * size before any turn. The renderer has already moved, turned and clipped the
 * context, so painters never need to know where the tile sits on the wall.
 *
 *   painter(ctx, W, L, col, decor, env)
 *     col     the area's colour entry (its roles: base, motif, line… vary by tile)
 *     decor   the decor entry, with its parameters
 *     env     { shade(hex) → tile-varied colour, noise, lw (one pixel), grout, seed(a, b) → 0..1 }
 *
 * Painters only paint the face. Noise, edge lines and the gloss are added by the renderer.
 */
(function () {
  var TV = (window.TileViz = window.TileViz || {});
  var PI = Math.PI;

  function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function line(ctx, x1, y1, x2, y2) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }

  /* Polygon with rounded (filleted) corners where `round[k]` is set. */
  function filletPath(ctx, pts, round, r) {
    var n = pts.length;
    ctx.beginPath();
    var p0 = pts[0], pl = pts[n - 1];
    ctx.moveTo((p0[0] + pl[0]) / 2, (p0[1] + pl[1]) / 2);
    for (var k = 0; k < n; k++) {
      var p = pts[k], q = pts[(k + 1) % n];
      if (round[k]) ctx.arcTo(p[0], p[1], q[0], q[1], r);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
  }
  function plusPath(ctx, W, L, a, r) {
    var cx = W / 2, cy = L / 2;
    filletPath(ctx, [
      [cx - a, 0], [cx + a, 0], [cx + a, cy - a], [W, cy - a], [W, cy + a], [cx + a, cy + a],
      [cx + a, L], [cx - a, L], [cx - a, cy + a], [0, cy + a], [0, cy - a], [cx - a, cy - a]
    ], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], r);
  }
  function tPath(ctx, W, L, a, r) {
    var cx = W / 2, cy = L / 2;
    filletPath(ctx, [
      [0, cy - a], [W, cy - a], [W, cy + a], [cx + a, cy + a], [cx + a, L], [cx - a, L], [cx - a, cy + a], [0, cy + a]
    ], [0, 0, 0, 1, 0, 0, 1, 0], r);
  }
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* A repeating cell, cached as a pattern, for very fine textures (Pico's dot grid). */
  var cellCache = {};
  function cellPattern(ctx, key, px, draw) {
    var cv = cellCache[key];
    if (!cv) {
      cv = document.createElement("canvas");
      cv.width = cv.height = px;
      draw(cv.getContext("2d"), px);
      cellCache[key] = cv;
    }
    return ctx.createPattern(cv, "repeat");
  }

  TV.PAINTERS = {
    /* One flat colour: the decor's own colour if it has one, else the colour's base. */
    plain: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(d.color || col.base));
    },

    /* Homage to the Square. Dash: glossy centre, matte bars, glossy corners. Dot: matte field, glossy corners. */
    homage: function (ctx, W, L, col, d, env) {
      var b = W * (d.border || 0.123), k;
      var corners = [[0, 0], [W - b, 0], [0, L - b], [W - b, L - b]];
      if (d.variant === "dash") {
        rect(ctx, 0, 0, W, L, env.shade(col.bar));
        rect(ctx, b, b, W - 2 * b, L - 2 * b, env.shade(col.main));
        env.gloss(b, b, W - 2 * b, L - 2 * b);
      } else {
        rect(ctx, 0, 0, W, L, env.shade(col.main));
      }
      for (k = 0; k < 4; k++) {
        rect(ctx, corners[k][0], corners[k][1], b, b, env.shade(col.accent));
        env.gloss(corners[k][0], corners[k][1], b, b);
      }
      ctx.lineWidth = env.lw;
      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      if (d.variant === "dash") ctx.strokeRect(b, b, W - 2 * b, L - 2 * b);
      for (k = 0; k < 4; k++) ctx.strokeRect(corners[k][0], corners[k][1], b, b);
    },

    /* Aurore: a grid of thin strokes. `cols` verticals, `rows` main horizontals, `minor` adds
       horizontals halfway between in the vertical colour. */
    grid: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      var w = d.stroke || 0.14, k;
      ctx.lineCap = "butt";
      ctx.lineWidth = w;
      ctx.strokeStyle = col.cross;
      ctx.beginPath();
      if (d.minor) for (k = 0; k < d.rows; k++) line(ctx, 0, (k + 0.5) * L / d.rows, W, (k + 0.5) * L / d.rows);
      for (k = 1; k < d.cols; k++) line(ctx, k * W / d.cols, 0, k * W / d.cols, L);
      ctx.stroke();
      ctx.strokeStyle = col.line;
      ctx.beginPath();
      for (k = 1; k < d.rows; k++) line(ctx, 0, k * L / d.rows, W, k * L / d.rows);
      ctx.stroke();
    },

    /* Betty: a plus, a T, a frame, or the frame and plus together ("set"). */
    betty: function (ctx, W, L, col, d, env) {
      var a = W * 0.18, r = W * 0.12;
      function frame() {
        rect(ctx, 0, 0, W, L, env.shade(col.frame));
        roundRectPath(ctx, W * 0.09, L * 0.09, W * 0.82, L * 0.82, W * 0.16);
        ctx.fillStyle = env.shade(col.base);
        ctx.fill();
      }
      if (d.shape === "frame" || d.shape === "set") frame();
      else rect(ctx, 0, 0, W, L, env.shade(col.base));
      if (d.shape === "t") { tPath(ctx, W, L, a, r); ctx.fillStyle = env.shade(col.motif); ctx.fill(); }
      if (d.shape === "plus") { plusPath(ctx, W, L, a, r); ctx.fillStyle = env.shade(col.motif); ctx.fill(); }
      if (d.shape === "set") {
        // The cross is see-through: darker over the centre, lighter over the frame.
        ctx.save();
        plusPath(ctx, W, L, a * 0.8, r);
        ctx.clip();
        ctx.globalAlpha = 0.6;
        rect(ctx, 0, 0, W, L, env.shade(col.motif));
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = env.shade(col.base);
        ctx.beginPath();
        ctx.rect(0, 0, W, L);
        roundRectPath(ctx, W * 0.09, L * 0.09, W * 0.82, L * 0.82, W * 0.16);
        ctx.fill("evenodd");
        ctx.restore();
      }
    },

    /* Fringe: parallel grooves along the tile's length. Grout fills them once laid. */
    fringe: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      var n = d.segments, gw = d.groove || 0.2, k, x;
      for (k = 1; k < n; k++) {
        x = k * W / n;
        rect(ctx, x - gw / 2, 0, gw, L, env.grout);
        rect(ctx, x - gw / 2, 0, gw * 0.3, L, "rgba(0,0,0,0.28)");
        rect(ctx, x + gw / 2, 0, gw * 0.35, L, "rgba(255,255,255,0.18)");
      }
    },

    /* Chamotte: glossy, uneven glaze; Linea has raised ridges, Quadra breaks them a third of the way down. */
    chamotte: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      var k, s = env.seed;
      // Mottled glaze: soft light and dark pools.
      for (k = 0; k < 10; k++) {
        var x = s(k, 1) * W, y = s(k, 2) * L, rr = (0.12 + s(k, 3) * 0.18) * W;
        var g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        var light = s(k, 4) > 0.5;
        g.addColorStop(0, light ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, L);
      }
      if (!d.ridges) return;
      var n = d.ridges, cut = d.quadra ? L * 0.3 : 0;
      function ridges(y0, y1, off) {
        for (var j = 0; j < n; j++) {
          var cx = (j + 0.5 + off) * W / n;
          if (cx <= 0 || cx >= W) continue;
          rect(ctx, cx - W / n * 0.18, y0, W / n * 0.16, y1 - y0, "rgba(255,255,255,0.35)");
          rect(ctx, cx, y0, W / n * 0.2, y1 - y0, "rgba(0,0,0,0.3)");
        }
      }
      if (cut) {
        ridges(0, cut - 0.3, 0.5);
        rect(ctx, 0, cut - 0.3, W, 0.3, "rgba(0,0,0,0.35)");
      }
      ridges(cut, L, 0);
    },

    /* Raised ("up") or sunken ("down") dots. `count` dots along the length, or a grid every `pitch` cm. */
    dots: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      var dot = d.color || null;
      function one(x, y, r) {
        if (d.mode === "up") {
          var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
          g.addColorStop(0, "rgba(255,255,255,0.55)");
          g.addColorStop(0.6, dot || "rgba(255,255,255,0.05)");
          g.addColorStop(1, "rgba(0,0,0,0.3)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); ctx.fill();
        } else {
          ctx.lineWidth = r * 0.28;
          ctx.strokeStyle = "rgba(0,0,0,0.28)";
          ctx.beginPath(); ctx.arc(x, y, r * 0.8, PI * 0.75, PI * 1.75); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath(); ctx.arc(x, y, r * 0.8, PI * 1.75, PI * 2.75); ctx.stroke();
          if (dot) { ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 2 * PI); ctx.fill(); }
        }
      }
      if (d.count) {
        var long = Math.max(W, L), short = Math.min(W, L), r = d.radius || short * 0.15;
        for (var k = 0; k < d.count; k++) {
          var t = (k + 0.5) * long / d.count;
          if (W >= L) one(t, L / 2, r); else one(W / 2, t, r);
        }
        return;
      }
      // Fine grid. When a dot would be under a few screen pixels it can't be drawn without
      // moiré, so the grid becomes the even tint it reads as from that distance.
      if (d.pitch / env.lw < 5) {
        rect(ctx, 0, 0, W, L, d.mode === "up" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)");
        if (dot) { ctx.globalAlpha = 0.12; rect(ctx, 0, 0, W, L, dot); ctx.globalAlpha = 1; }
        return;
      }
      // Otherwise one cached cell repeated as a pattern.
      var px = 24, key = "dots|" + d.mode + "|" + (dot || "");
      var pat = cellPattern(ctx, key, px, function (g, n) {
        var c = n / 2, rr = n * 0.22;
        if (d.mode === "up") {
          g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.arc(c - 1, c - 1, rr, 0, 2 * PI); g.fill();
          g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.arc(c + 1, c + 1, rr, 0, 2 * PI); g.fill();
        } else {
          g.fillStyle = "rgba(0,0,0,0.22)"; g.beginPath(); g.arc(c, c, rr, 0, 2 * PI); g.fill();
        }
        if (dot) { g.fillStyle = dot; g.beginPath(); g.arc(c, c, rr * 0.7, 0, 2 * PI); g.fill(); }
      });
      if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(d.pitch / px));
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, L);
    },

    /* Tape: cobbles, grainy stitches, knit mesh or zigzag bands, on the whole tile or its lower half. */
    tape: function (ctx, W, L, col, d, env) {
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      var s = env.seed, k, j;
      var top = d.half ? L * 0.5 : 0;
      function grainy(y0) {
        var n = 28, cw = W / n, dash = L / 42;
        ctx.strokeStyle = col.grain;
        ctx.lineWidth = cw * 0.42;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (k = 0; k < n; k++) {
          var x = (k + 0.5) * cw, off = s(k, 9) * dash;
          for (var y = y0 - off; y < L; y += dash * 1.35) line(ctx, x, Math.max(y0, y), x, Math.min(L, y + dash));
        }
        ctx.stroke();
      }
      if (d.motif === "cobble") {
        var rows = 11, rh = L / rows, per = 5.5, cw2 = W / per;
        ctx.fillStyle = env.shade(col.cobble);
        for (j = Math.floor(top / rh); j < rows; j++) {
          for (k = -1; k <= per + 1; k++) {
            var cx = (k + (j % 2 ? 0.5 : 0)) * cw2 + (s(j, k) - 0.5) * cw2 * 0.15;
            var cy = (j + 0.5) * rh;
            if (cy - rh * 0.3 < top) continue;
            ctx.beginPath();
            ctx.ellipse(cx, cy, cw2 * (0.34 + s(k, j) * 0.06), rh * 0.3, 0, 0, 2 * PI);
            ctx.fill();
          }
        }
      } else if (d.motif === "grainy") {
        grainy(top);
      } else if (d.motif === "mesh") {
        var mc = 14, mw = W / mc, mh = L / 16;
        ctx.strokeStyle = col.mesh;
        ctx.lineWidth = Math.max(env.lw, W * 0.004);
        ctx.beginPath();
        for (k = 0; k < mc; k++) {
          var mx = (k + 0.5) * mw;
          for (var my = top; my < L; my += mh) {
            line(ctx, mx - mw * 0.42, my, mx, my + mh * 0.55);
            line(ctx, mx, my + mh * 0.55, mx + mw * 0.42, my);
          }
        }
        ctx.stroke();
      } else if (d.motif === "zigzag") {
        grainy(0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, top, W, L - top);
        ctx.clip();
        var bands = 4, per2 = W / 2, amp = L / 16, th = L / 8;
        for (j = 0; j < bands; j++) {
          var yc = (j + 0.5) * L / bands;
          ctx.beginPath();
          for (k = 0; k <= 4; k++) ctx.lineTo(k * per2 / 2, yc - th / 2 + (k % 2 ? amp : -amp));
          for (k = 4; k >= 0; k--) ctx.lineTo(k * per2 / 2, yc + th / 2 + (k % 2 ? amp : -amp));
          ctx.closePath();
          ctx.fillStyle = env.shade(col.zig);
          ctx.fill();
        }
        // Fine light hatching over the bands, like the printed stitches.
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = W * 0.003;
        ctx.beginPath();
        for (k = 0; k < 90; k++) line(ctx, (k + 0.5) * W / 90, 0, (k + 0.5) * W / 90, L);
        ctx.stroke();
        ctx.restore();
      }
    },

    /* Dintorni: hand-hatched stairs (Scala), flags (Bandiere) or a hatched chessboard with dots (Dama). */
    dintorni: function (ctx, W, L, col, d, env) {
      var n = 8, c = W / n, s = env.seed, i, j, k;
      rect(ctx, 0, 0, W, L, env.shade(col.base));
      ctx.lineCap = "round";
      function hatch(x1, y1, x2, y2, dx, dy, count, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = c * 0.035;
        ctx.beginPath();
        for (var m = 0; m <= count; m++) {
          var t = m / count, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
          line(ctx, x, y, x + dx, y + dy);
        }
        ctx.stroke();
      }
      if (d.motif === "scala") {
        // Stairs climbing to the right: each step a hatched riser and tread.
        for (k = -n; k < 2 * n; k += 2) {
          for (i = 0; i < n + 1; i++) {
            var x = i * c, y = (k - i + n) * c;
            if (y < -c || y > L + c) continue;
            hatch(x, y, x, y + c * 0.85, c * 0.22, -c * 0.22, 8, col.accent);
            hatch(x, y, x + c * 0.85, y, c * 0.2, -c * 0.2, 8, col.accent);
          }
        }
      } else if (d.motif === "bandiere") {
        // Diagonal lines with hatched right-angled flags hanging off them.
        ctx.strokeStyle = col.line;
        ctx.lineWidth = c * 0.05;
        ctx.beginPath();
        for (k = -n; k < n; k += 2) line(ctx, k * c, 0, k * c + L, L);
        ctx.stroke();
        for (k = -n; k < n; k += 2) {
          for (i = 0; i < n; i++) {
            var fx = k * c + i * c, fy = i * c;
            if (fx < -c || fx > W) continue;
            for (var m = 1; m <= 5; m++) {
              var t = m / 6;
              ctx.beginPath();
              line(ctx, fx + c * t, fy + c * t, fx + c * t, fy + c * t - c * (1 - t) * 0.9);
              ctx.strokeStyle = col.line;
              ctx.lineWidth = c * 0.035;
              ctx.stroke();
            }
          }
        }
      } else if (d.motif === "dama") {
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            if ((i + j) % 2) continue;
            rect(ctx, i * c, j * c, c, c, env.shade(col.tint));
          }
        }
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            var x0 = i * c, y0 = j * c;
            if ((i + j) % 2 === 0) hatch(x0 + c * 0.15, y0 + c * 0.15, x0 + c * 0.85, y0 + c * 0.85, c * 0.0, -c * 0.25, 6, col.line);
            else hatch(x0, y0 + c, x0 + c * 0.9, y0 + c, c * 0.12, -c * 0.12, 7, col.accent);
            if (s(i, j) < 0.1) {
              ctx.fillStyle = col.dot;
              ctx.beginPath(); ctx.arc(x0 + c * 0.6, y0 + c * 0.35, c * 0.08, 0, 2 * PI); ctx.fill();
            }
          }
        }
      }
    }
  };
})();

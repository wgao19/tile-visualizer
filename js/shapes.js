/*
 * Tile outline builders. Each takes (ctx, x, y, w, l, shape) and builds a
 * path for one tile whose top-left corner is (x, y), in centimetres.
 */
(function () {
  var TV = (window.TileViz = window.TileViz || {});

  TV.SHAPES = {
    rect: function (ctx, x, y, w, l) {
      ctx.beginPath();
      ctx.rect(x, y, w, l);
    },

    /* Osso: long sides bowed inward, narrowest (waist × width) halfway along. */
    "concave-strip": function (ctx, x, y, w, l, shape) {
      var d = w * (1 - (shape.waist || 0.88)) / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.quadraticCurveTo(x + w - 2 * d, y + l / 2, x + w, y + l);
      ctx.lineTo(x, y + l);
      ctx.quadraticCurveTo(x + 2 * d, y + l / 2, x, y);
      ctx.closePath();
    },

    "notched-strip": function (ctx, x, y, w, l, shape) {
      var r = shape.notchRadius, n = shape.notches, i, cy;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      for (i = 0; i < n; i++) {
        cy = y + l * (i + 0.5) / n;
        ctx.lineTo(x + w, cy - r);
        ctx.arc(x + w, cy, r, -Math.PI / 2, Math.PI / 2, true);
      }
      ctx.lineTo(x + w, y + l);
      ctx.lineTo(x, y + l);
      for (i = n - 1; i >= 0; i--) {
        cy = y + l * (i + 0.5) / n;
        ctx.lineTo(x, cy + r);
        ctx.arc(x, cy, r, Math.PI / 2, -Math.PI / 2, true);
      }
      ctx.closePath();
    }
  };
})();

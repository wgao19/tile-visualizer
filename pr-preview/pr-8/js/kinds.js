/*
 * Tile kinds: the only per-tile-family code. A kind says how a tile is drawn,
 * which options it has, and how those options go in and out of a link. Tiles in
 * js/data.js pick a kind; everything else about a tile is data.
 *
 * Each kind has:
 *   base        default options, used when the tile and the area don't set them
 *   normalize   (tile, st)       make the options valid for this tile
 *   serialize   (st)             [key, value] pairs for the link
 *   parse       (p, tile, st)    apply link params (invalid values are ignored)
 *   facts       (tile, st)       [label, value, chip colour?] rows for the readout and cards
 *   controls    (tile)           control specs; js/app.js turns them into inputs
 *   draw        (canvas, tile, st)
 *   aspect      (st)             optional width / height ratio for the preview; omitted = 4:3 crop
 *
 * Grout and joint belong to the area, not the kind, and are handled in js/app.js.
 * Link keys used by the app itself: n (name), tile, g (grout), j (joint).
 *
 * Control specs:
 *   { type: "swatches", key, label, items, multi?, selectAll?, swatch?(canvas, item) }
 *   { type: "seg",      key, label, items: [{ id, name }], show?(st) }
 *   { type: "toggle",   key, label, show?(st) }
 *   { type: "range",    key, label, min, max, step, unit }
 *   { type: "numbers",  label, fields: [{ key, label, min, max, unit }] }
 */
(function () {
  var TV = window.TileViz;

  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function inRange(v, lo, hi) { return isFinite(v) && v >= lo && v <= hi; }
  function groutName(tile, hex) {
    var all = (tile.grouts || []).concat(TV.GROUTS);
    var g = all.filter(function (x) { return x.c.toLowerCase() === hex.toLowerCase(); })[0];
    return g ? g.name : "Custom";
  }
  function groutFacts(tile, st) {
    return [
      ["Grout", groutName(tile, st.grout) + " " + st.grout.toUpperCase(), st.grout],
      ["Joint", st.joint + " mm"]
    ];
  }
  TV.util = { byId: byId, inRange: inRange, groutName: groutName };

  var LAYOUTS = [{ id: "straight", name: "Straight" }, { id: "drop", name: "Half drop" }];
  var ANGLES = [{ id: 0, name: "Vertical" }, { id: 90, name: "Horizontal" }, { id: 45, name: "Diagonal" }];
  var MIXES = [{ id: "random", name: "Random" }, { id: "columns", name: "By strip" }, { id: "rows", name: "By row" }];
  var PATTERNS = [
    { id: "dash", name: "All dash" },
    { id: "dot", name: "All dot" },
    { id: "split-h", name: "Top / bottom" },
    { id: "split-v", name: "Left / right" },
    { id: "alt", name: "Alternate" }
  ];
  /* Zoom range for the mix kind: up to five tile lengths across, never less than 2 m. */
  function wallRange(tile) {
    var longest = Math.max(tile.size.w, tile.size.l);
    return { min: 20, max: Math.min(600, Math.max(200, Math.ceil(longest * 5 / 5) * 5)) };
  }
  function layoutsFor(tile) {
    return LAYOUTS.filter(function (l) { return (tile.layouts || ["straight"]).indexOf(l.id) >= 0; });
  }

  TV.KINDS = {
    /* One or more colours mixed across the wall. Any outline from js/shapes.js. */
    mix: {
      base: { tiles: [], mix: "random", layout: "straight", angle: 0, wall: 90 },
      normalize: function (tile, st) {
        function valid(ids) {
          return (ids || []).filter(function (id, i, a) { return a.indexOf(id) === i && byId(tile.colors, id); });
        }
        st.tiles = valid(st.tiles);
        if (!st.tiles.length) st.tiles = valid(tile.defaults && tile.defaults.tiles);
        if (!st.tiles.length) st.tiles = [tile.colors[0].id];
        if (!byId(MIXES, st.mix)) st.mix = "random";
        var ls = layoutsFor(tile);
        if (!byId(ls, st.layout)) st.layout = ls[0].id;
        if (!byId(ANGLES, st.angle)) st.angle = 0;
        var wr = wallRange(tile);
        if (!isFinite(st.wall)) st.wall = 90;
        st.wall = Math.min(wr.max, Math.max(wr.min, st.wall));
      },
      serialize: function (st) {
        return [["t", st.tiles.join(",")], ["m", st.mix], ["l", st.layout], ["a", st.angle], ["w", st.wall]];
      },
      parse: function (p, tile, st) {
        if (p.t) st.tiles = p.t.split(",");
        if (p.m) st.mix = p.m;
        if (p.l) st.layout = p.l;
        if (p.a != null) st.angle = parseFloat(p.a);
        var w = parseFloat(p.w);
        if (inRange(w, 20, 600)) st.wall = Math.round(w / 5) * 5;
      },
      facts: function (tile, st) {
        var f = [["Tile", tile.colors.filter(function (t) { return st.tiles.indexOf(t.id) >= 0; })
          .map(function (t) { return t.name; }).join(", ")]];
        if (st.tiles.length > 1) f.push(["Mix", byId(MIXES, st.mix).name]);
        f.push(["Layout", byId(LAYOUTS, st.layout).name + ", " + byId(ANGLES, st.angle).name.toLowerCase()]);
        return f.concat(groutFacts(tile, st));
      },
      controls: function (tile) {
        return [
          { type: "swatches", key: "tiles", label: "Tile colours (pick one or mix several)", items: tile.colors, multi: true, selectAll: true },
          { type: "seg", key: "mix", label: "Mix pattern", items: MIXES, show: function (st) { return st.tiles.length > 1; } },
          { type: "seg", key: "layout", label: "Layout", items: layoutsFor(tile), show: function () { return layoutsFor(tile).length > 1; } },
          { type: "seg", key: "angle", label: "Direction", items: ANGLES },
          { type: "range", key: "wall", label: "Wall width shown", min: wallRange(tile).min, max: wallRange(tile).max, step: 5, unit: "cm" }
        ];
      },
      draw: function (cv, tile, st) { TV.drawStrip(cv, tile, st); }
    },

    /* One colour; each tile is Dash or Dot, set out in a pattern over a surface of a given size. */
    decor: {
      base: { color: null, pattern: "dash", swap: false, w: 240, h: 60 },
      normalize: function (tile, st) {
        if (!byId(tile.colors, st.color)) st.color = (tile.defaults && byId(tile.colors, tile.defaults.color) ? tile.defaults.color : tile.colors[0].id);
        if (!byId(PATTERNS, st.pattern)) st.pattern = "dash";
        st.swap = !!st.swap;
        if (!inRange(st.w, 15, 600)) st.w = 240;
        if (!inRange(st.h, 15, 300)) st.h = 60;
      },
      serialize: function (st) {
        return [["c", st.color], ["p", st.pattern], ["s", st.swap ? 1 : 0], ["w", st.w], ["h", st.h]];
      },
      parse: function (p, tile, st) {
        if (p.c) st.color = p.c;
        if (p.p) st.pattern = p.p;
        if (p.s === "1" || p.s === "0") st.swap = p.s === "1";
        var w = parseFloat(p.w), h = parseFloat(p.h);
        if (inRange(w, 15, 600)) st.w = Math.round(w);
        if (inRange(h, 15, 300)) st.h = Math.round(h);
      },
      facts: function (tile, st) {
        var L = TV.decorLayout(tile, st);
        var a = st.swap ? "dot" : "dash", b = st.swap ? "dash" : "dot";
        var pat = byId(PATTERNS, st.pattern).name;
        if (st.pattern === "split-h") pat = "Top " + a + ", bottom " + b;
        if (st.pattern === "split-v") pat = "Left " + a + ", right " + b;
        if (st.pattern === "alt") pat = "Alternate, starting " + a;
        var mix = [];
        if (L.counts.dash) mix.push(L.counts.dash + " dash");
        if (L.counts.dot) mix.push(L.counts.dot + " dot");
        return [["Colour", byId(tile.colors, st.color).name], ["Pattern", pat]]
          .concat(groutFacts(tile, st))
          .concat([
            ["Surface", st.w + " × " + st.h + " cm"],
            ["Tiles", L.total + " (" + mix.join(", ") + (L.cut ? "; " + L.cut + " cut" : "") + ")"]
          ]);
      },
      controls: function (tile) {
        return [
          { type: "swatches", key: "color", label: "Colour (each shown as Dash and Dot)", items: tile.colors,
            swatch: function (cv, c) { TV.drawDecorSwatch(cv, tile, c); } },
          { type: "seg", key: "pattern", label: "Pattern", items: PATTERNS },
          { type: "toggle", key: "swap", label: "Swap dash and dot",
            show: function (st) { return st.pattern !== "dash" && st.pattern !== "dot"; } },
          { type: "numbers", label: "Surface size", fields: [
            { key: "w", label: "Width", min: 15, max: 600, unit: "cm" },
            { key: "h", label: "Height", min: 15, max: 300, unit: "cm" }
          ] }
        ];
      },
      draw: function (cv, tile, st) { TV.drawDecor(cv, tile, st); },
      aspect: function (st) { return st.w / st.h; }
    }
  };
})();

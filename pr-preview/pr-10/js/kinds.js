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
 * Control specs (any can add `place: "area"` to sit with the preview instead of with the tile options):
 *   { type: "swatches", key, label, items, multi?, selectAll?, one?, grouped?, swatch?(canvas, item, st) }
 *                       grouped: items with a `group` get a heading per group
 *   { type: "seg",      key, label, items: [{ id, name }], show?(st) }
 *   { type: "toggle",   key, label, show?(st) }
 *   { type: "range",    key, label, min, max, step, unit }
 *   { type: "action",   label, run(st), show?(st) }         a button that changes the options
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
  var MIXES = [{ id: "random", name: "Random" }, { id: "columns", name: "By strip" }, { id: "rows", name: "By row" }, { id: "alt", name: "Alternate" }];
  /* How several decors are set out over a decor surface. */
  var PATTERNS = [
    { id: "random", name: "Random" },
    { id: "alt", name: "Alternate" },
    { id: "split-h", name: "Top / bottom" },
    { id: "split-v", name: "Left / right" },
    { id: "rows", name: "By row" },
    { id: "columns", name: "By column" }
  ];
  /* Square tiles whose decor isn't symmetric can be turned; a tile can opt out with `turn: false`. */
  function turnable(tile) { return tile.size.w === tile.size.l && tile.turn !== false; }
  var TURNS = [{ id: "none", name: "Same way" }, { id: "alt", name: "Alternate" }, { id: "random", name: "Random" }];

  /* A decor tile's variations: every colour with every design, plus designs with a colour of
     their own (Dintorni's solids, Tape's bases), each once. Each variation is one tile you can
     order, and the unit an area picks. Grouped by colour for display. */
  TV.decorVariants = function (tile) {
    if (tile._variants) return tile._variants;
    var out = [];
    tile.colors.forEach(function (c) {
      tile.decors.forEach(function (d) {
        if (d.color) return;
        out.push({ id: c.id + "-" + d.id, name: c.name + " " + d.name, group: c.name, col: c, decor: d });
      });
    });
    tile.decors.forEach(function (d) {
      if (d.color) out.push({ id: d.id, name: d.name, group: d.group || "Solids", col: { base: d.color }, decor: d });
    });
    Object.defineProperty(tile, "_variants", { value: out });
    return out;
  };
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
          { type: "range", key: "wall", label: "Wall width shown", min: wallRange(tile).min, max: wallRange(tile).max, step: 5, unit: "cm", place: "area" }
        ];
      },
      draw: function (cv, tile, st) { TV.drawStrip(cv, tile, st); }
    },

    /* Tiles that come in several designs as well as colours (Homage, Betty, Fringe, Tape, Dintorni).
       An area picks any number of variations (one colour in one design each) and how to mix them.
       Designs are drawn by js/painters.js. */
    decor: {
      base: { variants: [], pattern: "random", turn: "none", w: 240, h: 60 },
      normalize: function (tile, st) {
        var all = TV.decorVariants(tile);
        function valid(ids) {
          return (ids || []).filter(function (id, i, a) { return a.indexOf(id) === i && byId(all, id); });
        }
        st.variants = valid(st.variants);
        if (!st.variants.length) st.variants = valid(tile.defaults && tile.defaults.variants);
        if (!st.variants.length) st.variants = [all[0].id];
        if (!byId(PATTERNS, st.pattern)) st.pattern = "random";
        if (!byId(TURNS, st.turn) || !turnable(tile)) st.turn = "none";
        if (!inRange(st.w, 15, 600)) st.w = 240;
        if (!inRange(st.h, 15, 300)) st.h = 60;
      },
      serialize: function (st) {
        return [["v", st.variants.join(",")], ["p", st.pattern], ["r", st.turn], ["w", st.w], ["h", st.h]];
      },
      parse: function (p, tile, st) {
        if (p.v) st.variants = p.v.split(",");
        if (p.p) st.pattern = p.p;
        // Older Homage links: c is the colour, p either one design or how to set out dash and dot.
        if (!p.v && p.c) {
          if (p.p === "dash" || p.p === "dot") st.variants = [p.c + "-" + p.p];
          else if (/^(split-h|split-v|alt)$/.test(p.p || "")) {
            st.variants = p.s === "1" ? [p.c + "-dot", p.c + "-dash"] : [p.c + "-dash", p.c + "-dot"];
          }
        }
        if (p.r) st.turn = p.r;
        var w = parseFloat(p.w), h = parseFloat(p.h);
        if (inRange(w, 15, 600)) st.w = Math.round(w);
        if (inRange(h, 15, 300)) st.h = Math.round(h);
      },
      facts: function (tile, st) {
        var L = TV.decorLayout(tile, st), all = TV.decorVariants(tile);
        var names = st.variants.map(function (id) { return byId(all, id).name; });
        var text = names.join(" + ");
        if (names.length > 1) text += ", " + byId(PATTERNS, st.pattern).name.toLowerCase();
        var f = [[names.length > 1 ? "Variations" : "Variation", text]];
        if (st.turn !== "none") f.push(["Rotation", byId(TURNS, st.turn).name.toLowerCase()]);
        var mix = names.length > 1 ? st.variants.map(function (id) { return L.counts[id] + " " + byId(all, id).name; }) : [];
        var count = L.total + (mix.length || L.cut ? " (" + mix.join(", ") + (L.cut ? (mix.length ? "; " : "") + L.cut + " cut" : "") + ")" : "");
        return f.concat(groutFacts(tile, st)).concat([["Area", st.w + " × " + st.h + " cm"], ["Tiles", count]]);
      },
      controls: function (tile) {
        var c = [
          { type: "swatches", key: "variants", label: "Variations (pick one or mix several)", items: TV.decorVariants(tile),
            multi: true, one: true, grouped: true,
            swatch: function (cv, v, st) { TV.drawDecorSwatch(cv, tile, [v], st.grout); } },
          { type: "seg", key: "pattern", label: "How to mix them", items: PATTERNS, show: function (st) { return st.variants.length > 1; } },
          { type: "action", label: "Reverse order", run: function (st) { st.variants.reverse(); },
            show: function (st) { return st.variants.length > 1 && st.pattern !== "random"; } }
        ];
        if (turnable(tile)) c.push({ type: "seg", key: "turn", label: "Rotation", items: TURNS });
        c.push({ type: "numbers", label: "Area size", place: "area", fields: [
          { key: "w", label: "Width", min: 15, max: 600, unit: "cm" },
          { key: "h", label: "Height", min: 15, max: 300, unit: "cm" }
        ] });
        return c;
      },
      draw: function (cv, tile, st) { TV.drawDecor(cv, tile, st); },
      aspect: function (st) { return st.w / st.h; }
    }
  };
})();

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
 *   { type: "swatches", key, label, items, multi?, selectAll?, one?, swatch?(canvas, item, st) }
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
  var ORIENTS = [{ id: "v", name: "Vertical" }, { id: "h", name: "Horizontal" }];
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

    /* One colour per area; each tile is one of the tile's decors (Dash/Dot, Grid S/L, Plus/T…),
       set out over a surface of a given size. Decors are drawn by js/painters.js. */
    decor: {
      base: { color: null, decors: [], pattern: "random", turn: "none", orient: "v", w: 240, h: 60 },
      normalize: function (tile, st) {
        var dflt = tile.defaults || {};
        if (!byId(tile.colors, st.color)) st.color = byId(tile.colors, dflt.color) ? dflt.color : tile.colors[0].id;
        function valid(ids) {
          return (ids || []).filter(function (id, i, a) { return a.indexOf(id) === i && byId(tile.decors, id); });
        }
        st.decors = valid(st.decors);
        if (!st.decors.length) st.decors = valid(dflt.decors);
        if (!st.decors.length) st.decors = [tile.decors[0].id];
        if (!byId(PATTERNS, st.pattern)) st.pattern = "random";
        if (!byId(TURNS, st.turn) || !turnable(tile)) st.turn = "none";
        if (!byId(ORIENTS, st.orient)) st.orient = "v";
        if (!inRange(st.w, 15, 600)) st.w = 240;
        if (!inRange(st.h, 15, 300)) st.h = 60;
      },
      serialize: function (st) {
        return [["c", st.color], ["d", st.decors.join(",")], ["p", st.pattern], ["r", st.turn], ["o", st.orient], ["w", st.w], ["h", st.h]];
      },
      parse: function (p, tile, st) {
        if (p.c) st.color = p.c;
        if (p.d) st.decors = p.d.split(",");
        if (p.p) st.pattern = p.p;
        // Links from before decors were general: p was all-dash, all-dot, or how to set out dash and dot.
        if (!p.d && p.p && byId(tile.decors, p.p)) st.decors = [p.p];
        if (!p.d && /^(split-h|split-v|alt)$/.test(p.p || "") && byId(tile.decors, "dash") && byId(tile.decors, "dot")) {
          st.decors = p.s === "1" ? ["dot", "dash"] : ["dash", "dot"];
        }
        if (p.r) st.turn = p.r;
        if (p.o) st.orient = p.o;
        var w = parseFloat(p.w), h = parseFloat(p.h);
        if (inRange(w, 15, 600)) st.w = Math.round(w);
        if (inRange(h, 15, 300)) st.h = Math.round(h);
      },
      facts: function (tile, st) {
        var L = TV.decorLayout(tile, st);
        var names = st.decors.map(function (id) { return byId(tile.decors, id).name; });
        var decorText = names.join(" + ");
        if (names.length > 1) decorText += ", " + byId(PATTERNS, st.pattern).name.toLowerCase();
        var f = [["Colour", byId(tile.colors, st.color).name], [tile.decorLabel || "Decor", decorText]];
        if (st.turn !== "none") f.push(["Turn", byId(TURNS, st.turn).name.toLowerCase()]);
        if (tile.size.w !== tile.size.l) f.push(["Direction", byId(ORIENTS, st.orient).name.toLowerCase()]);
        var mix = names.length > 1 ? st.decors.map(function (id) { return L.counts[id] + " " + byId(tile.decors, id).name; }) : [];
        var count = L.total + (mix.length || L.cut ? " (" + mix.join(", ") + (L.cut ? (mix.length ? "; " : "") + L.cut + " cut" : "") + ")" : "");
        return f.concat(groutFacts(tile, st)).concat([["Surface", st.w + " × " + st.h + " cm"], ["Tiles", count]]);
      },
      controls: function (tile) {
        var many = tile.decors.length > 1;
        var c = [
          { type: "swatches", key: "color", label: "Colour", items: tile.colors,
            swatch: function (cv, col, st) { TV.drawDecorSwatch(cv, tile, col, null, st.grout); } }
        ];
        if (many) {
          c.push({ type: "swatches", key: "decors", label: (tile.decorLabel || "Decor") + " (pick one or mix several)", items: tile.decors,
            multi: true, one: true, swatch: function (cv, d, st) {
              TV.drawDecorSwatch(cv, tile, byId(tile.colors, st.color), [d.id], st.grout);
            } });
          c.push({ type: "seg", key: "pattern", label: "Pattern", items: PATTERNS, show: function (st) { return st.decors.length > 1; } });
          c.push({ type: "action", label: "Reverse order", run: function (st) { st.decors.reverse(); },
            show: function (st) { return st.decors.length > 1 && st.pattern !== "random"; } });
        }
        if (turnable(tile)) c.push({ type: "seg", key: "turn", label: "Turn tiles", items: TURNS });
        if (tile.size.w !== tile.size.l) c.push({ type: "seg", key: "orient", label: "Direction", items: ORIENTS });
        c.push({ type: "numbers", label: "Surface size", fields: [
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

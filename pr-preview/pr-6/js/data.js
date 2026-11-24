/*
 * The tile library and grout palette. Adding a tile here is all it takes for it
 * to show up in the "Select a tile" picker; no other file needs to change as long
 * as it uses an existing `kind`.
 *
 * GROUTS  the shared grout palette every area can pick from (plus a custom colour).
 * TILES   the tile library, keyed by id. The id is used in share links, so don't rename it.
 *
 * Tile fields
 *   kind      how the tile is drawn and which controls it gets (see js/kinds.js):
 *               "mix"   one or more colours mixed across the surface, any outline from js/shapes.js
 *               "decor" one colour per tile, each made in two decors (Dash / Dot) set out in a pattern
 *   brand, name, credit, material, note   shown with the tile
 *   size      { w, l } in centimetres
 *   colors    the colours it comes in; fields depend on the kind
 *   defaults  optional: starting options when an area picks this tile (grout, joint and kind options)
 *   grouts    optional: grout colours suggested for this tile, [{ name, c }]. They are shown
 *             above the shared palette; the area can still pick any colour.
 *   mix only: shape { type, ... } and layouts ["straight", "drop"]
 *   decor only: border (edge band width as a fraction of the tile)
 */
(function () {
  var TV = (window.TileViz = window.TileViz || {});

  TV.GROUTS = [
    { name: "Bianco", c: "#f2efe9" },
    { name: "Avorio", c: "#e6dcc8" },
    { name: "Sabbia", c: "#cdbfa6" },
    { name: "Grigio chiaro", c: "#bfbcb6" },
    { name: "Grigio", c: "#8c8a86" },
    { name: "Antracite", c: "#3d3d3f" },
    { name: "Nero", c: "#17171a" },
    { name: "Terracotta", c: "#a65a46" },
    { name: "Cioccolato", c: "#4a3228" },
    { name: "Salvia", c: "#9aa58a" },
    { name: "Blu notte", c: "#2b3a4d" },
    { name: "Verde bosco", c: "#2f3f36" }
  ];

  TV.TILES = {
    "mutina-bottone-l": {
      kind: "mix",
      brand: "Mutina",
      name: "Bottone L",
      credit: "Ronan Bouroullec, 2024",
      material: "Unglazed porcelain stoneware, 10 mm",
      size: { w: 7.5, l: 32.1 },
      shape: { type: "notched-strip", notchRadius: 0.75, notches: 4 },
      layouts: ["straight", "drop"],
      colors: [
        { id: "sabbia", name: "Sabbia", color: "#d6b57f" },
        { id: "verde", name: "Verde", color: "#5f6b55" },
        { id: "rosso", name: "Rosso", color: "#b05a4a" },
        { id: "grigio", name: "Grigio", color: "#706d69" },
        { id: "blu", name: "Blu", color: "#8fa1b1" }
      ],
      defaults: { tiles: ["rosso"], grout: "#cdbfa6", joint: 3 },
      note: "Bottone L, nominal 7.5 × 32.1 cm, 10 mm thick."
    },

    /*
     * Homage to the Square: 15 × 15 cm. Every colour has two decors:
     *   Dash: glossy centre square ("main"), matte edge bars ("bar"), glossy corner squares ("accent").
     *   Dot:  matte field ("main") with glossy corner squares ("accent").
     * `photographed` notes which decor the colours were sampled from on mutina.it;
     * the other decor's tones are estimated.
     */
    "mutina-homage-to-the-square": {
      kind: "decor",
      brand: "Mutina",
      name: "Homage to the Square",
      credit: "Josef & Anni Albers Foundation",
      material: "Glazed, unrectified porcelain stoneware, 9 mm",
      size: { w: 15, l: 15 },
      border: 0.123,
      colors: [
        { id: "sea", name: "Sea", main: "#4d768d", bar: "#275569", accent: "#023546", photographed: "dot" },
        { id: "evergreen", name: "Evergreen", main: "#3a5351", bar: "#397370", accent: "#12100f", photographed: "dash" },
        { id: "chocolate", name: "Chocolate", main: "#3e1c13", bar: "#8b4838", accent: "#2b130d", photographed: "dash" },
        { id: "ice", name: "Ice", main: "#f8f2eb", bar: "#f5ebdd", accent: "#d6bd85", photographed: "dash" },
        { id: "citron", name: "Citron", main: "#ede0bb", bar: "#e9d481", accent: "#e5c948", photographed: "dot" },
        { id: "sage", name: "Sage", main: "#caceb4", bar: "#e3dec0", accent: "#c6b77d", photographed: "dash" },
        { id: "peach", name: "Peach", main: "#ef8b72", bar: "#eca492", accent: "#e9bdb3", photographed: "dot" }
      ],
      defaults: { color: "sea", pattern: "dash", grout: "#f2efe9", joint: 2, w: 240, h: 60 },
      note: "Homage to the Square, 15 × 15 cm, 9 mm. Mutina's site photographs one decor per colour; the other decor's tones are estimated."
    },

    /*
     * A plain, unbranded rectangle. It exists to show that a new tile needs only an
     * entry here: it reuses the "mix" kind with the plain "rect" outline.
     */
    "plain-rectangle-7x15": {
      kind: "mix",
      brand: "Generic",
      name: "Plain rectangle",
      material: "Glazed ceramic",
      size: { w: 7.5, l: 15 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "white", name: "White", color: "#eeece6" },
        { id: "cream", name: "Cream", color: "#e4d6b8" },
        { id: "olive", name: "Olive", color: "#7c7d52" },
        { id: "cobalt", name: "Cobalt", color: "#2f4f8a" },
        { id: "black", name: "Black", color: "#26262a" }
      ],
      defaults: { tiles: ["white"], grout: "#bfbcb6", joint: 2, angle: 90, wall: 80 },
      grouts: [
        { name: "Light grey", c: "#bfbcb6" },
        { name: "White", c: "#f2efe9" },
        { name: "Charcoal", c: "#3d3d3f" }
      ],
      note: "A generic 7.5 × 15 cm glazed tile, for comparing against the specific products."
    }
  };
})();

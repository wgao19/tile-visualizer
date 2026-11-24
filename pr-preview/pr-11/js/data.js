/*
 * The grout palette and the tile library. Brand tiles live in js/tiles/<brand>.js and
 * add themselves to TILES; generic tiles are here. Adding a tile is all it takes for it
 * to show up in the "Select a tile" picker, as long as it uses an existing `kind`.
 *
 * GROUTS  the shared grout palette every area can pick from (plus a custom colour).
 * TILES   the tile library, keyed by id. The id is used in share links, so don't rename it.
 *
 * A tile is one size of one product. Colours, finishes or decors of the same size that are
 * meant to be mixed on one surface share an entry; other sizes are separate tiles.
 *
 * Tile fields
 *   kind      how the tile is drawn and which controls it gets (see js/kinds.js):
 *               "mix"   one or more colours mixed across the surface, any outline from js/shapes.js
 *               "decor" one colour per tile, each made in two decors (Dash / Dot) set out in a pattern
 *   brand, name, credit, material, note   shown with the tile
 *   url       optional: the product or collection page; linked from the picker and the area page
 *   collection  optional: the brand's name for the product family. A label only: it is
 *             shown, searched and used to sort tiles within a brand, nothing more.
 *   size      { w, l } in centimetres
 *   colors    the colours it comes in; fields depend on the kind
 *   defaults  optional: starting options when an area picks this tile (grout, joint and kind options)
 *   grouts    optional: grout colours suggested for this tile, [{ name, c }]. They are shown
 *             above the shared palette; the area can still pick any colour.
 *   mix only: shape { type, ... } and layouts (any of "straight", "drop", "herringbone",
 *             "chevron"; chevron tiles also give `chevronAngle`, degrees, default 45). A colour may list
 *             `tones: [{ c, w }]` (colour, weight) when the product varies tile by tile;
 *             each tile then gets one tone, picked in proportion to the weights.
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
      layouts: ["straight", "drop", "herringbone"],
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

/*
 * Catalogue data for the tile visualizer.
 *
 * PRODUCTS  tiles you can pick from. `kind` decides which controls a place gets:
 *   - "strip": multi-colour strips/rectangles (e.g. Bottone). Shapes in js/shapes.js.
 *   - "decor": square tiles where each colour comes in two decors (Dash / Dot).
 * PLACES    each room/surface, the product it uses, and its starting choices.
 *           These defaults are what the overview shows until someone changes them.
 *
 * Dimensions are in centimetres.
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

  TV.PRODUCTS = {
    "mutina-bottone-l": {
      kind: "strip",
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
      note: "Bottone L, nominal 7.5 × 32.1 cm, 10 mm thick."
    },

    /*
     * Homage to the Square: 15 × 15 cm. Every colour has two decors:
     *   Dash: glossy centre square ("main"), matte edge bars ("bar"), glossy corner squares ("accent").
     *   Dot:  matte field ("main") with glossy corner squares ("accent").
     * `border` is the width of the edge band / corner squares as a fraction of the tile.
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
      note: "Homage to the Square, 15 × 15 cm, 9 mm. Mutina's site photographs one decor per colour; the other decor's tones are estimated."
    }
  };

  TV.PLACES = [
    {
      id: "foyer",
      name: "Foyer",
      product: "mutina-bottone-l",
      defaults: { tiles: ["rosso"], mix: "random", grout: "#cdbfa6", layout: "straight", angle: 0, joint: 3, wall: 90 }
    },
    {
      id: "kitchen-backsplash",
      name: "Kitchen backsplash",
      product: "mutina-homage-to-the-square",
      defaults: { color: "sea", pattern: "dash", swap: false, grout: "#f2efe9", joint: 2, w: 240, h: 60 }
    },
    {
      id: "island-front",
      name: "Island front",
      product: "mutina-homage-to-the-square",
      defaults: { color: "sea", pattern: "alt", swap: false, grout: "#f2efe9", joint: 2, w: 200, h: 90 }
    }
  ];
})();

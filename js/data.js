/*
 * Catalogue data for the tile visualizer.
 *
 * To add a new tile: add an entry to PRODUCTS.
 * To add a new room / option: add an entry to SELECTIONS pointing at a product.
 *
 * Dimensions are in centimetres. Tiles are described standing upright
 * (width across, length down); the "Direction" control rotates them.
 *
 * Supported shape types (see js/shapes.js):
 *   - "rect"          plain rectangle / square
 *   - "notched-strip" strip with semicircular notches along both long edges
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
    }
  };

  TV.SELECTIONS = [
    {
      id: "foyer",
      name: "Foyer",
      product: "mutina-bottone-l",
      defaults: {
        tiles: ["rosso"],
        mix: "random",
        grout: "#cdbfa6",
        groutName: "Sabbia",
        layout: "straight",
        angle: 0,
        joint: 3,
        wall: 90
      }
    }
  ];
})();

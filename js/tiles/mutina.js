/*
 * Mutina tiles (mutina.it). One entry per tile size; tiles of the same size that are
 * meant to be mixed (colours, finishes, tones) share an entry.
 *
 * Colours are sampled from the product photos on mutina.it (the median of the tile face,
 * or for colours with `tones`, the main colour clusters and their share), so they are
 * only as accurate as those photos. Check physical samples before ordering.
 */
(function () {
  var TV = (window.TileViz = window.TileViz || {});
  TV.TILES = TV.TILES || {};

  var tiles = {
    "mutina-bottone-l": {
      kind: "mix",
      brand: "Mutina",
      collection: "Osso & Bottone",
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

    "mutina-bottone-s": {
      kind: "mix",
      brand: "Mutina",
      collection: "Osso & Bottone",
      name: "Bottone S",
      credit: "Ronan Bouroullec, 2024",
      material: "Unglazed full-body porcelain stoneware, 10 mm",
      size: { w: 3, l: 27.5 },
      shape: { type: "notched-strip", notchRadius: 0.35, notches: 5 },
      layouts: ["straight", "drop"],
      colors: [
        { id: "sabbia", name: "Sabbia", color: "#d8c4ab" },
        { id: "rosso", name: "Rosso", color: "#b37c6f" },
        { id: "grigio", name: "Grigio", color: "#98938e" },
        { id: "verde", name: "Verde", color: "#939482" },
        { id: "blu", name: "Blu", color: "#9da9ad" }
      ],
      defaults: { tiles: ["sabbia"], grout: "#cdbfa6", joint: 4, wall: 80 },
      note: "Bottone S, nominal 3 × 27.5 cm. The cut-outs form circles where two pieces meet with a 4 mm joint."
    },

    /*
     * Homage to the Square: 15 × 15 cm. Every colour has two decors:
     *   Dash: glossy centre square ("main"), matte edge bars ("bar"), glossy corner squares ("accent").
     *   Dot: matte field ("main") with glossy corner squares ("accent").
     * `photographed` notes which decor the colours were sampled from on mutina.it;
     * the other decor's tones are estimated.
     */
    "mutina-homage-to-the-square": {
      kind: "decor",
      brand: "Mutina",
      collection: "Homage to the Square",
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

    "mutina-din-3-6x7-4": {
      kind: "mix",
      brand: "Mutina",
      collection: "DIN",
      name: "DIN 3.6 × 7.4",
      credit: "Konstantin Grcic",
      material: "Glazed pressed body, matt or glossy, 9 mm",
      size: { w: 3.6, l: 7.4 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "white-matt", name: "White matt", color: "#f5f2ea" },
        { id: "black-matt", name: "Black matt", color: "#282a29" },
        { id: "light-blue-matt", name: "Light Blue matt", color: "#9dada7" },
        { id: "dark-blue-matt", name: "Dark Blue matt", color: "#40414d" },
        { id: "light-green-matt", name: "Light Green matt", color: "#9aa78d" },
        { id: "dark-green-matt", name: "Dark Green matt", color: "#516d4f" },
        { id: "rose-matt", name: "Rose matt", color: "#e8bfa6" },
        { id: "red-matt", name: "Red matt", color: "#a05e4f" },
        { id: "white-glossy", name: "White glossy", color: "#f2efe6" },
        { id: "black-glossy", name: "Black glossy", color: "#161616" },
        { id: "light-blue-glossy", name: "Light Blue glossy", color: "#9daea8" },
        { id: "dark-blue-glossy", name: "Dark Blue glossy", color: "#1f2638" },
        { id: "light-green-glossy", name: "Light Green glossy", color: "#96a489" },
        { id: "dark-green-glossy", name: "Dark Green glossy", color: "#2f5426" },
        { id: "rose-glossy", name: "Rose glossy", color: "#e3b59b" },
        { id: "red-glossy", name: "Red glossy", color: "#8e2a20" }
      ],
      defaults: { tiles: ["white-matt"], grout: "#f2efe9", joint: 2, wall: 50, angle: 90 },
      note: "DIN, nominal 3.6 × 7.4 cm. The four DIN sizes share one grid with a 2 mm joint. Glossy colours are estimated: Mutina's photos of them are mostly reflection."
    },

    "mutina-din-7-4x7-4": {
      kind: "mix",
      brand: "Mutina",
      collection: "DIN",
      name: "DIN 7.4 × 7.4",
      credit: "Konstantin Grcic",
      material: "Glazed pressed body, matt or glossy, 9 mm",
      size: { w: 7.4, l: 7.4 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "white-matt", name: "White matt", color: "#f5f2ea" },
        { id: "black-matt", name: "Black matt", color: "#282a29" },
        { id: "light-blue-matt", name: "Light Blue matt", color: "#9dada7" },
        { id: "dark-blue-matt", name: "Dark Blue matt", color: "#40414d" },
        { id: "light-green-matt", name: "Light Green matt", color: "#9aa78d" },
        { id: "dark-green-matt", name: "Dark Green matt", color: "#516d4f" },
        { id: "rose-matt", name: "Rose matt", color: "#e8bfa6" },
        { id: "red-matt", name: "Red matt", color: "#a05e4f" },
        { id: "white-glossy", name: "White glossy", color: "#f2efe6" },
        { id: "black-glossy", name: "Black glossy", color: "#161616" },
        { id: "light-blue-glossy", name: "Light Blue glossy", color: "#9daea8" },
        { id: "dark-blue-glossy", name: "Dark Blue glossy", color: "#1f2638" },
        { id: "light-green-glossy", name: "Light Green glossy", color: "#96a489" },
        { id: "dark-green-glossy", name: "Dark Green glossy", color: "#2f5426" },
        { id: "rose-glossy", name: "Rose glossy", color: "#e3b59b" },
        { id: "red-glossy", name: "Red glossy", color: "#8e2a20" }
      ],
      defaults: { tiles: ["white-matt"], grout: "#f2efe9", joint: 2, wall: 60, angle: 0 },
      note: "DIN, nominal 7.4 × 7.4 cm. The four DIN sizes share one grid with a 2 mm joint. Glossy colours are estimated: Mutina's photos of them are mostly reflection."
    },

    "mutina-din-7-4x15": {
      kind: "mix",
      brand: "Mutina",
      collection: "DIN",
      name: "DIN 7.4 × 15",
      credit: "Konstantin Grcic",
      material: "Glazed pressed body, matt or glossy, 9 mm",
      size: { w: 7.4, l: 15 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "white-matt", name: "White matt", color: "#f5f2ea" },
        { id: "black-matt", name: "Black matt", color: "#282a29" },
        { id: "light-blue-matt", name: "Light Blue matt", color: "#9dada7" },
        { id: "dark-blue-matt", name: "Dark Blue matt", color: "#40414d" },
        { id: "light-green-matt", name: "Light Green matt", color: "#9aa78d" },
        { id: "dark-green-matt", name: "Dark Green matt", color: "#516d4f" },
        { id: "rose-matt", name: "Rose matt", color: "#e8bfa6" },
        { id: "red-matt", name: "Red matt", color: "#a05e4f" },
        { id: "white-glossy", name: "White glossy", color: "#f2efe6" },
        { id: "black-glossy", name: "Black glossy", color: "#161616" },
        { id: "light-blue-glossy", name: "Light Blue glossy", color: "#9daea8" },
        { id: "dark-blue-glossy", name: "Dark Blue glossy", color: "#1f2638" },
        { id: "light-green-glossy", name: "Light Green glossy", color: "#96a489" },
        { id: "dark-green-glossy", name: "Dark Green glossy", color: "#2f5426" },
        { id: "rose-glossy", name: "Rose glossy", color: "#e3b59b" },
        { id: "red-glossy", name: "Red glossy", color: "#8e2a20" }
      ],
      defaults: { tiles: ["white-matt"], grout: "#f2efe9", joint: 2, wall: 90, angle: 90 },
      note: "DIN, nominal 7.4 × 15 cm. The four DIN sizes share one grid with a 2 mm joint. Glossy colours are estimated: Mutina's photos of them are mostly reflection."
    },

    "mutina-din-15x15": {
      kind: "mix",
      brand: "Mutina",
      collection: "DIN",
      name: "DIN 15 × 15",
      credit: "Konstantin Grcic",
      material: "Glazed pressed body, matt or glossy, 9 mm",
      size: { w: 15, l: 15 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "white-matt", name: "White matt", color: "#f5f2ea" },
        { id: "black-matt", name: "Black matt", color: "#282a29" },
        { id: "light-blue-matt", name: "Light Blue matt", color: "#9dada7" },
        { id: "dark-blue-matt", name: "Dark Blue matt", color: "#40414d" },
        { id: "light-green-matt", name: "Light Green matt", color: "#9aa78d" },
        { id: "dark-green-matt", name: "Dark Green matt", color: "#516d4f" },
        { id: "rose-matt", name: "Rose matt", color: "#e8bfa6" },
        { id: "red-matt", name: "Red matt", color: "#a05e4f" },
        { id: "white-glossy", name: "White glossy", color: "#f2efe6" },
        { id: "black-glossy", name: "Black glossy", color: "#161616" },
        { id: "light-blue-glossy", name: "Light Blue glossy", color: "#9daea8" },
        { id: "dark-blue-glossy", name: "Dark Blue glossy", color: "#1f2638" },
        { id: "light-green-glossy", name: "Light Green glossy", color: "#96a489" },
        { id: "dark-green-glossy", name: "Dark Green glossy", color: "#2f5426" },
        { id: "rose-glossy", name: "Rose glossy", color: "#e3b59b" },
        { id: "red-glossy", name: "Red glossy", color: "#8e2a20" }
      ],
      defaults: { tiles: ["white-matt"], grout: "#f2efe9", joint: 2, wall: 120, angle: 0 },
      note: "DIN, nominal 15 × 15 cm. The four DIN sizes share one grid with a 2 mm joint. Glossy colours are estimated: Mutina's photos of them are mostly reflection."
    },

    "mutina-diarama": {
      kind: "mix",
      brand: "Mutina",
      collection: "Diarama",
      name: "Diarama",
      credit: "Hella Jongerius",
      material: "Glazed homogeneous porcelain stoneware, 9 mm",
      size: { w: 9.4, l: 18.7 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "ash-dark", name: "Ash Dark", color: "#616668", tones: [{ c: "#616668", w: 26 }, { c: "#3e3f41", w: 25 }, { c: "#494c4e", w: 25 }, { c: "#5b5c61", w: 12 }, { c: "#757b7d", w: 9 }] },
        { id: "blush-dark", name: "Blush Dark", color: "#857d74", tones: [{ c: "#857d74", w: 31 }, { c: "#594d48", w: 17 }, { c: "#563627", w: 17 }, { c: "#463c34", w: 15 }, { c: "#5d5b61", w: 15 }] },
        { id: "chalk", name: "Chalk", color: "#d9dade", tones: [{ c: "#d9dade", w: 54 }, { c: "#c4c6cc", w: 30 }, { c: "#a3a7ad", w: 8 }] },
        { id: "iron", name: "Iron", color: "#2d302f", tones: [{ c: "#2d302f", w: 31 }, { c: "#212520", w: 25 }, { c: "#101a1b", w: 16 }, { c: "#c7c4c5", w: 16 }, { c: "#69686c", w: 7 }] },
        { id: "maize-dark", name: "Maize Dark", color: "#564c35", tones: [{ c: "#564c35", w: 28 }, { c: "#8a8164", w: 24 }, { c: "#62563c", w: 22 }, { c: "#9f9fa3", w: 10 }, { c: "#6f6c72", w: 10 }, { c: "#5c565a", w: 6 }] }
      ],
      defaults: { tiles: ["ash-dark"], grout: "#bfbcb6", joint: 2, wall: 120, angle: 90, layout: "drop" },
      note: "Diarama, nominal 9.4 × 18.7 cm. Each colour is a set of tones mixed tile by tile; the tones are sampled from Mutina's product photos."
    },

    "mutina-kosei-15x15": {
      kind: "mix",
      brand: "Mutina",
      collection: "Kosei",
      name: "Kosei 15 × 15",
      credit: "Vincent Van Duysen",
      material: "Extruded unglazed porcelain stoneware, 10 mm",
      size: { w: 15, l: 15 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bone", name: "Bone", color: "#e9dcc5" },
        { id: "storm", name: "Storm", color: "#afab9f" },
        { id: "terra", name: "Terra", color: "#684d44" },
        { id: "dark-grey", name: "Dark Grey", color: "#3e3e40" },
        { id: "grey-green", name: "Grey Green", color: "#555652" }
      ],
      defaults: { tiles: ["bone"], grout: "#cdbfa6", joint: 2, wall: 120, angle: 0 },
      note: "Kosei, nominal 15 × 15 cm."
    },

    "mutina-kosei-15x30": {
      kind: "mix",
      brand: "Mutina",
      collection: "Kosei",
      name: "Kosei 15 × 30",
      credit: "Vincent Van Duysen",
      material: "Extruded unglazed porcelain stoneware, 10 mm",
      size: { w: 15, l: 30 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bone", name: "Bone", color: "#e9dcc5" },
        { id: "storm", name: "Storm", color: "#afab9f" },
        { id: "terra", name: "Terra", color: "#684d44" },
        { id: "dark-grey", name: "Dark Grey", color: "#3e3e40" },
        { id: "grey-green", name: "Grey Green", color: "#555652" }
      ],
      defaults: { tiles: ["bone"], grout: "#cdbfa6", joint: 2, wall: 150, angle: 90 },
      note: "Kosei, nominal 15 × 30 cm."
    },

    "mutina-kosei-15x60": {
      kind: "mix",
      brand: "Mutina",
      collection: "Kosei",
      name: "Kosei 15 × 60",
      credit: "Vincent Van Duysen",
      material: "Extruded unglazed porcelain stoneware, 10 mm",
      size: { w: 15, l: 60 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bone", name: "Bone", color: "#e9dcc5" },
        { id: "storm", name: "Storm", color: "#afab9f" },
        { id: "terra", name: "Terra", color: "#684d44" },
        { id: "dark-grey", name: "Dark Grey", color: "#3e3e40" },
        { id: "grey-green", name: "Grey Green", color: "#555652" }
      ],
      defaults: { tiles: ["bone"], grout: "#cdbfa6", joint: 2, wall: 240, angle: 90 },
      note: "Kosei, nominal 15 × 60 cm."
    },

    "mutina-kosei-15x90": {
      kind: "mix",
      brand: "Mutina",
      collection: "Kosei",
      name: "Kosei 15 × 90",
      credit: "Vincent Van Duysen",
      material: "Extruded unglazed porcelain stoneware, 10 mm",
      size: { w: 15, l: 90 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bone", name: "Bone", color: "#e9dcc5" },
        { id: "storm", name: "Storm", color: "#afab9f" },
        { id: "terra", name: "Terra", color: "#684d44" },
        { id: "dark-grey", name: "Dark Grey", color: "#3e3e40" },
        { id: "grey-green", name: "Grey Green", color: "#555652" }
      ],
      defaults: { tiles: ["bone"], grout: "#cdbfa6", joint: 2, wall: 300, angle: 90 },
      note: "Kosei, nominal 15 × 90 cm."
    },

    "mutina-kosei-60x60": {
      kind: "mix",
      brand: "Mutina",
      collection: "Kosei",
      name: "Kosei 60 × 60",
      credit: "Vincent Van Duysen",
      material: "Extruded unglazed porcelain stoneware, 10 mm",
      size: { w: 60, l: 60 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bone", name: "Bone", color: "#e9dcc5" },
        { id: "storm", name: "Storm", color: "#afab9f" },
        { id: "terra", name: "Terra", color: "#684d44" },
        { id: "dark-grey", name: "Dark Grey", color: "#3e3e40" },
        { id: "grey-green", name: "Grey Green", color: "#555652" }
      ],
      defaults: { tiles: ["bone"], grout: "#cdbfa6", joint: 2, wall: 300, angle: 0 },
      note: "Kosei, nominal 60 × 60 cm."
    },

    "mutina-mews-5-5x45": {
      kind: "mix",
      brand: "Mutina",
      collection: "Mews",
      name: "Mews strip 5.5 × 45",
      credit: "Barber & Osgerby",
      material: "Homogeneous porcelain stoneware, 9 mm",
      size: { w: 5.5, l: 45 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "chalk", name: "Chalk", color: "#e4dfd6", tones: [{ c: "#e4dfd6", w: 44 }, { c: "#e7e2d9", w: 26 }, { c: "#e2ddd3", w: 25 }] },
        { id: "fog", name: "Fog", color: "#d6cdc1", tones: [{ c: "#d6cdc1", w: 38 }, { c: "#d0c6b8", w: 34 }, { c: "#d9d0c5", w: 26 }] },
        { id: "ink", name: "Ink", color: "#2c323e", tones: [{ c: "#2c323e", w: 51 }, { c: "#282e3a", w: 23 }, { c: "#323641", w: 23 }] },
        { id: "lead", name: "Lead", color: "#626061", tones: [{ c: "#626061", w: 40 }, { c: "#676466", w: 31 }, { c: "#56575b", w: 27 }] },
        { id: "pigeon", name: "Pigeon", color: "#898783", tones: [{ c: "#898783", w: 35 }, { c: "#8d8c88", w: 35 }, { c: "#92908c", w: 27 }] },
        { id: "soot", name: "Soot", color: "#3c3e43", tones: [{ c: "#3c3e43", w: 47 }, { c: "#414247", w: 37 }, { c: "#37393c", w: 14 }] },
        { id: "pink", name: "Pink", color: "#b69684", tones: [{ c: "#b69684", w: 49 }, { c: "#bb9c8b", w: 38 }, { c: "#c3a594", w: 11 }] },
        { id: "light-blue", name: "Light Blue", color: "#9da9a4", tones: [{ c: "#9da9a4", w: 46 }, { c: "#97a39f", w: 30 }, { c: "#a4afa9", w: 22 }] },
        { id: "green", name: "Green", color: "#939984", tones: [{ c: "#939984", w: 56 }, { c: "#9ca28c", w: 22 }, { c: "#858f7f", w: 19 }] }
      ],
      defaults: { tiles: ["chalk"], grout: "#bfbcb6", joint: 2, wall: 150, angle: 90 },
      note: "Mews, nominal 5.5 × 45 cm. Each colour comes in several tones mixed tile by tile, sampled from Mutina's product photos."
    },

    "mutina-mews-11x11": {
      kind: "mix",
      brand: "Mutina",
      collection: "Mews",
      name: "Mews 11 × 11",
      credit: "Barber & Osgerby",
      material: "Homogeneous porcelain stoneware, 9 mm",
      size: { w: 11, l: 11 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "chalk", name: "Chalk", color: "#e4dfd6", tones: [{ c: "#e4dfd6", w: 44 }, { c: "#e7e2d9", w: 26 }, { c: "#e2ddd3", w: 25 }] },
        { id: "fog", name: "Fog", color: "#d6cdc1", tones: [{ c: "#d6cdc1", w: 38 }, { c: "#d0c6b8", w: 34 }, { c: "#d9d0c5", w: 26 }] },
        { id: "ink", name: "Ink", color: "#2c323e", tones: [{ c: "#2c323e", w: 51 }, { c: "#282e3a", w: 23 }, { c: "#323641", w: 23 }] },
        { id: "lead", name: "Lead", color: "#626061", tones: [{ c: "#626061", w: 40 }, { c: "#676466", w: 31 }, { c: "#56575b", w: 27 }] },
        { id: "pigeon", name: "Pigeon", color: "#898783", tones: [{ c: "#898783", w: 35 }, { c: "#8d8c88", w: 35 }, { c: "#92908c", w: 27 }] },
        { id: "soot", name: "Soot", color: "#3c3e43", tones: [{ c: "#3c3e43", w: 47 }, { c: "#414247", w: 37 }, { c: "#37393c", w: 14 }] },
        { id: "pink", name: "Pink", color: "#b69684", tones: [{ c: "#b69684", w: 49 }, { c: "#bb9c8b", w: 38 }, { c: "#c3a594", w: 11 }] },
        { id: "light-blue", name: "Light Blue", color: "#9da9a4", tones: [{ c: "#9da9a4", w: 46 }, { c: "#97a39f", w: 30 }, { c: "#a4afa9", w: 22 }] },
        { id: "green", name: "Green", color: "#939984", tones: [{ c: "#939984", w: 56 }, { c: "#9ca28c", w: 22 }, { c: "#858f7f", w: 19 }] }
      ],
      defaults: { tiles: ["chalk"], grout: "#bfbcb6", joint: 2, wall: 90, angle: 0 },
      note: "Mews, nominal 11 × 11 cm. Each colour comes in several tones mixed tile by tile, sampled from Mutina's product photos."
    },

    "mutina-otto": {
      kind: "mix",
      brand: "Mutina",
      collection: "Otto",
      name: "Otto 15 × 90",
      credit: "Mutina",
      material: "Glazed, not rectified porcelain stoneware, 9.5 mm",
      size: { w: 15, l: 90 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "latte-l1", name: "Latte L1", color: "#f4f1ec" },
        { id: "perla-p5", name: "Perla P5", color: "#e3dbc8" },
        { id: "nebbia-n3", name: "Nebbia N3", color: "#c8bdab" },
        { id: "salvia-s7", name: "Salvia S7", color: "#bbb39e" },
        { id: "burro-b4", name: "Burro B4", color: "#e9d5b4" },
        { id: "cipria-c2", name: "Cipria C2", color: "#d5b7a2" },
        { id: "terra-t1", name: "Terra T1", color: "#ae9d8d" },
        { id: "acqua-a4", name: "Acqua A4", color: "#aeb7b4" }
      ],
      defaults: { tiles: ["latte-l1"], grout: "#e6dcc8", joint: 2, wall: 300, angle: 90, layout: "drop" },
      note: "Otto, nominal 15 × 90 cm. The hand-applied pigment varies along each plank; it's drawn as one tone here."
    },

    "mutina-teknotessere": {
      kind: "mix",
      brand: "Mutina",
      collection: "Teknotessere",
      name: "Teknotessere 1 × 1",
      credit: "Mutina Team",
      material: "Homogeneous porcelain tesserae on a 30 × 30 cm net, 7 mm",
      size: { w: 1, l: 1 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "bianco", name: "Bianco", color: "#e3dbd5" },
        { id: "cemento", name: "Cemento", color: "#b9a99a" },
        { id: "fango", name: "Fango", color: "#655550" },
        { id: "nero", name: "Nero", color: "#322d31" }
      ],
      defaults: { tiles: ["bianco"], grout: "#e6dcc8", joint: 2, wall: 40 },
      note: "Teknotessere, 1 × 1 cm tesserae sold on 30 × 30 cm nets."
    },

    "mutina-time-3-9x3-9": {
      kind: "mix",
      brand: "Mutina",
      collection: "Time",
      name: "Time 3.9 × 3.9",
      credit: "Barber & Osgerby",
      material: "Unglazed, unrectified porcelain stoneware, smooth or rough, 12 mm",
      size: { w: 3.9, l: 3.9 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "dover-white-smooth", name: "Dover White smooth", color: "#e6decd" },
        { id: "atlas-brown-smooth", name: "Atlas Brown smooth", color: "#736758" },
        { id: "dakota-grey-smooth", name: "Dakota Grey smooth", color: "#757368" },
        { id: "etna-black-smooth", name: "Etna Black smooth", color: "#3c3835" },
        { id: "salta-red-smooth", name: "Salta Red smooth", color: "#8d4436" },
        { id: "highland-green-smooth", name: "Highland Green smooth", color: "#54614b" },
        { id: "virginia-blue-smooth", name: "Virginia Blue smooth", color: "#3b6171" },
        { id: "sahara-sand-smooth", name: "Sahara Sand smooth", color: "#b99b68" },
        { id: "dover-white-rough", name: "Dover White rough", color: "#e5decc" },
        { id: "atlas-brown-rough", name: "Atlas Brown rough", color: "#857a6e" },
        { id: "dakota-grey-rough", name: "Dakota Grey rough", color: "#807d74" },
        { id: "etna-black-rough", name: "Etna Black rough", color: "#45413e" },
        { id: "salta-red-rough", name: "Salta Red rough", color: "#8d4b3d" },
        { id: "highland-green-rough", name: "Highland Green rough", color: "#646d58" },
        { id: "virginia-blue-rough", name: "Virginia Blue rough", color: "#4f6d77" },
        { id: "sahara-sand-rough", name: "Sahara Sand rough", color: "#bb9e69" }
      ],
      defaults: { tiles: ["dover-white-smooth"], grout: "#cdbfa6", joint: 3, wall: 50, angle: 0 },
      note: "Time, nominal 3.9 × 3.9 cm. The rough finish is speckled; it's drawn as its average colour."
    },

    "mutina-time-3-9x20-5": {
      kind: "mix",
      brand: "Mutina",
      collection: "Time",
      name: "Time 3.9 × 20.5",
      credit: "Barber & Osgerby",
      material: "Unglazed, unrectified porcelain stoneware, smooth or rough, 12 mm",
      size: { w: 3.9, l: 20.5 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "dover-white-smooth", name: "Dover White smooth", color: "#e6decd" },
        { id: "atlas-brown-smooth", name: "Atlas Brown smooth", color: "#736758" },
        { id: "dakota-grey-smooth", name: "Dakota Grey smooth", color: "#757368" },
        { id: "etna-black-smooth", name: "Etna Black smooth", color: "#3c3835" },
        { id: "salta-red-smooth", name: "Salta Red smooth", color: "#8d4436" },
        { id: "highland-green-smooth", name: "Highland Green smooth", color: "#54614b" },
        { id: "virginia-blue-smooth", name: "Virginia Blue smooth", color: "#3b6171" },
        { id: "sahara-sand-smooth", name: "Sahara Sand smooth", color: "#b99b68" },
        { id: "dover-white-rough", name: "Dover White rough", color: "#e5decc" },
        { id: "atlas-brown-rough", name: "Atlas Brown rough", color: "#857a6e" },
        { id: "dakota-grey-rough", name: "Dakota Grey rough", color: "#807d74" },
        { id: "etna-black-rough", name: "Etna Black rough", color: "#45413e" },
        { id: "salta-red-rough", name: "Salta Red rough", color: "#8d4b3d" },
        { id: "highland-green-rough", name: "Highland Green rough", color: "#646d58" },
        { id: "virginia-blue-rough", name: "Virginia Blue rough", color: "#4f6d77" },
        { id: "sahara-sand-rough", name: "Sahara Sand rough", color: "#bb9e69" }
      ],
      defaults: { tiles: ["dover-white-smooth"], grout: "#cdbfa6", joint: 3, wall: 100, angle: 90 },
      note: "Time, nominal 3.9 × 20.5 cm. The rough finish is speckled; it's drawn as its average colour."
    },

    "mutina-time-20-5x20-5": {
      kind: "mix",
      brand: "Mutina",
      collection: "Time",
      name: "Time 20.5 × 20.5",
      credit: "Barber & Osgerby",
      material: "Unglazed, unrectified porcelain stoneware, smooth or rough, 12 mm",
      size: { w: 20.5, l: 20.5 },
      shape: { type: "rect" },
      layouts: ["straight", "drop"],
      colors: [
        { id: "dover-white-smooth", name: "Dover White smooth", color: "#e6decd" },
        { id: "atlas-brown-smooth", name: "Atlas Brown smooth", color: "#736758" },
        { id: "dakota-grey-smooth", name: "Dakota Grey smooth", color: "#757368" },
        { id: "etna-black-smooth", name: "Etna Black smooth", color: "#3c3835" },
        { id: "salta-red-smooth", name: "Salta Red smooth", color: "#8d4436" },
        { id: "highland-green-smooth", name: "Highland Green smooth", color: "#54614b" },
        { id: "virginia-blue-smooth", name: "Virginia Blue smooth", color: "#3b6171" },
        { id: "sahara-sand-smooth", name: "Sahara Sand smooth", color: "#b99b68" },
        { id: "dover-white-rough", name: "Dover White rough", color: "#e5decc" },
        { id: "atlas-brown-rough", name: "Atlas Brown rough", color: "#857a6e" },
        { id: "dakota-grey-rough", name: "Dakota Grey rough", color: "#807d74" },
        { id: "etna-black-rough", name: "Etna Black rough", color: "#45413e" },
        { id: "salta-red-rough", name: "Salta Red rough", color: "#8d4b3d" },
        { id: "highland-green-rough", name: "Highland Green rough", color: "#646d58" },
        { id: "virginia-blue-rough", name: "Virginia Blue rough", color: "#4f6d77" },
        { id: "sahara-sand-rough", name: "Sahara Sand rough", color: "#bb9e69" }
      ],
      defaults: { tiles: ["dover-white-smooth"], grout: "#cdbfa6", joint: 3, wall: 150, angle: 0 },
      note: "Time, nominal 20.5 × 20.5 cm. The rough finish is speckled; it's drawn as its average colour."
    }
  };
  for (var id in tiles) TV.TILES[id] = tiles[id];
})();

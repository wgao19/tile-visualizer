# tile-visualizer

Static tile + grout visualizer. No build step — open `index.html` locally or serve the repo root with GitHub Pages.

## Selections

Each selection (e.g. **Foyer**) pairs a room with a tile product and its starting settings. Switch between them with the picker at the top; the URL hash (`#foyer`) links straight to one.

## Sharing

Every option is kept in the URL, e.g.

```
#foyer?t=verde,blu&m=rows&g=17171a&l=drop&a=90&j=5.5&w=120
```

| key | meaning |
| --- | --- |
| `t` | tile colour ids, comma-separated |
| `m` | mix: `random`, `columns`, `rows` |
| `g` | grout hex (no `#`) |
| `l` | layout: `straight`, `drop` |
| `a` | direction: `0` vertical, `90` horizontal, `45` diagonal |
| `j` | grout joint in mm (1–8) |
| `w` | wall width shown in cm (40–200) |

The **Share** button copies the current link (or opens the share sheet on phones). Invalid values fall back to the selection's defaults.

## Adding a new selection

Edit `js/data.js`:

1. If it's a new tile, add it to `PRODUCTS` (size in cm, shape, colours, allowed layouts).
   Shapes live in `js/shapes.js` — `rect` and `notched-strip` (Bottone) are available.
2. Add an entry to `SELECTIONS`:

```js
{
  id: "bathroom",           // used in the URL: #bathroom
  name: "Bathroom",
  product: "some-product-id",
  defaults: { tiles: ["bianco"], grout: "#f2efe9", groutName: "Bianco", wall: 120 }
}
```

Any default you leave out falls back to: random mix, Sabbia grout, straight layout, vertical, 3 mm joint, 90 cm wall.

## GitHub Pages

Settings → Pages → Deploy from a branch → pick the branch and `/ (root)`. The `.nojekyll` file is already there.

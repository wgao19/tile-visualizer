# tile-visualizer

Static tile + grout visualizer. No build step — open `index.html` locally or serve the repo root with GitHub Pages.

## Selections

Each selection (e.g. **Foyer**) pairs a room with a tile product and its starting settings. Switch between them with the picker at the top; the URL hash (`#foyer`) links straight to one.

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

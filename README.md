# tile-visualizer

Static tile + grout visualizer. No build step: open `index.html` locally or serve the repo root with GitHub Pages.

## Pages

- **Overview** (`#/`): one card per place showing its current pick, with a preview and the key facts.
- **One tab per place** (`#/foyer`, `#/kitchen-backsplash`, `#/island-front`): the full editor.

Each place remembers its last pick in the browser (localStorage). **Reset** goes back to the defaults in `js/data.js`.

## Tile kinds

| kind | example | controls |
| --- | --- | --- |
| `strip` | Mutina Bottone L | several colours mixed, mix pattern, layout, direction, zoom |
| `decor` | Mutina Homage to the Square | one colour; Dash/Dot pattern: all dash, all dot, split top/bottom, split left/right, alternate (with swap); surface width × height; tile counts |

Decor surfaces are drawn whole, tiled from the top-left corner, so the split falls on a tile joint and the readout shows how many Dash and Dot tiles you need (and how many are cut).

## Sharing

The URL always holds the full selection, so copying it (or pressing **Share**) shares exactly what you see.

Place links:

```
#/foyer?t=verde,blu&m=rows&g=17171a&l=drop&a=90&j=5.5&w=120
#/kitchen-backsplash?c=sea&p=split-h&s=0&g=f2efe9&j=2&w=240&h=60
```

| key | strip (Bottone) | decor (Homage to the Square) |
| --- | --- | --- |
| `g` | grout hex, no `#` | grout hex, no `#` |
| `j` | joint mm (1–8) | joint mm (1–8) |
| `t` | tile colour ids, comma-separated | |
| `m` | `random`, `columns`, `rows` | |
| `l` | `straight`, `drop` | |
| `a` | `0`, `90`, `45` | |
| `w` | wall width shown, cm (40–200) | surface width, cm (15–600) |
| `c` | | colour id |
| `p` | | `dash`, `dot`, `split-h`, `split-v`, `alt` |
| `s` | | `1` swaps dash and dot |
| `h` | | surface height, cm (15–300) |

The overview link carries every place: `#/?foyer=<encoded place query>&kitchen-backsplash=…`. Opening a shared overview shows those picks without overwriting your own; clicking a card opens that place with the shared pick.

Invalid values fall back to the place's defaults. Older `#foyer?...` links still work.

## Adding things

All in `js/data.js`:

- **New place:** add to `PLACES` with an `id`, `name`, `product` and `defaults`.
- **New tile:** add to `PRODUCTS` with a `kind` (`strip` or `decor`). Strip shapes live in `js/shapes.js` (`rect`, `notched-strip`).

## Files

- `js/data.js`: grouts, products, places
- `js/render.js`: canvas drawing for both kinds
- `js/shapes.js`: strip tile outlines
- `js/app.js`: routing, state, controls, sharing

## GitHub Pages

Settings → Pages → Deploy from a branch → pick the branch and `/ (root)`. `.nojekyll` is already there.

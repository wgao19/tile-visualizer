# tile-visualizer

Static tile + grout visualizer. No build step: open `index.html` locally or serve the repo root with GitHub Pages.

## How it works

1. **Add an area** (a wall, floor, splashback…): give it a name and **select a tile** from the library.
2. Pick the tile's colours and pattern, the grout and the joint.
3. **Share** the link. It holds every area in the set.

The overview (`#/`) shows one card per area; each area also gets a tab (`#/<area>`). **Edit area** renames it, switches it to another tile (grout and joint carry over) or deletes it. **Reset** puts the area's options back to the tile's defaults.

A link with no areas opens an empty set. The last set you edited is kept in this browser, and the empty page offers to reopen it.

### Our set

Foyer (Bottone L), kitchen backsplash and island front (Homage to the Square):

```
#/?a=n%3DFoyer%26tile%3Dmutina-bottone-l%26g%3Dcdbfa6%26j%3D3%26t%3Drosso%26m%3Drandom%26l%3Dstraight%26a%3D0%26w%3D90&a=n%3DKitchen%2520backsplash%26tile%3Dmutina-homage-to-the-square%26g%3Df2efe9%26j%3D2%26c%3Dsea%26p%3Ddash%26s%3D0%26w%3D240%26h%3D60&a=n%3DIsland%2520front%26tile%3Dmutina-homage-to-the-square%26g%3Df2efe9%26j%3D2%26c%3Dsea%26p%3Dalt%26s%3D0%26w%3D200%26h%3D90
```

## Tile library

Brand tiles live in `js/tiles/<brand>.js` (so far `mutina.js`, 20 tiles); generic ones in `js/data.js`. All add themselves to `TILES`. **A new tile is a data entry only**, as long as it uses an existing kind. A new brand file also needs a `<script>` line in `index.html`.

**A tile is one size of one product.** Colours, finishes or tones of the same size that are meant to be mixed on one surface share an entry (DIN's matt and glossy colours, Diarama's tone sets). Other sizes are separate tiles (Bottone S and Bottone L, the five Kosei sizes).

| kind | example | options |
| --- | --- | --- |
| `mix` | Bottone, DIN, Diarama, Kosei, Mews, Otto, Teknotessere, Time, Plain rectangle | several colours mixed, mix pattern, layout, direction, zoom |
| `decor` | Mutina Homage to the Square | one colour; Dash/Dot pattern: all dash, all dot, split top/bottom, split left/right, alternate (with swap); surface width × height; tile counts |

Optional tile fields:

- `collection`: the brand's product family, e.g. "Osso & Bottone". A label only: shown on the tile, searched, and used to sort tiles within a brand.
- `defaults`: starting options when an area picks the tile (including `grout` and `joint`).
- `grouts`: grout colours suggested for this tile, `[{ name, c }]`. They show above the shared palette as "Suggested for this tile"; any colour can still be picked.
- `shape` (mix): an outline from `js/shapes.js` (`rect`, `notched-strip`).
- `tones` (mix, per colour): `[{ c, w }]` for products that vary tile by tile. Each tile gets one tone, in proportion to the weights `w`.

The mix kind's zoom ("wall width shown") goes up to five tile lengths across, at least 2 m and at most 6 m.

Mutina colours were sampled from the product photos on mutina.it: the median of the tile face, or the main colour clusters for products with tones. Glossy DIN colours are estimates, because those photos are mostly reflection.

Decor surfaces are drawn whole, tiled from the top-left corner, so the split falls on a tile joint and the readout shows how many Dash and Dot tiles you need (and how many are cut).

### Adding a kind

Only needed for a tile whose drawing or options don't fit `mix` or `decor`. Add it to `TV.KINDS` in `js/kinds.js`: defaults, validation, link keys, readout facts, a list of controls (`swatches`, `seg`, `toggle`, `range`, `numbers`) and a draw function. The app builds the controls from that list.

## Link format

```
#/<area id>?a=<area>&a=<area>…
```

Each `<area>` is an encoded query:

| key | meaning |
| --- | --- |
| `n` | area name |
| `tile` | tile id from `TILES` |
| `g` | grout hex, no `#` |
| `j` | joint mm (1–8) |
| `t`, `m`, `l`, `a`, `w` | mix: colour ids (comma-separated), `random`/`columns`/`rows`, `straight`/`drop`, `0`/`90`/`45`, wall width shown in cm (40–200) |
| `c`, `p`, `s`, `w`, `h` | decor: colour id, `dash`/`dot`/`split-h`/`split-v`/`alt`, `1` swaps dash and dot, surface width cm (15–600), height cm (15–300) |

Invalid values fall back to the tile's defaults; areas with an unknown tile are skipped. Links from the earlier fixed-places version (`#/foyer?…`, `#/?foyer=…&island-front=…`, `#foyer?…`) still open.

## Files

- `js/data.js`: grout palette and generic tiles
- `js/tiles/mutina.js`: Mutina tiles
- `js/kinds.js`: per-kind options, controls and link keys
- `js/render.js`: canvas drawing
- `js/shapes.js`: tile outlines for the mix kind
- `js/app.js`: areas, routing, controls, sharing

## GitHub Pages and previews

Two workflows publish to the `gh-pages` branch, which Pages serves (Settings → Pages → Deploy from a branch → `gh-pages` / root):

- `.github/workflows/pages.yml`: every push to `main` publishes the site at the root.
- `.github/workflows/preview.yml`: every pull request is published at `<site>/pr-preview/pr-<number>/`, with the link commented on the PR. It is removed when the PR closes.

Actions minutes are free for public repositories. `.nojekyll` is already there.

### Caching

GitHub Pages lets browsers cache files for about 10 minutes. `index.html` links its CSS and JS with a version tag (`?v=6`) so a new page never loads with old scripts. **When you change any file in `css/` or `js/`, bump that number on every link in `index.html`.**

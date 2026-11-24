/*
 * Areas, routing, controls and sharing.
 *
 * A set is a list of areas. Each area has a name, a tile from the library and
 * that tile's options. The link holds the whole set, so it is the only state
 * that matters: a link with no areas opens an empty set. The last set you edited
 * is also kept in this browser so you can pick it up again.
 *
 *   #/?a=<area>&a=<area>         overview of the set
 *   #/<area id>?a=<area>&…       one area, with the rest of the set
 *   <area> = encoded "n=<name>&tile=<tile id>&g=<grout>&j=<joint>&<kind options>"
 *
 * Older links (#/foyer?…, #/?foyer=…&island-front=…, #foyer?…) still open.
 */
(function () {
  var TV = window.TileViz, U = TV.util;
  var AREA_BASE = { grout: "#cdbfa6", joint: 3 };
  var STORE_LAST = "tileviz:last";

  /* ---------- helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function copy(v) { return Array.isArray(v) ? v.slice() : v; }
  function pairs(q) {
    var out = [];
    (q || "").split("&").forEach(function (kv) {
      var k = kv.indexOf("=");
      if (k > 0) {
        try { out.push([decodeURIComponent(kv.slice(0, k)), decodeURIComponent(kv.slice(k + 1))]); } catch (e) { /* skip */ }
      }
    });
    return out;
  }
  function parseQuery(q) {
    var o = {};
    pairs(q).forEach(function (p) { o[p[0]] = p[1]; });
    return o;
  }
  function toQuery(list) {
    return list.map(function (p) { return encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1]); }).join("&");
  }
  function kindOf(tile) { return TV.KINDS[tile.kind]; }
  function tileName(tile) { return (tile.brand && tile.brand !== "Generic" ? tile.brand + " " : "") + tile.name; }
  function sizeText(tile) { return tile.size.w + " × " + tile.size.l + " cm"; }

  /* ---------- areas ---------- */

  /* Options for `tile`, starting from its defaults and keeping whatever in `carry`
   * still applies (grout and joint always; kind options when the kind matches). */
  function optionsFor(tile, carry) {
    var k = kindOf(tile), st = {}, key;
    for (key in AREA_BASE) st[key] = AREA_BASE[key];
    for (key in k.base) st[key] = copy(k.base[key]);
    for (key in tile.defaults || {}) st[key] = copy(tile.defaults[key]);
    if (carry) for (key in carry) if (key in AREA_BASE || key in k.base) st[key] = copy(carry[key]);
    normalize(tile, st);
    return st;
  }
  function normalize(tile, st) {
    if (!/^#[0-9a-f]{6}$/i.test(st.grout || "")) st.grout = AREA_BASE.grout;
    st.grout = st.grout.toLowerCase();
    if (!U.inRange(st.joint, 1, 8)) st.joint = AREA_BASE.joint;
    kindOf(tile).normalize(tile, st);
  }

  function slug(name) {
    var s = String(name).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
    return s || "area";
  }
  function uniqueId(name, self) {
    var base = slug(name), id = base, n = 2;
    while (areas.some(function (a) { return a !== self && a.id === id; }) || id === "new") id = base + "-" + n++;
    return id;
  }

  function encodeArea(a) {
    return toQuery([["n", a.name], ["tile", a.tile], ["g", a.st.grout.slice(1)], ["j", a.st.joint]]
      .concat(kindOf(TV.TILES[a.tile]).serialize(a.st)));
  }
  /* An area from link params, or null if its tile isn't in the library. */
  function areaFrom(p, fallbackName) {
    var tile = TV.TILES[p.tile];
    if (!tile) return null;
    var st = optionsFor(tile);
    if (/^[0-9a-f]{6}$/i.test(p.g || "")) st.grout = "#" + p.g;
    var j = parseFloat(p.j);
    if (U.inRange(j, 1, 8)) st.joint = Math.round(j * 2) / 2;
    kindOf(tile).parse(p, tile, st);
    normalize(tile, st);
    return { name: (p.n || fallbackName || tile.name).slice(0, 60), tile: p.tile, st: st };
  }
  function setQuery(list) {
    return (list || areas).map(function (a) { return "a=" + encodeURIComponent(encodeArea(a)); }).join("&");
  }
  function setFromQuery(q) {
    var out = [];
    pairs(q).forEach(function (p) {
      if (p[0] !== "a") return;
      var a = areaFrom(parseQuery(p[1]));
      if (a) out.push(a);
    });
    return out;
  }
  function assignIds(list) {
    var saved = areas;
    areas = [];
    list.forEach(function (a) { a.id = uniqueId(a.name); areas.push(a); });
    areas = saved;
    return list;
  }

  /* ---------- older links ---------- */
  var LEGACY = {
    "foyer": { name: "Foyer", tile: "mutina-bottone-l" },
    "kitchen-backsplash": { name: "Kitchen backsplash", tile: "mutina-homage-to-the-square" },
    "island-front": { name: "Island front", tile: "mutina-homage-to-the-square" }
  };
  function legacyArea(id, q) {
    var p = parseQuery(q);
    p.tile = LEGACY[id].tile;
    p.n = LEGACY[id].name;
    return areaFrom(p);
  }
  /* Old overview links carried one query per place. */
  function legacySet(q) {
    var p = parseQuery(q), out = [];
    Object.keys(LEGACY).forEach(function (id) { if (p[id]) out.push(legacyArea(id, p[id])); });
    return out.filter(Boolean);
  }
  /* Picks saved by the old version of the page, offered as a set to resume. */
  function legacyStored() {
    var out = [];
    try {
      Object.keys(LEGACY).forEach(function (id) {
        var q = localStorage.getItem("tileviz:" + id);
        if (q) out.push(legacyArea(id, q));
      });
    } catch (e) { /* storage unavailable */ }
    return out.filter(Boolean);
  }

  /* ---------- state and routing ---------- */
  var areas = [];
  var current = null; // area being edited, or null on the overview
  var booted = false;

  function parseRoute() {
    var h = location.hash.replace(/^#\/?/, "");
    var q = h.indexOf("?");
    return { path: q < 0 ? h : h.slice(0, q), query: q < 0 ? "" : h.slice(q + 1) };
  }
  function hashFor(area) {
    var q = setQuery();
    return "#/" + (area ? encodeURIComponent(area.id) : "") + (q ? "?" + q : "");
  }
  function writeUrl() {
    var next = hashFor(current);
    if (location.hash !== next && history.replaceState) history.replaceState(null, "", next || location.pathname);
  }
  function remember() {
    try {
      if (areas.length) localStorage.setItem(STORE_LAST, setQuery());
      else localStorage.removeItem(STORE_LAST);
    } catch (e) { /* ignore */ }
  }
  function changed() { remember(); writeUrl(); syncTabs(); }

  function route() {
    var r = parseRoute(), path = r.path;
    try { path = decodeURIComponent(path); } catch (e) { /* keep raw */ }
    // Old place links also used `a` (direction), so a set is only a set if its areas decode.
    var set = setFromQuery(r.query);
    if (set.length) {
      areas = assignIds(set);
    } else if (LEGACY[path] && r.query) {
      areas = assignIds([legacyArea(path, r.query)].filter(Boolean));
      path = areas.length ? areas[0].id : "";
    } else if (!path && r.query && legacySet(r.query).length) {
      areas = assignIds(legacySet(r.query));
    } else if (!booted) {
      areas = [];
    }
    // Otherwise (a hash with no set, after load): keep the set already open.
    booted = true;
    buildTabs();
    var area = U.byId(areas, path);
    if (area) showArea(area); else showIndex();
    remember();
  }

  /* ---------- tabs ---------- */
  var tabs = el("tabs");
  function buildTabs() {
    tabs.innerHTML = "";
    [null].concat(areas).forEach(function (a) {
      var link = make("a", null, a ? a.name : "Overview");
      link.dataset.id = a ? a.id : "";
      tabs.appendChild(link);
    });
    var add = make("button", "tab-add", "+ Add area");
    add.type = "button";
    add.addEventListener("click", function () { openDialog(null); });
    tabs.appendChild(add);
    syncTabs();
  }
  function syncTabs() {
    var id = current ? current.id : "";
    Array.prototype.forEach.call(tabs.querySelectorAll("a"), function (link) {
      link.href = hashFor(U.byId(areas, link.dataset.id));
      if (link.dataset.id === id) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* ---------- overview ---------- */
  var cardsWrap = el("cards");

  function showIndex() {
    current = null;
    el("indexView").hidden = false;
    el("placeView").hidden = true;
    document.title = "Tile Visualizer";
    el("shareIndex").hidden = !areas.length;
    el("addArea").hidden = !areas.length;
    el("indexSub").textContent = areas.length
      ? "The current pick for each area. Open one to change it."
      : "Add an area, such as a wall, floor or splashback, then pick a tile for it.";
    buildEmpty();
    buildCards();
    changed();
  }

  function buildEmpty() {
    var box = el("empty");
    box.hidden = areas.length > 0;
    if (box.hidden) return;
    var resume = el("resume");
    var last = null;
    try { last = localStorage.getItem(STORE_LAST); } catch (e) { /* ignore */ }
    var set = last ? setFromQuery(last) : legacyStored();
    resume.hidden = !set.length;
    if (set.length) {
      resume.textContent = "Open your last set (" + set.map(function (a) { return a.name; }).join(", ") + ")";
      resume.onclick = function () { location.hash = "#/?" + setQuery(set); };
    }
  }

  function buildCards() {
    cardsWrap.innerHTML = "";
    areas.forEach(function (area) {
      var tile = TV.TILES[area.tile];
      var a = make("a", "card");
      a.href = hashFor(area);

      var pv = make("div", "pv"), cv = make("canvas");
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", area.name + " preview");
      pv.appendChild(cv);
      a.appendChild(pv);

      var body = make("div", "body");
      body.appendChild(make("h2", null, area.name));
      body.appendChild(make("p", "prod", tileName(tile)));
      body.appendChild(factList(tile, area.st));
      body.appendChild(make("span", "open", "Open →"));
      a.appendChild(body);
      cardsWrap.appendChild(a);
    });
    if (areas.length) {
      var add = make("button", "card add-card");
      add.type = "button";
      add.appendChild(make("span", "plus", "+"));
      add.appendChild(make("span", null, "Add area"));
      add.addEventListener("click", function () { openDialog(null); });
      cardsWrap.appendChild(add);
    }
    drawCards();
  }
  function drawCards() {
    Array.prototype.forEach.call(cardsWrap.querySelectorAll("canvas"), function (cv, k) {
      TV.draw(cv, TV.TILES[areas[k].tile], areas[k].st);
    });
  }
  function factList(tile, st) {
    var dl = make("dl");
    kindOf(tile).facts(tile, st).forEach(function (f) {
      var dd = make("dd");
      if (f[2]) dd.appendChild(chip(f[2]));
      dd.appendChild(document.createTextNode(f[1]));
      dl.appendChild(make("dt", null, f[0]));
      dl.appendChild(dd);
    });
    return dl;
  }
  function chip(color) {
    var i = make("i", "chip");
    i.style.background = color;
    return i;
  }

  /* ---------- one area ---------- */
  var tile, state, syncers = [], swatchDraws = [];
  var cv = el("cv"), wrap = el("canvasWrap");

  function showArea(area) {
    current = area;
    tile = TV.TILES[area.tile];
    state = area.st;
    el("indexView").hidden = true;
    el("placeView").hidden = false;
    el("title").textContent = area.name;
    el("subtitle").textContent = tileName(tile) + " · " + sizeText(tile) +
      (tile.credit ? " · " + tile.credit : "") + (tile.material ? ". " + tile.material + "." : "");
    el("productNote").textContent = tile.note || "";
    document.title = area.name + " · Tile Visualizer";
    wrap.classList.toggle("fit", !!kindOf(tile).aspect);
    buildGrouts();
    buildControls();
    render();
    changed();
  }

  function update() {
    syncers.forEach(function (f) { f(); });
    render();
    changed();
  }

  function render() {
    if (!current) return;
    sizeStage();
    TV.draw(cv, tile, state);
    var r = el("readout");
    r.innerHTML = "";
    kindOf(tile).facts(tile, state).forEach(function (f) {
      var s = make("span"), b = make("b");
      s.appendChild(document.createTextNode(f[0] + " "));
      if (f[2]) b.appendChild(chip(f[2]));
      b.appendChild(document.createTextNode(f[1]));
      s.appendChild(b);
      r.appendChild(s);
    });
  }

  /* Kinds with an aspect are drawn whole, so the canvas takes the surface's proportions. */
  function sizeStage() {
    var aspect = kindOf(tile).aspect;
    if (!aspect) { cv.style.width = ""; cv.style.height = ""; return; }
    var ratio = aspect(state);
    var cs = getComputedStyle(wrap);
    var avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var maxH = Math.min(560, window.innerHeight * 0.6);
    var w = avail, h = avail / ratio;
    if (h > maxH) { h = maxH; w = h * ratio; }
    cv.style.width = Math.round(w) + "px";
    cv.style.height = Math.round(h) + "px";
  }

  /* Grout: the tile's suggestions (if any), the shared palette, a custom colour, and the joint. */
  function groutButton(gr) {
    var b = make("button", "sw");
    b.type = "button";
    b.dataset.c = gr.c;
    var dot = make("span", "dot");
    dot.style.background = gr.c;
    b.appendChild(dot);
    b.appendChild(make("span", "nm", gr.name));
    b.addEventListener("click", function () { state.grout = gr.c.toLowerCase(); update(); });
    return b;
  }
  function buildGrouts() {
    var sug = tile.grouts || [];
    el("groutSuggest").hidden = !sug.length;
    el("groutAllLabel").hidden = !sug.length;
    el("groutSuggestSw").innerHTML = "";
    sug.forEach(function (g) { el("groutSuggestSw").appendChild(groutButton(g)); });
    el("swatches").innerHTML = "";
    TV.GROUTS.forEach(function (g) { el("swatches").appendChild(groutButton(g)); });
  }
  function syncGrouts() {
    Array.prototype.forEach.call(document.querySelectorAll("#groutPanel .sw"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.c.toLowerCase() === state.grout));
    });
    el("custom").value = state.grout;
    el("customHex").textContent = state.grout;
    el("joint").value = state.joint;
    el("jointOut").textContent = state.joint + " mm";
  }
  el("custom").addEventListener("input", function (e) { state.grout = e.target.value.toLowerCase(); update(); });
  el("joint").addEventListener("input", function (e) { state.joint = parseFloat(e.target.value); update(); });

  /* Tile controls, built from the kind's control specs. */
  var CONTROL = {
    swatches: function (c, field) {
      var box = make("div", "swatches" + (c.swatch ? " decor-sw" : (c.multi ? " tile-sw" : "")));
      box.setAttribute("role", "group");
      c.items.forEach(function (it) {
        var b = make("button", "sw");
        b.type = "button";
        if (c.swatch) {
          var swc = make("canvas");
          b.appendChild(swc);
          swatchDraws.push(function () { c.swatch(swc, it); });
        } else {
          var dot = make("span", "dot");
          dot.style.background = it.color;
          b.appendChild(dot);
        }
        b.appendChild(make("span", "nm", it.name));
        b.addEventListener("click", function () {
          if (!c.multi) state[c.key] = it.id;
          else {
            var k = state[c.key].indexOf(it.id);
            if (k < 0) state[c.key].push(it.id);
            else if (state[c.key].length > 1) state[c.key].splice(k, 1);
          }
          update();
        });
        box.appendChild(b);
      });
      field.appendChild(box);
      var all;
      if (c.multi && c.selectAll && c.items.length > 1) {
        all = make("button", "seg-btn", "Select all " + c.items.length);
        all.type = "button";
        all.addEventListener("click", function () { state[c.key] = c.items.map(function (it) { return it.id; }); update(); });
        var row = make("div", "row");
        row.appendChild(all);
        field.appendChild(row);
      }
      return function () {
        Array.prototype.forEach.call(box.children, function (b, k) {
          var id = c.items[k].id;
          b.setAttribute("aria-pressed", String(c.multi ? state[c.key].indexOf(id) >= 0 : state[c.key] === id));
        });
      };
    },
    seg: function (c, field) {
      var box = make("div", "seg");
      box.setAttribute("role", "group");
      c.items.forEach(function (it) {
        var b = make("button", null, it.name);
        b.type = "button";
        b.addEventListener("click", function () { state[c.key] = it.id; update(); });
        box.appendChild(b);
      });
      field.appendChild(box);
      return function () {
        Array.prototype.forEach.call(box.children, function (b, k) {
          b.setAttribute("aria-pressed", String(c.items[k].id === state[c.key]));
        });
      };
    },
    toggle: function (c, field) {
      var b = make("button", "seg-btn", c.label);
      b.type = "button";
      b.addEventListener("click", function () { state[c.key] = !state[c.key]; update(); });
      field.appendChild(b);
      return function () { b.setAttribute("aria-pressed", String(!!state[c.key])); };
    },
    range: function (c, field, id) {
      var out = make("span");
      var top = make("div", "top");
      top.appendChild(field.firstChild);
      top.appendChild(out);
      field.appendChild(top);
      var inp = make("input");
      inp.type = "range"; inp.id = id; inp.min = c.min; inp.max = c.max; inp.step = c.step;
      inp.addEventListener("input", function () { state[c.key] = parseFloat(inp.value); update(); });
      field.appendChild(inp);
      return function () { inp.value = state[c.key]; out.textContent = state[c.key] + " " + c.unit; };
    },
    numbers: function (c, field) {
      var box = make("div", "dims"), inputs = [];
      c.fields.forEach(function (f) {
        var lab = make("label", "num", f.label + " ");
        var inp = make("input");
        inp.type = "number"; inp.min = f.min; inp.max = f.max; inp.step = 1; inp.inputMode = "numeric";
        inp.addEventListener("input", function () {
          var v = parseFloat(inp.value);
          if (U.inRange(v, f.min, f.max)) { state[f.key] = Math.round(v); update(); }
        });
        inp.addEventListener("change", function () { inp.value = state[f.key]; });
        lab.appendChild(inp);
        lab.appendChild(document.createTextNode(" " + f.unit));
        box.appendChild(lab);
        inputs.push([inp, f.key]);
      });
      field.appendChild(box);
      return function () {
        inputs.forEach(function (x) { if (document.activeElement !== x[0]) x[0].value = state[x[1]]; });
      };
    }
  };

  function buildControls() {
    var box = el("tileControls");
    box.innerHTML = "";
    syncers = [syncGrouts];
    swatchDraws = [];
    kindOf(tile).controls(tile).forEach(function (c, n) {
      var field = make("div", "field"), id = "ctl" + n;
      if (c.type !== "toggle") {
        var lab = make("label", null, c.label);
        lab.id = id + "l";
        if (c.type === "range") lab.htmlFor = id;
        field.appendChild(lab);
      }
      var sync = CONTROL[c.type](c, field, id);
      var group = field.querySelector("[role=group]");
      if (group) group.setAttribute("aria-labelledby", id + "l");
      box.appendChild(field);
      syncers.push(function () {
        field.hidden = c.show ? !c.show(state) : false;
        sync();
      });
    });
    syncers.forEach(function (f) { f(); });
    drawSwatches();
  }
  function drawSwatches() { swatchDraws.forEach(function (f) { f(); }); }

  el("reset").addEventListener("click", function () {
    current.st = state = optionsFor(tile);
    showArea(current);
  });
  el("editArea").addEventListener("click", function () { openDialog(current); });

  /* ---------- add / edit area dialog ---------- */
  var dlg = el("areaDialog"), picker = el("tilePicker"), editing = null, pickedTile = null;

  /* The library, grouped by brand. Search matches brand, name, material and colour names. */
  function buildPicker() {
    picker.innerHTML = "";
    var groups = {};
    Object.keys(TV.TILES).forEach(function (id) {
      var t = TV.TILES[id], brand = t.brand || "Other";
      if (!groups[brand]) {
        var sec = make("section", "tile-group");
        sec.appendChild(make("h3", null, brand));
        var grid = make("div", "tile-picker");
        sec.appendChild(grid);
        picker.appendChild(sec);
        groups[brand] = grid;
      }
      var b = make("button", "tile-opt");
      b.type = "button";
      b.dataset.id = id;
      b.dataset.search = [brand, t.name, t.material || "", t.credit || ""]
        .concat(t.colors.map(function (c) { return c.name; })).join(" ").toLowerCase();
      var cvp = make("canvas");
      cvp.setAttribute("aria-hidden", "true");
      b.appendChild(cvp);
      var txt = make("span", "tile-txt");
      txt.appendChild(make("b", null, t.name));
      txt.appendChild(make("span", null, sizeText(t) + " · " + t.colors.length + " colours"));
      b.appendChild(txt);
      b.addEventListener("click", function () { pickedTile = id; syncPicker(); });
      groups[brand].appendChild(b);
    });
    filterPicker();
  }
  function filterPicker() {
    var words = el("tileSearch").value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    Array.prototype.forEach.call(picker.querySelectorAll(".tile-group"), function (sec) {
      var any = false;
      Array.prototype.forEach.call(sec.querySelectorAll(".tile-opt"), function (b) {
        var ok = words.every(function (w) { return b.dataset.search.indexOf(w) >= 0; });
        b.hidden = !ok;
        if (ok) { any = true; shown++; }
      });
      sec.hidden = !any;
    });
    var total = Object.keys(TV.TILES).length;
    el("tileCount").textContent = words.length ? shown + " of " + total : total + " tiles";
    el("tileNone").hidden = shown > 0;
  }
  el("tileSearch").addEventListener("input", function () { filterPicker(); drawPicker(); });
  function syncPicker() {
    Array.prototype.forEach.call(picker.querySelectorAll(".tile-opt"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.id === pickedTile));
    });
    el("dlgSave").disabled = !pickedTile;
  }
  function drawPicker() {
    Array.prototype.forEach.call(picker.querySelectorAll(".tile-opt:not([hidden]) canvas"), function (c) {
      var id = c.parentNode.dataset.id, t = TV.TILES[id];
      // Show the area's own options on its current tile, the tile's defaults elsewhere.
      var st = editing && editing.tile === id ? editing.st : optionsFor(t);
      // Kinds drawn as a whole surface get a sample that fills the card, about six tiles wide.
      if (kindOf(t).aspect) {
        st = Object.assign({}, st);
        st.w = Math.round(t.size.w * 6);
        st.h = Math.round(st.w * c.clientHeight / Math.max(1, c.clientWidth));
      }
      TV.draw(c, t, st);
    });
  }

  function openDialog(area) {
    editing = area;
    pickedTile = area ? area.tile : null;
    el("dlgTitle").textContent = area ? "Edit area" : "Add an area";
    el("dlgName").value = area ? area.name : "";
    el("dlgName").placeholder = "e.g. Bathroom floor";
    el("dlgSave").textContent = area ? "Save" : "Add area";
    el("dlgDelete").hidden = !area;
    el("dlgError").hidden = true;
    el("tileSearch").value = "";
    buildPicker();
    syncPicker();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    drawPicker();
    if (!area) el("dlgName").focus();
  }
  function closeDialog() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }

  el("dlgForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = el("dlgName").value.trim().slice(0, 60);
    if (!name) { el("dlgError").textContent = "Give the area a name."; el("dlgError").hidden = false; el("dlgName").focus(); return; }
    if (!pickedTile) return;
    var t = TV.TILES[pickedTile], area = editing;
    if (area) {
      if (area.tile !== pickedTile) { area.st = optionsFor(t, area.st); area.tile = pickedTile; }
      area.name = name;
      area.id = uniqueId(name, area);
    } else {
      area = { name: name, tile: pickedTile, st: optionsFor(t) };
      area.id = uniqueId(name);
      areas.push(area);
    }
    closeDialog();
    buildTabs();
    showArea(area);
  });
  el("dlgCancel").addEventListener("click", closeDialog);
  el("dlgClose").addEventListener("click", closeDialog);
  // A click on the backdrop (outside the sheet) closes it.
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(); });
  el("dlgDelete").addEventListener("click", function () {
    if (!editing || !window.confirm("Delete “" + editing.name + "”?")) return;
    areas = areas.filter(function (a) { return a !== editing; });
    closeDialog();
    buildTabs();
    showIndex();
  });
  ["addArea", "addFirst"].forEach(function (id) { el(id).addEventListener("click", function () { openDialog(null); }); });

  /* ---------- share ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand("copy")) resolve(); else reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  function shareButton(id) {
    var b = el(id), timer;
    b.addEventListener("click", function () {
      var url = location.href;
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      copyText(url).then(function () {
        b.textContent = "Link copied";
        clearTimeout(timer);
        timer = setTimeout(function () { b.textContent = "Share"; }, 1800);
      }, function () { window.prompt("Copy this link:", url); });
    });
  }
  shareButton("share");
  shareButton("shareIndex");

  /* ---------- boot ---------- */
  var raf;
  function redraw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      if (current) { render(); drawSwatches(); } else drawCards();
      if (dlg.open) drawPicker();
    });
  }
  window.addEventListener("resize", redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(document.querySelector(".wrap"));
  window.addEventListener("hashchange", route);

  route();
})();

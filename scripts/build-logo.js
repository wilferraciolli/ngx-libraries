#!/usr/bin/env node
// Generates the Wiltech Labs logo set into packages/styles/src/logo/ (see that package's README,
// "Logo"), then copies the favicons into apps/showcase/src/. Run with `npm run build:logo`.
//
// Everything is drawn from the geometry below, so change the mark here, not in the output SVGs:
// they're regenerated wholesale, and their wordmark is outlined path data.
//
// The wordmark fonts (Sora 600, JetBrains Mono 500, both OFL) are fetched from Google Fonts on
// first run and cached in node_modules/.cache/wiltech-logo-fonts/. No font ships in the output.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'packages/styles/src/logo');
// Angular only serves assets from inside an app's own workspace root, so the showcase can't
// point at OUT directly. It gets copies instead.
const APP_FAVICON_DIRS = [path.join(ROOT, 'apps/showcase/src')];
const APP_FAVICONS = ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'];
const FONT_CACHE = path.join(ROOT, 'node_modules/.cache/wiltech-logo-fonts');
const FONTS = {
  sora: { family: 'Sora:wght@600', file: 'sora-600.ttf' },
  mono: { family: 'JetBrains+Mono:wght@500', file: 'jbmono-500.ttf' },
};

// ---- palette: house seeds, primary #0A7E8C / tertiary #8A6D1C (theme-colors.template.scss) ----
const C = {
  light: { body: '#0A7E8C', liquid: '#AD8D3A', name: '#132326', labs: '#8A6D1C' }, // liquid = tertiary 60
  dark: { body: '#7AD4E3', liquid: '#E7C269', name: '#E4EEEF', labs: '#E7C269' }, // primary 80 / tertiary 80
  tile: { bg: '#0A7E8C', body: '#FFFFFF', liquid: '#E7C269' },
};

// ---- mark geometry, 64-unit grid ----
// Solid Erlenmeyer silhouette; gold liquid below a W-shaped surface; the W and two bubbles are
// cut out through a mask, so they're real transparency on any background.
const SIL =
  'M23 8H41Q43 8 43 10.5Q43 13 41 13H39V24L53.6 47.6Q57 55 49 55H15Q7 55 10.4 47.6L25 24V13H23Q21 13 21 10.5Q21 8 23 8Z';
const W = '16,26 26,46 32,38 38,46 48,26'; // arms run out past the walls, the clip trims them
const LIQ = 'M0 26H16L26 46L32 38L38 46L48 26H64V64H0Z';
const BUBBLES = [
  [33, 27.5, 2.2],
  [30, 19.5, 1.5],
];
const CUT = 2.8;

function flask(c, id) {
  return (
    `<defs>` +
    `<clipPath id="${id}-clip"><path d="${SIL}"/></clipPath>` +
    `<mask id="${id}-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
    `<rect width="64" height="64" fill="#fff"/>` +
    `<polyline points="${W}" fill="none" stroke="#000" stroke-width="${CUT}" stroke-linejoin="round" stroke-linecap="round"/>` +
    BUBBLES.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('') +
    `</mask>` +
    `</defs>` +
    `<g clip-path="url(#${id}-clip)" mask="url(#${id}-cut)">` +
    `<path d="${SIL}" fill="${c.body}"/>` +
    `<path d="${LIQ}" fill="${c.liquid}"/>` +
    `</g>`
  );
}

const svg = (vb, body, title = 'Wiltech Labs') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const markSvg = (c, id) => svg('0 0 64 64', flask(c, id));

// App-icon tile: teal rounded square, flask inset 6 units. rx 0 for apple-touch-icon.
function tileSvg({ rx = 14 } = {}) {
  const inset = 6;
  const scale = (64 - 2 * inset) / 64;
  return svg(
    '0 0 64 64',
    `<rect width="64" height="64" rx="${rx}" fill="${C.tile.bg}"/>` +
      `<g transform="translate(${inset} ${inset}) scale(${scale})">${flask(C.tile, 'wl-tile')}</g>`,
  );
}

// ---- small favicon: a separate drawing on a 16 px grid ----
// The 64-unit flask blurs below 48 px (neck, lip and W cut land between pixels). Here every
// horizontal/vertical edge sits on a whole pixel so only the walls and the W anti-alias.
// lip 6px (row 2), neck 4px (rows 3-5), body widens 1px per side every 2 rows to 12px (rows 6-13).
const PX_SIL = 'M5 2H11V3H10V6L14 14H2L6 6V3H5Z';
const PX_W = '2.5,8 6,13 8,10.5 10,13 13.5,8';
const PX_LIQ = 'M0 8H2.5L6 13L8 10.5L10 13L13.5 8H16V16H0Z';
function tile16Svg() {
  return svg(
    '0 0 16 16',
    `<defs><clipPath id="wl-px-clip"><path d="${PX_SIL}"/></clipPath></defs>` +
      `<rect width="16" height="16" rx="3.5" fill="${C.tile.bg}"/>` +
      `<g clip-path="url(#wl-px-clip)">` +
      `<path d="${PX_SIL}" fill="${C.tile.body}"/>` +
      `<path d="${PX_LIQ}" fill="${C.tile.liquid}"/>` +
      `<polyline points="${PX_W}" fill="none" stroke="${C.tile.bg}" stroke-width="1.15" stroke-linejoin="round"/>` +
      `<rect x="8" y="7" width="1" height="1" fill="${C.tile.bg}"/>` +
      `</g>`,
  );
}

// ---- wordmark, outlined ----
async function loadFont({ family, file }) {
  const cached = path.join(FONT_CACHE, file);
  if (!fs.existsSync(cached)) {
    fs.mkdirSync(FONT_CACHE, { recursive: true });
    // A non-browser user agent makes the Google Fonts CSS API answer with plain .ttf URLs.
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
        headers: { 'User-Agent': 'Wget/1.21' },
      })
    ).text();
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) throw new Error(`No .ttf URL in the Google Fonts response for ${family}`);
    fs.writeFileSync(cached, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return opentype.loadSync(cached);
}

function setText(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const parts = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    parts.push({ g, x });
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking;
    x += adv;
  });
  const bb = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const p of parts) {
    const b = p.g.getPath(p.x, 0, size).getBoundingBox();
    if (b.x1 === b.x2) continue;
    bb.x1 = Math.min(bb.x1, b.x1);
    bb.y1 = Math.min(bb.y1, b.y1);
    bb.x2 = Math.max(bb.x2, b.x2);
    bb.y2 = Math.max(bb.y2, b.y2);
  }
  const d = (ox, oy) => parts.map((p) => p.g.getPath(p.x + ox, oy, size).toPathData(2)).join('');
  return { d, bb };
}

function lockup(sora, mono) {
  const NAME_SIZE = 34;
  const LABS_SIZE = 13.5;
  const LABS_TRACK = LABS_SIZE * 0.46;
  const GAP = 8.5;
  const TEXT_X = 71;
  const PAD = 4;
  const capH = (font, size) => (font.tables.os2.sCapHeight * size) / font.unitsPerEm;

  const name = setText(sora, 'Wiltech', NAME_SIZE);
  const labs = setText(mono, 'LABS', LABS_SIZE, LABS_TRACK);
  const nameCap = capH(sora, NAME_SIZE);
  const labsCap = capH(mono, LABS_SIZE);
  // centre the two-line block on the flask's ink (y 8-55)
  const nameBase = (8 + 55) / 2 - (nameCap + GAP + labsCap) / 2 + nameCap;
  const labsBase = nameBase + GAP + labsCap;
  const nameDX = TEXT_X - name.bb.x1;
  const labsDX = TEXT_X - labs.bb.x1;

  const right = Math.max(nameDX + name.bb.x2, labsDX + labs.bb.x2);
  const vbX = 7.9 - PAD; // flask ink starts at x 7.9
  const vbY = Math.min(8, nameBase + name.bb.y1) - PAD;
  const vb = [vbX, vbY, right + PAD - vbX, Math.max(55, labsBase + labs.bb.y2) + PAD - vbY]
    .map((n) => +n.toFixed(2))
    .join(' ');

  return (c, id) =>
    svg(
      vb,
      flask(c, id) +
        `<path fill="${c.name}" d="${name.d(nameDX, nameBase)}"/>` +
        `<path fill="${c.labs}" d="${labs.d(labsDX, labsBase)}"/>`,
    );
}

// ---- output ----
const png = (s, width) =>
  new Resvg(s, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } })
    .render()
    .asPng();

// ICO with PNG-compressed entries (supported by every browser and by Windows since Vista).
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2); // palette size
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

async function main() {
  const [sora, mono] = await Promise.all([loadFont(FONTS.sora), loadFont(FONTS.mono)]);
  const lockupSvg = lockup(sora, mono);

  const svgs = {
    'logo.svg': lockupSvg(C.light, 'wl-logo'),
    'logo-dark.svg': lockupSvg(C.dark, 'wl-logo'),
    'logo-mark.svg': markSvg(C.light, 'wl-mark'),
    'logo-mark-dark.svg': markSvg(C.dark, 'wl-mark'),
    'logo-icon.svg': tileSvg(),
    'favicon.svg': tile16Svg(), // browsers draw an SVG favicon at 16/32 px
  };
  const icon = svgs['logo-icon.svg'];
  const files = {
    ...svgs,
    'logo.png': png(svgs['logo.svg'], 1200),
    'logo-dark.png': png(svgs['logo-dark.svg'], 1200),
    'logo-mark.png': png(svgs['logo-mark.svg'], 512),
    'logo-mark-dark.png': png(svgs['logo-mark-dark.svg'], 512),
    'logo-icon-512.png': png(icon, 512),
    'logo-icon-192.png': png(icon, 192),
    // iOS rounds its own corners and turns transparency black, so this one is a full-bleed square
    'apple-touch-icon.png': png(tileSvg({ rx: 0 }), 180),
    'favicon.ico': ico([
      { size: 16, data: png(tile16Svg(), 16) },
      { size: 32, data: png(tile16Svg(), 32) },
      { size: 48, data: png(icon, 48) },
    ]),
  };

  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, content] of Object.entries(files))
    fs.writeFileSync(path.join(OUT, name), content);
  for (const dir of APP_FAVICON_DIRS) {
    for (const name of APP_FAVICONS) fs.copyFileSync(path.join(OUT, name), path.join(dir, name));
  }

  const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
  console.log(`Wrote ${Object.keys(files).length} files to ${rel(OUT)}/`);
  console.log(`Copied ${APP_FAVICONS.join(', ')} to ${APP_FAVICON_DIRS.map(rel).join(', ')}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

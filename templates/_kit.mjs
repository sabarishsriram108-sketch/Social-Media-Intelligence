/**
 * Onam Cloud - design kit.
 * Shared visual language for every artboard: tokens -> CSS, motif geometry, and
 * the layout primitives ("surfaces") that the platform templates compose.
 *
 * Sizing model: every artboard sets `font-size: (canvasWidth / 100)px`, so `1rem`
 * is exactly 1% of the canvas width. One layout therefore holds its proportions
 * across a 1080px Instagram post and a 2560px YouTube banner with no per-size CSS.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..');

export const tokens = JSON.parse(
  readFileSync(join(ROOT, 'brand', 'onam-cloud.tokens.json'), 'utf8')
);

/**
 * Real Onam Cloud mark, if one has been dropped in.
 * Drop the logo at `brand/logo.svg`, `.png`, `.jpg` or `.webp` (checked in that
 * order - SVG wins if more than one exists), or upload it from the app's header.
 * Every artboard picks it up on its NEXT render - a function re-read from disk
 * each call, not a value cached at process start, so nothing needs restarting.
 * Until one exists, `mark()` draws the placeholder glyph below.
 *
 * Raster formats are embedded as a base64 data URI rather than a file path.
 * Artboards render from several different on-disk depths (out/<id>/*.html, the
 * merged PDF documents, the app's out/app/<jobId>/*.html) and a relative path
 * that is correct for one is wrong for the others - a data URI sidesteps that
 * entirely, at the cost of a few KB duplicated into every HTML file.
 */
export const LOGO_EXTS = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
const LOGO_MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

export function findLogoFile() {
  for (const ext of LOGO_EXTS) {
    const f = join(ROOT, 'brand', `logo${ext}`);
    if (existsSync(f)) return { file: f, ext };
  }
  return null;
}

export function brandLogo() {
  const found = findLogoFile();
  if (!found) return null;
  if (found.ext === '.svg') {
    return readFileSync(found.file, 'utf8').replace(/<\?xml[^>]*\?>/g, '').trim();
  }
  const b64 = readFileSync(found.file).toString('base64');
  return `<img src="data:${LOGO_MIME[found.ext]};base64,${b64}" alt="">`;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

/**
 * Fraunces's "4" carries a teardrop terminal that overlaps the next glyph at
 * any tracking below ~.055em at headline/display scale - confirmed across
 * weight 700/900 and opsz 40-144, on "44%", "24/7", "9.4x", "04", "10,000".
 * escDisplay() is esc() plus a safety span around every digit run, and is
 * used everywhere text renders in Fraunces (h1/h2, .editorial, .accent-text,
 * stat()) - never for eyebrows/captions/body, which are Plex and have no
 * collision risk; wrapping a lone digit there just to be safe would instead
 * show as a stray gap before its very next character (the .num span's own
 * trailing letter-spacing is visible even at a single-glyph boundary).
 */
const NUM_RUN = /[₹$]?\d+(?:[.,]\d+)*(?:[xX%])?(?:\/\d+)?/g;

export const escDisplay = (s) => esc(s).replace(NUM_RUN, (m) => `<span class="num">${m}</span>`);

/** Wrap the final N words of a headline in an accent underline. */
export const emphasise = (text, words = 0) => {
  const parts = String(text).split(' ');
  if (!words || words >= parts.length) return escDisplay(text);
  const head = parts.slice(0, parts.length - words).join(' ');
  const tail = parts.slice(parts.length - words).join(' ');
  return `${escDisplay(head)} <em class="mark">${escDisplay(tail)}</em>`;
};

export function palette(name) {
  const p = tokens.palettes[name || tokens.activePalette];
  if (!p) throw new Error(`Unknown palette "${name}". Available: ${Object.keys(tokens.palettes).join(', ')}`);
  return p;
}

/* ------------------------------------------------------------------ motifs */

/**
 * Contour field - the house pattern. Concentric rounded rects radiating from a
 * node, always anchored so the outer rings bleed off-canvas.
 */
/**
 * Deterministic pseudo-noise - same input always produces the same wobble, so
 * a re-render is pixel-identical. No Math.random() anywhere in this file.
 */
const noise1 = (seed) => {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Channel lines - the house motif. NOT concentric rings: a set of wavy,
 * unevenly-spaced bands, styled after the depth-contour lines on a nautical
 * chart of a backwater channel. This is Onam Cloud's literal business model
 * as a mark - a private channel, charted and surveyed, never the open sea.
 * Every 3rd-4th line carries a short cross-tick, like a sounding mark.
 */
export function channelLines({ cx = 100, cy = 0, rings = 9, gap = 9, rot = -12, stroke = 'currentColor', w = 1, opacity = 1, from = 8 } = {}) {
  const paths = [];
  const SPAN = 150; // half-width of each band, in the local (pre-rotate) frame
  const STEPS = 14;
  for (let i = 0; i < rings; i++) {
    const y = from + i * gap;
    const amp = gap * (0.3 + noise1(i * 3.1) * 0.22);
    const freq = 1.6 + noise1(i * 5.7) * 1.1;
    const phase = noise1(i * 2.3) * Math.PI * 2;
    const pts = [];
    for (let s = 0; s <= STEPS; s++) {
      const t = s / STEPS;
      const x = -SPAN + t * SPAN * 2;
      const yy = y + Math.sin(t * Math.PI * freq + phase) * amp + Math.sin(t * Math.PI * freq * 2.3 + phase * 1.7) * amp * 0.32;
      pts.push([x, yy]);
    }
    let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let s = 1; s < pts.length; s++) {
      const [px, py] = pts[s - 1];
      const [x, yy] = pts[s];
      const mx = (px + x) / 2, my = (py + yy) / 2;
      d += ` Q ${px.toFixed(2)} ${py.toFixed(2)}, ${mx.toFixed(2)} ${my.toFixed(2)}`;
    }
    d += ` T ${pts[pts.length - 1][0].toFixed(2)} ${pts[pts.length - 1][1].toFixed(2)}`;
    // fade the outer bands so the field dissolves rather than stopping
    const o = (1 - (i / rings) * 0.74).toFixed(3);
    paths.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${o}" stroke-linecap="round"/>`);
    if (i % 3 === 1) {
      const tickAt = 0.28 + noise1(i * 7.3) * 0.4;
      const [tx, ty] = pts[Math.round(tickAt * STEPS)];
      paths.push(`<line x1="${tx.toFixed(2)}" y1="${(ty - 1.6).toFixed(2)}" x2="${tx.toFixed(2)}" y2="${(ty + 1.6).toFixed(2)}" stroke="${stroke}" stroke-width="${w}" opacity="${o}"/>`);
    }
  }
  return `<svg class="motif" viewBox="0 0 100 100" preserveAspectRatio="none" style="opacity:${opacity}" aria-hidden="true">
    <g transform="translate(${cx} ${cy}) rotate(${rot})">${paths.join('')}</g>
  </svg>`;
}

/**
 * Waypoint route - a small number of deliberate markers connected by one
 * routed line, like a shipping lane on a chart. Replaces the generic
 * dot-matrix-plus-network-lines pattern with something sparser and more
 * intentional: this is a specific path, not a diagram of "the network."
 */
export function waypoints({ cols = 9, rows = 5, gap = 4.6, dot = 0.42, live = [[2, 1], [5, 2], [7, 4]], color = 'currentColor', accent = null, opacity = 0.5 } = {}) {
  const pts = live.map(([c, r]) => [c * gap, r * gap]);
  const mainColor = accent || color;

  // Route: straight segments with the corner slightly rounded, not a smoothed
  // curve - a chart route is plotted in legs, not a spline.
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;

  const parts = [`<path d="${d}" fill="none" stroke="${mainColor}" stroke-width="0.22" stroke-linejoin="round" opacity="0.6"/>`];

  // Distance ticks along each leg, evenly spaced - like nautical mile marks.
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // unit normal, for perpendicular ticks
    const n = Math.max(1, Math.round(len / (gap * 0.85)));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const px = x1 + dx * t, py = y1 + dy * t;
      parts.push(`<line x1="${(px - nx * 0.6).toFixed(2)}" y1="${(py - ny * 0.6).toFixed(2)}" x2="${(px + nx * 0.6).toFixed(2)}" y2="${(py + ny * 0.6).toFixed(2)}" stroke="${mainColor}" stroke-width="0.16" opacity="0.4"/>`);
    }
  }

  // Waypoint markers: hollow diamonds (chart-marker convention), the first
  // and last slightly larger to read as origin/destination.
  pts.forEach(([x, y], i) => {
    const end = i === 0 || i === pts.length - 1;
    const r = dot * (end ? 2.6 : 1.9);
    const fillOn = end;
    parts.push(
      `<path d="M ${x.toFixed(2)} ${(y - r).toFixed(2)} L ${(x + r).toFixed(2)} ${y.toFixed(2)} L ${x.toFixed(2)} ${(y + r).toFixed(2)} L ${(x - r).toFixed(2)} ${y.toFixed(2)} Z" ` +
      `fill="${fillOn ? mainColor : 'none'}" stroke="${mainColor}" stroke-width="0.2" opacity="${end ? 1 : 0.85}"/>`
    );
  });

  const w = cols * gap;
  const h = rows * gap;
  return `<svg class="nodegrid" viewBox="${-dot * 3} ${-dot * 3} ${w} ${h}" style="opacity:${opacity}" aria-hidden="true">${parts.join('')}</svg>`;
}

/**
 * Coordinate mark - a small cartographic registration crosshair (survey-mark
 * convention: a ring with a centred cross, tick to one side). A signature
 * accent for corners and frame edges, used sparingly.
 */
export function coordMark({ size = '2.4rem', color = 'currentColor', opacity = 0.55 } = {}) {
  return `<svg class="motif-wrap" style="width:${size};height:${size};opacity:${opacity}" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill="none" stroke="${color}" stroke-width="1.1"/>
    <line x1="12" y1="0" x2="12" y2="6" stroke="${color}" stroke-width="1.1"/>
    <line x1="12" y1="18" x2="12" y2="24" stroke="${color}" stroke-width="1.1"/>
    <line x1="0" y1="12" x2="6" y2="12" stroke="${color}" stroke-width="1.1"/>
    <line x1="18" y1="12" x2="24" y2="12" stroke="${color}" stroke-width="1.1"/>
    <circle cx="12" cy="12" r="1.1" fill="${color}"/>
  </svg>`;
}

// Old names, kept as aliases so nothing else in this file or the platform
// templates needs to change - they now draw the channel/waypoint motifs above.
export const contour = channelLines;
export const nodeGrid = waypoints;

/**
 * Onam Cloud mark - aperture square (one corner squared) holding concentric
 * arcs. PLACEHOLDER: swap `brand.logoSvg` in the brief to drop in the real mark.
 */
export function mark({ size = '3.4rem', fg = 'var(--a2)', ring = 'var(--a1)' } = {}) {
  return `<svg class="mark-glyph" style="width:${size};height:${size}" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M10 2h28a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V10a8 8 0 0 1 8-8Z" fill="none" stroke="${ring}" stroke-width="2.4" opacity="0.55"/>
    <path d="M2 10a8 8 0 0 1 8-8h8v16H2Z" fill="${ring}" opacity="0.9"/>
    <circle cx="27" cy="27" r="11" fill="none" stroke="${fg}" stroke-width="2.6"/>
    <circle cx="27" cy="27" r="5" fill="${fg}"/>
  </svg>`;
}

/** Author avatar: supplied image, else initials in the aperture frame. */
export function avatar(author = {}, { size = '5.2rem' } = {}) {
  if (author.avatar) return `<div class="aperture" style="width:${size};height:${size}"><img src="${esc(author.avatar)}" alt=""></div>`;
  const initials = String(author.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return `<div class="aperture avatar-initials" style="width:${size};height:${size};font-size:calc(${size} * .38)">${esc(initials)}</div>`;
}

export function logo({ name = 'Onam Cloud', size = '3.4rem', tone = 'light', logoSvg = null } = {}) {
  const supplied = logoSvg || brandLogo();
  const glyph = supplied
    ? `<span class="mark-slot" style="width:${size};height:${size}">${supplied}</span>`
    : mark({ size, fg: tone === 'dark' ? 'var(--aInk)' : 'var(--a2)', ring: tone === 'dark' ? 'var(--aInk)' : 'var(--a1)' });
  return `<div class="logo ${tone === 'dark' ? 'on-dark-type' : ''}">${glyph}<span class="logo-word">${esc(name)}</span></div>`;
}

/* ------------------------------------------------------------------- pieces */

export const eyebrow = (t) => (t ? `<p class="eyebrow"><i></i>${esc(t)}</p>` : '');
export const rule = (cls = '') => `<div class="rule ${cls}"></div>`;

export const footer = ({ handle, site, tone = 'light' } = {}) =>
  `<div class="ab-foot ${tone === 'dark' ? 'on-dark-type' : ''}">
     ${handle ? `<span>${esc(handle)}</span>` : '<span></span>'}
     ${site ? `<span class="site">${esc(site)}</span>` : ''}
   </div>`;

/** Swipe affordance for carousels. */
export const swipe = (label = 'Swipe') =>
  `<div class="swipe">${esc(label)}<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h20M15 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;

/** Big number with the unit kept optically subordinate. */
export function stat({ value, unit = '', caption = '', tone = 'dark' }) {
  return `<div class="stat ${tone === 'dark' ? 'on-dark-type' : ''}">
    <div class="stat-fig">${escDisplay(value)}${unit ? `<span class="stat-unit">${esc(unit)}</span>` : ''}</div>
    ${caption ? `<p class="stat-cap">${esc(caption)}</p>` : ''}
  </div>`;
}

/* ----------------------------------------------------------------- document */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")";

export function baseCSS(pal) {
  return `
:root{
  --ink:${pal.ink}; --ink2:${pal.ink2}; --ink3:${pal.ink3};
  --paper:${pal.paper}; --paper2:${pal.paper2}; --mist:${pal.mist};
  --a1:${pal.a1}; --a2:${pal.a2}; --aInk:${pal.aInk}; --on-accent:${pal.onAccent};
  --display:${tokens.type.display}; --body:${tokens.type.body}; --mono:${tokens.type.mono};
  /* Fraunces is variable (opsz 9-144, wght, SOFT, WONK). Three named instances,
     never a fourth - see brand/onam-cloud.tokens.json -> type.rules. */
  --fvs-display:'opsz' 144,'SOFT' 0,'WONK' 0;      /* headlines, big numerals - sharp, confident */
  --fvs-logo:'opsz' 26,'SOFT' 0,'WONK' 0;           /* wordmark at small sizes - sturdier stroke contrast */
  --fvs-editorial:'opsz' 56,'SOFT' 32,'WONK' 1;     /* italic pull-quotes only - warmer, slightly hand-set */
  --cut:${tokens.geometry.cutAngle};
  --r-sm:${tokens.geometry.radius.sm}; --r-md:${tokens.geometry.radius.md}; --r-lg:${tokens.geometry.radius.lg};
  --hair:${tokens.geometry.hairline};
  --grad:linear-gradient(115deg, var(--a1) 0%, var(--a2) 100%);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0b0b0e}
body{font-family:var(--body);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}

/* ---- artboard shell ---- */
.ab{position:relative;overflow:hidden;isolation:isolate;background:var(--ink);color:var(--paper);
    display:flex;flex-direction:column;line-height:1.2}
.ab::after{content:"";position:absolute;inset:0;background-image:${GRAIN};
    mix-blend-mode:overlay;opacity:.22;pointer-events:none;z-index:60}
.pad{padding:var(--pad, 8.5%);flex:1;min-height:0;display:flex;flex-direction:column;position:relative;z-index:20}
/* Grows to fill and centres its own content, so leftover height splits evenly
   above and below instead of pooling at the bottom. */
.stack{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;margin-top:2.4rem}
.stack.low{justify-content:flex-end}

/* ---- fields ---- */
.field-ink{background:
   radial-gradient(120% 80% at 88% 4%, ${hexA(pal.a1, 0.20)} 0%, transparent 58%),
   radial-gradient(90% 70% at 4% 96%, ${hexA(pal.a2, 0.13)} 0%, transparent 60%),
   linear-gradient(168deg, var(--ink2) 0%, var(--ink) 62%);color:var(--paper)}
.field-accent{background:var(--grad);color:var(--on-accent)}
.field-paper{background:linear-gradient(170deg, #fff 0%, var(--paper) 46%, var(--paper2) 100%);color:var(--ink)}

/* Signature cut: a ~12deg accent band across the lower field. --cut-a is where
   the diagonal meets the left edge, --cut-b the right. Never a full-canvas wash. */
.cut{position:absolute;inset:0;background:var(--grad);z-index:5;
     clip-path:polygon(0 var(--cut-a,72%), 100% var(--cut-b,56%), 100% 100%, 0 100%)}
.cut-hair{position:absolute;inset:0;z-index:6;background:${hexA(pal.a2, 0.55)};
     clip-path:polygon(0 var(--cut-a,72%), 100% var(--cut-b,56%), 100% calc(var(--cut-b,56%) + .35%), 0 calc(var(--cut-a,72%) + .35%))}

/* ---- motifs ---- */
.motif{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;color:var(--a1)}
.motif-wrap{position:absolute;z-index:2;pointer-events:none}
.nodegrid{display:block;width:100%;height:auto}

/* ---- type ---- */
.eyebrow{font-family:var(--mono);font-weight:500;font-size:1.3rem;letter-spacing:.14em;
   text-transform:uppercase;color:var(--a2);display:flex;align-items:center;gap:.9rem;line-height:1}
.eyebrow i{display:block;width:2.6rem;height:var(--hair);background:currentColor;flex:none}
.field-accent .eyebrow,.field-paper .eyebrow{color:inherit;opacity:.72}

h1,.h1{font-family:var(--display);font-variation-settings:var(--fvs-display);font-weight:700;
   letter-spacing:-.018em;line-height:1.04;font-size:var(--h1, 7.4rem);text-wrap:balance}
h2,.h2{font-family:var(--display);font-variation-settings:var(--fvs-display);font-weight:700;
   letter-spacing:-.015em;line-height:1.08;font-size:var(--h2, 5.2rem);text-wrap:balance}
.lede{font-size:var(--lede, 2.05rem);line-height:1.48;color:var(--mist);max-width:30ch;font-weight:400}
.field-paper .lede{color:${hexA(pal.ink, 0.66)}}
.field-accent .lede{color:${hexA(pal.aInk, 0.78)}}
.body{font-size:1.75rem;line-height:1.55}

/* Editorial italic - pull-quotes only, never a headline. A different optical
   cut of the same variable face reads as a deliberate second voice, not a
   second typeface - warmer and slightly hand-set against the sharp display cut. */
.editorial{font-family:var(--display);font-style:italic;font-weight:500;
   font-variation-settings:var(--fvs-editorial);letter-spacing:-.005em;text-wrap:balance}

/* A source, caption or technical label - always mono, never body. */
.spec{font-family:var(--mono);letter-spacing:.02em;font-variant-numeric:tabular-nums}

.mark{font-style:normal;position:relative;display:inline;
   background-image:var(--grad);background-repeat:no-repeat;
   background-size:100% .085em;background-position:0 98%;padding-bottom:.06em;
   -webkit-box-decoration-break:clone;box-decoration-break:clone}
.field-accent .mark,.field-paper .mark{background-image:linear-gradient(90deg,currentColor,currentColor);opacity:1}
.mark-wrapped{background-image:none;padding-bottom:0;text-decoration:underline;
   text-decoration-thickness:.055em;text-underline-offset:.16em;text-decoration-color:var(--a2)}
.field-paper .mark-wrapped{text-decoration-color:var(--a1)}
.field-accent .mark-wrapped{text-decoration-color:currentColor}
.accent-text{font-family:var(--display);font-variation-settings:var(--fvs-display);font-weight:700;
   background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}

/* Applied to every digit run by escDisplay() - see its comment above esc(). */
.num{letter-spacing:.055em}

.rule{height:.36rem;width:9rem;background:var(--grad);border-radius:999rem;flex:none}
.rule.hair{height:var(--hair);width:100%;background:currentColor;opacity:.18;border-radius:0}

/* ---- lockups ---- */
.logo{display:flex;align-items:center;gap:1.1rem;flex:none}
.mark-slot{display:block;flex:none}
.mark-slot svg,.mark-slot img{width:100%;height:100%;display:block;object-fit:contain}
.logo-word{font-family:var(--display);font-variation-settings:var(--fvs-logo);font-weight:700;
   font-size:2.15rem;letter-spacing:-.01em;color:var(--paper)}
.on-dark-type .logo-word,.field-accent .logo-word,.field-paper .logo-word{color:currentColor}

.ab-foot{display:flex;align-items:center;justify-content:space-between;gap:2rem;
   font-size:1.45rem;font-weight:500;letter-spacing:.02em;color:var(--mist);z-index:20}
.field-paper .ab-foot{color:${hexA(pal.ink, 0.5)}}
.field-accent .ab-foot{color:${hexA(pal.aInk, 0.62)}}
.ab-foot .site{font-weight:600;color:var(--a2)}
.field-paper .ab-foot .site,.field-accent .ab-foot .site{color:inherit;opacity:.9}
/* tone:'dark' on footer() - used when the footer sits on an accent-coloured
   surface inside an otherwise ink/paper artboard (e.g. below the diagonal
   cut). Without this, .ab-foot's default mist grey and .site's orange both
   sit near-invisible on the accent field they were placed over. */
.ab-foot.on-dark-type{color:${hexA(pal.aInk, 0.62)}}
.ab-foot.on-dark-type .site{color:inherit;opacity:.9}

.aperture{border-radius:var(--r-md);border-top-left-radius:0;overflow:hidden;
   background:var(--ink3);position:relative;flex:none}
.aperture img{width:100%;height:100%;object-fit:cover;display:block}

/* Icon chip - the aperture's squared-corner signature, sized down. Default
   background is a soft accent tint; pass bg:'transparent' for a bare icon. */
.icon-tile{border-radius:var(--r-sm);border-top-left-radius:0;flex:none;
   display:flex;align-items:center;justify-content:center;
   background:${hexA(pal.a1, 0.12)}}
.icon-tile .icon{width:100%;height:100%}
.avatar-initials{display:flex;align-items:center;justify-content:center;background:var(--grad);
   color:var(--on-accent);font-family:var(--display);font-variation-settings:var(--fvs-logo);
   font-weight:700;letter-spacing:-.01em;line-height:1}
.field-accent .avatar-initials{background:var(--aInk);color:var(--paper)}

.chip{display:inline-flex;align-items:center;gap:.7rem;padding:.75rem 1.6rem;border-radius:999rem;
   font-size:1.3rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
   border:var(--hair) solid ${hexA(pal.a2, 0.45)};color:var(--a2);background:${hexA(pal.a2, 0.08)}}
.field-paper .chip{border-color:${hexA(pal.ink, 0.2)};color:${hexA(pal.ink, 0.72)};background:transparent}
.field-accent .chip{border-color:${hexA(pal.aInk, 0.32)};color:${hexA(pal.aInk, 0.82)};background:${hexA(pal.aInk, 0.06)}}

/* ---- stat ---- */
/* The single most decorative type moment in the system. The value text arrives
   through esc(), which already wraps it in .num for the "4"-collision fix
   above - that inner span governs the digit tracking here, not this rule
   (letter-spacing on a flex container doesn't reach across a child boundary
   to the separate .stat-unit span anyway, so setting it here would be a dead
   declaration lying about what's doing the work). */
.stat-fig{font-family:var(--display);font-variation-settings:var(--fvs-display);font-weight:700;
   font-size:var(--fig, 16rem);line-height:.84;
   display:flex;align-items:flex-start;gap:.4rem;font-variant-numeric:tabular-nums}
.stat-unit{font-family:var(--mono);font-size:.3em;line-height:1;margin-top:.42em;
   font-weight:500;letter-spacing:0;opacity:.75}
.stat-cap{font-size:1.9rem;line-height:1.4;margin-top:1.6rem;max-width:32ch;opacity:.8;text-wrap:pretty}

/* ---- carousel ---- */
.swipe{display:inline-flex;align-items:center;gap:.9rem;font-size:1.4rem;font-weight:600;
   letter-spacing:.14em;text-transform:uppercase;color:var(--a2)}
.swipe svg{width:2.6rem;height:1.3rem}
.field-paper .swipe,.field-accent .swipe{color:inherit;opacity:.7}
.pagedot{position:absolute;z-index:30;display:flex;gap:.65rem}
.pagedot span{width:.7rem;height:.7rem;border-radius:999rem;background:currentColor;opacity:.28}
.pagedot span.on{opacity:1;width:2.4rem}

/* ---- safe-area guides (render-time only, stripped from exports) ---- */
.guide{position:absolute;z-index:90;border:1px dashed rgba(255,80,80,.85);pointer-events:none}
.guide::after{content:attr(data-label);position:absolute;top:.4rem;left:.6rem;font:600 1.1rem/1 var(--body);
   color:#ff5050;letter-spacing:.08em;text-transform:uppercase}
.no-guides .guide{display:none}
`;
}

/** #rrggbb + alpha -> rgba() */
export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** #rrggbb -> [r,g,b] as 0-1 fractions, for SVG feFuncR/G/B table values. */
function hex01(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let duotoneSeq = 0;

/**
 * Photography treatment, part 1: duotone().
 *
 * Onam Cloud has no photo library yet, and stock photography dropped onto an
 * artboard at native colour breaks the orange/black/white rule on contact.
 * This is the fix for the day a real photo exists: crush it to luminance,
 * then remap that luminance onto exactly two brand tones via an SVG
 * feComponentTransfer table - true photographic duotone (shadows -> dark
 * tone, highlights -> light tone), not a tint or a translucent colour wash.
 * `filter:url(#id)` is a real SVG filter, so it rasterises correctly through
 * Playwright same as any other CSS. Absolutely positioned - fills whatever
 * container establishes `position:relative` around it.
 */
export function duotone(src, { pal, shadow = null, highlight = null, alt = '', fit = 'cover' } = {}) {
  const id = `duo-${++duotoneSeq}`;
  const [dr, dg, db] = hex01(shadow || pal.ink);
  const [lr, lg, lb] = hex01(highlight || pal.a2);
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="${id}">
      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"/>
      <feComponentTransfer color-interpolation-filters="sRGB">
        <feFuncR type="table" tableValues="${dr.toFixed(3)} ${lr.toFixed(3)}"/>
        <feFuncG type="table" tableValues="${dg.toFixed(3)} ${lg.toFixed(3)}"/>
        <feFuncB type="table" tableValues="${db.toFixed(3)} ${lb.toFixed(3)}"/>
      </feComponentTransfer>
    </filter></defs></svg>
    <img src="${esc(src)}" alt="${esc(alt)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};filter:url(#${id}) contrast(1.05)"/>`;
}

/**
 * Photography treatment, part 2: heroArt().
 *
 * What stands in a photo's place until one exists. Not a texture or a
 * gradient - a full-bleed generative field built from the same channel-line
 * language as the rest of the system (three layered passes at different
 * scale/rotation/opacity, so it has real depth rather than reading as one
 * repeated motif), so an artboard with no photography still reads as
 * designed, not empty. Deterministic: a given seed always renders identical,
 * same as channelLines(). Drop it into any image slot as `background`.
 */
export function heroArt({ pal, seed = 1, tone = 'ink' } = {}) {
  const bg = tone === 'ink'
    ? `radial-gradient(120% 90% at 78% 8%, ${hexA(pal.a1, 0.35)} 0%, transparent 55%), linear-gradient(165deg, ${pal.ink2} 0%, ${pal.ink} 70%)`
    : `linear-gradient(165deg, #fff 0%, ${pal.paper2} 100%)`;
  const lineColor = tone === 'ink' ? pal.a2 : pal.ink;
  const layers = [
    channelLines({ cx: 10 + seed * 7, cy: -8, rot: -14, rings: 16, gap: 6.4, from: 4, stroke: lineColor, w: 0.22, opacity: tone === 'ink' ? 0.5 : 0.28 }),
    channelLines({ cx: 120 - seed * 5, cy: 60, rot: -10, rings: 12, gap: 9, from: 6, stroke: lineColor, w: 0.3, opacity: tone === 'ink' ? 0.28 : 0.16 }),
    channelLines({ cx: 40, cy: 118, rot: -16, rings: 10, gap: 8, from: 4, stroke: pal.a1, w: 0.26, opacity: 0.22 }),
  ];
  return `<div class="hero-art" style="position:absolute;inset:0;overflow:hidden;background:${bg}">${layers.join('')}</div>`;
}

/**
 * Wrap one artboard in a complete, standalone HTML document.
 * `fontHref` is resolved relative to the output file so previews work from disk.
 */
/**
 * Copy length is never known at design time, so every artboard shrinks its own
 * headline until it fits. Runs after webfonts settle, then flags __fitDone for
 * the renderer to await. Keeps static previews honest too.
 */
export const FIT_SCRIPT = `(function(){
  function shrink(){
    document.querySelectorAll('.ab').forEach(function(ab){
      var pad = ab.querySelector('.pad'); if(!pad) return;
      var cs = getComputedStyle(ab), base = {};
      ['--h1','--h2','--fig','--lede'].forEach(function(v){
        var raw = cs.getPropertyValue(v).trim();
        var m = raw.match(/^(-?[\\d.]+)([a-z%]*)$/i);
        if (m) base[v] = { n: parseFloat(m[1]), u: m[2] || 'px' };
      });
      var keys = Object.keys(base); if (!keys.length) return;
      var k = 1, guard = 0;
      // scrollHeight misses overflow on a centred flex column (it spills off both
      // ends), so measure real geometry against the pad's content box instead.
      function over(){
        // Measure against the ARTBOARD, not the pad: a flex pad can itself grow
        // past the board, which makes its own content box look roomy.
        //
        // Tolerance is proportional to canvas height, not a flat 1px: a display
        // face's line box (its internal ascent/descent) routinely sits a little
        // outside a razor-exact content-box edge - normal typographic leading,
        // invisible to the eye - and Fraunces's is noticeably taller than the
        // old geometric sans this was tuned against. A hairline check like that
        // reads a purely cosmetic few px as "overflowing" and can shrink a short
        // headline to a fraction of its size chasing a collision that was never
        // visible. Real overflow is a full line spilling into a neighbour, on
        // the order of tens of px at minimum - this tolerance is well under that.
        var ar = ab.getBoundingClientRect(), ps = getComputedStyle(pad);
        var tol = ar.height * 0.012;
        var top = ar.top + parseFloat(ps.paddingTop) - tol;
        var bottom = ar.bottom - parseFloat(ps.paddingBottom) + tol;
        var kids = pad.querySelectorAll('*');
        for (var i = 0; i < kids.length; i++) {
          var kr = kids[i].getBoundingClientRect();
          if (!kr.height && !kr.width) continue;
          if (kr.top < top || kr.bottom > bottom) return true;
        }
        // A .stack that overflows its own track spills over its siblings while
        // staying inside the pad - the headline lands on top of the logo. Only
        // the stack's own children reveal it. Same tolerance logic, scaled to
        // the stack's own box.
        var stacks = pad.querySelectorAll('.stack');
        for (var s = 0; s < stacks.length; s++) {
          var sr = stacks[s].getBoundingClientRect();
          var stol = Math.max(sr.height * 0.012, tol);
          var ch = stacks[s].children;
          for (var c = 0; c < ch.length; c++) {
            var cr = ch[c].getBoundingClientRect();
            if (!cr.height && !cr.width) continue;
            if (cr.top < sr.top - stol || cr.bottom > sr.bottom + stol) return true;
          }
        }
        return pad.scrollWidth > pad.clientWidth + 1;
      }
      while (over() && guard++ < 40 && k > 0.42) {
        k *= 0.96;
        keys.forEach(function(v){ ab.style.setProperty(v, (base[v].n * k).toFixed(3) + base[v].u); });
      }
      if (k < 1) ab.setAttribute('data-fitted', k.toFixed(2));
      ab.querySelectorAll('.mark').forEach(function(m){
        if (m.getClientRects().length > 1) m.classList.add('mark-wrapped');
      });
    });
    window.__fitDone = true;
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(shrink); }
  else { window.addEventListener('load', shrink); }
})();`;

export function page({ title, w, h, body, pal, extraCSS = '', fontHref = '../brand/fonts/fonts.css', guides = false }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${fontHref}">
<style>${baseCSS(pal)}
.ab{width:${w}px;height:${h}px;font-size:${(w / 100).toFixed(4)}px}
${extraCSS}</style>
</head><body class="${guides ? '' : 'no-guides'}">${body}
<script>${FIT_SCRIPT}</script>
</body></html>`;
}

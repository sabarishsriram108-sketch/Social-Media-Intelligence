/**
 * Render engine: content brief -> standalone HTML artboards -> exact-dimension
 * PNGs and a Canva-importable PDF.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { page, palette, tokens, ROOT, esc, baseCSS, FIT_SCRIPT } from '../templates/_kit.mjs';
import { resolve as resolveTpl } from './registry.mjs';

export const OUT = join(ROOT, 'out');

/** Merge brand + defaults down into each post so templates get one flat object. */
export function normalise(brief) {
  const brand = { name: 'Onum Cloud', ...(brief.brand || {}) };
  const pal = palette(brief.palette);
  const posts = (brief.posts || []).map((p, i) => ({
    ...(brief.defaults || {}),
    ...p,
    brand: { ...brand, ...(p.brand || {}) },
    _index: i,
  }));
  return { id: brief.id || 'brief', palette: brief.palette || tokens.activePalette, pal, brand, posts };
}

/** Produce the HTML documents for a brief without touching a browser. */
export function compose(brief, { guides = false } = {}) {
  const b = normalise(brief);
  const docs = [];
  for (const post of b.posts) {
    const { key, ab } = resolveTpl(post.platform, post.artboard);
    const frames = ab.render(post, b.pal);
    frames.forEach((f, i) => {
      const slug = [key, post.artboard, post.name || null, f.slide || (frames.length > 1 ? String(i + 1).padStart(2, '0') : null)]
        .filter(Boolean).join('_').replace(/[^a-zA-Z0-9._-]+/g, '-');
      docs.push({
        slug, platform: key, artboard: post.artboard, w: f.w, h: f.h,
        label: ab.label, legibility: ab.legibility || null,
        html: page({
          title: `${b.brand.name} - ${ab.label}`,
          w: f.w, h: f.h, body: f.body, pal: b.pal, guides,
          fontHref: relative(join(OUT, b.id), join(ROOT, 'brand', 'fonts', 'fonts.css')).split('\\').join('/'),
        }),
        body: f.body,
      });
    });
  }
  return { brief: b, docs };
}

/**
 * Launch Chromium. Honours CHROMIUM_PATH, then a pre-provisioned browser at
 * PLAYWRIGHT_BROWSERS_PATH, before falling back to Playwright's own download -
 * so the same code runs on a laptop and in a locked-down CI container.
 */
async function launch() {
  const { chromium } = await import('playwright');
  const { existsSync } = await import('node:fs');
  const candidates = [
    process.env.CHROMIUM_PATH,
    process.env.PLAYWRIGHT_BROWSERS_PATH && join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium'),
  ].filter(Boolean);
  const executablePath = candidates.find((c) => existsSync(c));
  return chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--no-sandbox', '--disable-dev-shm-usage'],
  });
}

/** Full render: writes HTML + PNG per artboard, a combined PDF, and a gallery. */
export async function render(brief, { guides = false, png = true, pdf = true, gallery = true, scale = 1 } = {}) {
  const { brief: b, docs } = compose(brief, { guides });
  const dir = join(OUT, b.id);
  await mkdir(dir, { recursive: true });

  for (const d of docs) await writeFile(join(dir, `${d.slug}.html`), d.html);

  const written = [];
  if (png || pdf) {
    const browser = await launch();
    try {
      for (const d of docs) {
        const p = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: scale });
        await p.goto('file://' + join(dir, `${d.slug}.html`), { waitUntil: 'load' });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForFunction(() => window.__fitDone === true, null, { timeout: 15000 });
        const fitted = await p.$eval('.ab', (el) => el.getAttribute('data-fitted'));
        if (fitted) d.fitted = Number(fitted);
        if (png) {
          const file = join(dir, `${d.slug}.png`);
          await p.locator('.ab').screenshot({ path: file });
          written.push({ ...d, png: file });
        }
        if (d.legibility) {
          // Sidebar-scale proof: if the headline dies here, it dies in the wild.
          const p2 = await browser.newPage({ viewport: { width: d.legibility, height: Math.round((d.h / d.w) * d.legibility) } });
          await p2.goto('file://' + join(dir, `${d.slug}.html`), { waitUntil: 'load' });
          await p2.waitForFunction(() => window.__fitDone === true, null, { timeout: 15000 });
          await p2.evaluate((w) => {
            const ab = document.querySelector('.ab');
            ab.style.transformOrigin = '0 0';
            ab.style.transform = `scale(${w / ab.offsetWidth})`;
            document.body.style.overflow = 'hidden';
          }, d.legibility);
          await p2.evaluate(() => document.fonts.ready);
          await p2.screenshot({ path: join(dir, `${d.slug}.legibility.png`) });
          await p2.close();
        }
        await p.close();
      }

      if (pdf) {
        // One PDF per platform+artboard group - this is the file Canva imports.
        const groups = new Map();
        for (const d of docs) {
          const k = `${d.platform}_${d.artboard}`;
          if (!groups.has(k)) groups.set(k, []);
          groups.get(k).push(d);
        }
        const fontHref = relative(dir, join(ROOT, 'brand', 'fonts', 'fonts.css')).split('\\').join('/');
        for (const [k, list] of groups) {
          const { w, h } = list[0];
          const merged = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fontHref}">
<style>${baseCSS(b.pal)}
.ab{width:${w}px;height:${h}px;font-size:${(w / 100).toFixed(4)}px}
@page{size:${w}px ${h}px;margin:0}
html,body{margin:0;padding:0;background:#fff}
.sheet{break-after:page;page-break-after:always;line-height:0}
.sheet:last-child{break-after:auto;page-break-after:auto}</style>
</head><body class="no-guides">${list.map((d) => `<div class="sheet">${d.body}</div>`).join('')}
<script>${FIT_SCRIPT}</script></body></html>`;
          // Write to disk first so the relative font href resolves (setContent has no base URL).
          const printFile = join(dir, `${k}.print.html`);
          await writeFile(printFile, merged);
          const file = join(dir, `${k}.pdf`);
          const p = await browser.newPage({ viewport: { width: w, height: h } });
          await p.goto('file://' + printFile, { waitUntil: 'load' });
          await p.evaluate(() => document.fonts.ready);
          await p.waitForFunction(() => window.__fitDone === true, null, { timeout: 20000 });
          await p.pdf({ path: file, width: `${w}px`, height: `${h}px`, printBackground: true, pageRanges: `1-${list.length}` });
          await p.close();
        }
      }
    } finally {
      await browser.close();
    }
  }

  if (gallery) await writeFile(join(dir, 'index.html'), galleryHTML(b, docs));
  return { dir, docs: written.length ? written : docs };
}

function galleryHTML(b, docs) {
  const byPlatform = new Map();
  for (const d of docs) {
    if (!byPlatform.has(d.platform)) byPlatform.set(d.platform, []);
    byPlatform.get(d.platform).push(d);
  }
  const sections = [...byPlatform.entries()].map(([plat, list]) => `
    <section><h2>${esc(plat)}</h2><div class="grid">
      ${list.map((d) => `<figure>
        <img src="${esc(d.slug)}.png" alt="${esc(d.label)}" loading="lazy">
        <figcaption><b>${esc(d.label)}</b><span>${d.w}&times;${d.h}</span></figcaption>
        ${d.legibility ? `<div class="leg"><img src="${esc(d.slug)}.legibility.png" alt="sidebar proof"><span>sidebar proof @${d.legibility}px</span></div>` : ''}
      </figure>`).join('')}
    </div></section>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(b.brand.name)} - ${esc(b.id)}</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0a0d16;color:#e8ecf6;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:32px}
h1{font-size:26px;letter-spacing:-.02em;margin:0 0 4px}
.sub{color:#8a97b8;margin:0 0 32px;font-size:13px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#5FE3C0;margin:34px 0 14px;
   border-top:1px solid #1c2540;padding-top:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
figure{margin:0;background:#111a2e;border:1px solid #1c2540;border-radius:12px;overflow:hidden}
figure img{width:100%;display:block;background:#000}
figcaption{padding:10px 12px;display:flex;justify-content:space-between;gap:8px;font-size:12px;align-items:baseline}
figcaption span{color:#8a97b8;font-variant-numeric:tabular-nums;flex:none}
.leg{padding:10px 12px;border-top:1px solid #1c2540;display:flex;align-items:center;gap:10px}
.leg img{width:210px;max-width:60%;border-radius:4px}
.leg span{font-size:11px;color:#8a97b8}
</style></head><body>
<h1>${esc(b.brand.name)} &mdash; ${esc(b.id)}</h1>
<p class="sub">Palette: <b>${esc(b.palette)}</b> &middot; ${docs.length} artboards &middot; rendered ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
${sections}</body></html>`;
}

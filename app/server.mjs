#!/usr/bin/env node
/**
 * Onam Cloud Studio - the application.
 *
 *   npm start   ->   http://127.0.0.1:4321
 *
 * Pick a platform, pick a post type, paste plain text. Claude writes the copy
 * into the artboard's fields, the render engine draws it, and one button pushes
 * it to Canva as an editable design.
 *
 * Binds to loopback only. It holds your Canva tokens - do not expose it.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename, normalize } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { exec } from 'node:child_process';
import { config as loadEnv } from 'dotenv';

// Load .env from the project root before anything reads ANTHROPIC_API_KEY or
// CANVA_*. Explicit call, not the `dotenv/config` auto-loader, so the path is
// correct regardless of the working directory `npm start` was run from.
loadEnv({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env'), quiet: true });

import { ROOT, tokens, findLogoFile, LOGO_EXTS } from '../templates/_kit.mjs';
import { render, OUT } from '../engine/render.mjs';
import { PLATFORMS, findType } from './catalog.mjs';
import { compose, hasApiKey } from './compose.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4321;
const APP_OUT = join(OUT, 'app');

const BRAND = {
  name: process.env.BRAND_NAME || 'Onam Cloud',
  handle: process.env.BRAND_HANDLE || '@onamcloud',
  site: process.env.BRAND_SITE || 'onamcloud.com',
};

/**
 * jobId -> { platform, type, palette, fields, artboards, text, createdAt, updatedAt }
 *
 * This is the portal's memory. Every generate and every edit writes straight
 * through to disk (job.json next to that post's rendered files), so closing
 * the window or restarting the app never loses work - the single-work-area
 * promise only holds if nothing here is throwaway.
 */
const jobs = new Map();
const jobDir = (jobId) => join(APP_OUT, jobId);
const jobFile = (jobId) => join(jobDir(jobId), 'job.json');

async function saveJob(job) {
  await mkdir(jobDir(job.jobId), { recursive: true });
  await writeFile(jobFile(job.jobId), JSON.stringify(job, null, 2));
}

async function loadHistory() {
  if (!existsSync(APP_OUT)) return;
  for (const entry of await readdir(APP_OUT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const f = jobFile(entry.name);
    if (!existsSync(f)) continue;
    try {
      const job = JSON.parse(await readFile(f, 'utf8'));
      jobs.set(job.jobId, job);
    } catch (e) {
      console.warn(`  ! Skipped unreadable history entry ${entry.name}: ${e.message}`);
    }
  }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.json': 'application/json' };

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'cache-control': 'no-store', ...headers });
  res.end(body);
};
const json = (res, code, obj) => send(res, code, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8' });

async function readBody(req, limit = 2_000_000) {
  const chunks = [];
  let n = 0;
  for await (const c of req) {
    n += c.length;
    if (n > limit) throw new Error('Request too large');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/* --------------------------------------------------------------- rendering */

/** Build a one-post brief from composed fields and draw it. */
async function renderJob({ jobId, platform, type, palette, fields }) {
  const brief = {
    id: `app/${jobId}`,
    palette,
    brand: BRAND,
    posts: [{ platform, artboard: type, ...stripMeta(fields) }],
  };
  const { docs } = await render(brief, { guides: false, pdf: true, gallery: false });
  return docs.map((d) => ({
    slug: d.slug, w: d.w, h: d.h, label: d.label,
    fitted: d.fitted || null,
    url: `/f/${jobId}/${d.slug}.png`,
  }));
}

/** Copy fields the templates consume; drop the app-only ones. */
function stripMeta(fields) {
  const { postCaption, hashtags, notes, ...rest } = fields || {};
  return rest;
}

/* ------------------------------------------------------------------ routes */

async function handle(req, res, url) {
  // ---- static app shell
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return send(res, 200, await readFile(join(HERE, 'ui.html')), { 'content-type': MIME['.html'] });
  }

  // ---- vendored brand fonts (works offline)
  if (req.method === 'GET' && url.pathname.startsWith('/brand/')) {
    const rel = normalize(url.pathname.slice('/brand/'.length)).replace(/^(\.\.[/\\])+/, '');
    const base = join(ROOT, 'brand');
    const file = join(base, rel);
    if (!file.startsWith(base) || !existsSync(file)) return send(res, 404, 'not found');
    const type = extname(file) === '.woff2' ? 'font/woff2' : extname(file) === '.css' ? 'text/css' : MIME[extname(file)] || 'application/octet-stream';
    return send(res, 200, await readFile(file), { 'content-type': type, 'cache-control': 'public, max-age=86400' });
  }

  // ---- rendered files
  if (req.method === 'GET' && url.pathname.startsWith('/f/')) {
    const rel = normalize(url.pathname.slice(3)).replace(/^(\.\.[/\\])+/, '');
    const file = join(APP_OUT, rel);
    if (!file.startsWith(APP_OUT) || !existsSync(file)) return send(res, 404, 'not found');
    return send(res, 200, await readFile(file), { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  }

  // ---- what the app can make
  if (req.method === 'GET' && url.pathname === '/api/catalog') {
    return json(res, 200, {
      platforms: PLATFORMS,
      palettes: Object.entries(tokens.palettes).map(([id, p]) => ({ id, label: p.label, story: p.story, a1: p.a1, a2: p.a2, ink: p.ink })),
      activePalette: tokens.activePalette,
      brand: BRAND,
      copywriter: hasApiKey() ? 'claude' : 'heuristic',
      hasLogo: !!findLogoFile(),
    });
  }

  // ---- text in, artboards out
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    const { platform, type, text, palette } = JSON.parse(await readBody(req));
    findType(platform, type); // validates, throws with a readable message
    const composed = await compose({ platform, type, text, brand: BRAND });
    const jobId = randomUUID().slice(0, 8);
    const pal = palette && tokens.palettes[palette] ? palette : tokens.activePalette;
    const artboards = await renderJob({ jobId, platform, type, palette: pal, fields: composed.fields });
    const now = new Date().toISOString();
    const job = { jobId, platform, type, palette: pal, fields: composed.fields, artboards, text, createdAt: now, updatedAt: now };
    jobs.set(jobId, job);
    await saveJob(job);
    return json(res, 200, { ...job, engine: composed.engine, degraded: composed.degraded || null });
  }

  // ---- edit a field, redraw
  if (req.method === 'POST' && url.pathname === '/api/rerender') {
    const { jobId, fields, palette } = JSON.parse(await readBody(req));
    const job = jobs.get(jobId);
    if (!job) return json(res, 404, { error: 'That draft has expired — generate it again.' });
    job.fields = { ...job.fields, ...fields };
    if (palette && tokens.palettes[palette]) job.palette = palette;
    job.artboards = await renderJob(job);
    job.updatedAt = new Date().toISOString();
    await saveJob(job);
    return json(res, 200, job);
  }

  // ---- everything generated so far, most recent first - the portal's memory
  if (req.method === 'GET' && url.pathname === '/api/history') {
    const list = [...jobs.values()]
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 200)
      .map((job) => {
        let label = `${job.platform} · ${job.type}`;
        try { const { platform: p, type: t } = findType(job.platform, job.type); label = `${p.label} · ${t.label}`; } catch {}
        const headline = job.fields?.headline || job.fields?.quote || job.fields?.value || job.text?.slice(0, 60) || '';
        return { ...job, label, headline };
      });
    return json(res, 200, { jobs: list });
  }

  // ---- remove a draft from history (the rendered files stay on disk either way)
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/history/')) {
    const jobId = url.pathname.slice('/api/history/'.length);
    if (!jobs.has(jobId)) return json(res, 404, { error: 'Not found.' });
    jobs.delete(jobId);
    await unlink(jobFile(jobId)).catch(() => {});
    return json(res, 200, { ok: true });
  }

  // ---- push to Canva
  if (req.method === 'POST' && url.pathname === '/api/canva/push') {
    const { jobId } = JSON.parse(await readBody(req));
    const job = jobs.get(jobId);
    if (!job) return json(res, 404, { error: 'That draft has expired — generate it again.' });
    const { importDesign } = await import('../engine/canva.mjs');
    const dir = join(APP_OUT, jobId);
    const pdfs = (await readdir(dir)).filter((f) => f.endsWith('.pdf'));
    if (!pdfs.length) return json(res, 500, { error: 'No PDF was produced for this draft.' });
    const designs = [];
    for (const f of pdfs) {
      const d = await importDesign(join(dir, f), `${BRAND.name} — ${job.platform} ${job.type}`);
      designs.push({ file: f, editUrl: d.urls?.edit_url || d.edit_url || null, id: d.id || null });
    }
    return json(res, 200, { designs });
  }

  // ---- can we push at all?
  if (req.method === 'GET' && url.pathname === '/api/canva/status') {
    const creds = !!(process.env.CANVA_CLIENT_ID && process.env.CANVA_CLIENT_SECRET);
    const tokened = existsSync(join(ROOT, '.canva-tokens.json'));
    return json(res, 200, {
      ready: creds && tokened, creds, tokened,
      hint: !creds
        ? 'Add CANVA_CLIENT_ID and CANVA_CLIENT_SECRET to .env — see docs/01-CONNECT-CANVA.md'
        : !tokened
          ? 'Run `node engine/cli.mjs push content/briefs/<any>.json` once in a terminal to complete Canva sign-in.'
          : 'Connected.',
    });
  }

  // ---- drop in the real logo (file upload from the header control, or a
  // pasted <svg>...</svg> string - either lands here)
  if (req.method === 'POST' && url.pathname === '/api/logo') {
    const body = await readBody(req, 8_000_000);
    const ctype = (req.headers['content-type'] || '').split(';')[0].trim();
    const byExt = { 'image/svg+xml': '.svg', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
    let ext = byExt[ctype];

    if (!ext) {
      // No usable content-type (a raw paste, or a browser that sent
      // application/octet-stream) - sniff the bytes instead of trusting the header.
      const head = body.subarray(0, 16);
      if (head.toString('utf8', 0, 5) === '<?xml' || body.toString('utf8', 0, 200).includes('<svg')) ext = '.svg';
      else if (head[0] === 0x89 && head[1] === 0x50) ext = '.png'; // \x89PNG
      else if (head[0] === 0xff && head[1] === 0xd8) ext = '.jpg'; // JPEG SOI marker
      else if (head.toString('ascii', 8, 12) === 'WEBP') ext = '.webp';
    }
    if (!ext) {
      return json(res, 400, { error: 'Unrecognised file. Use SVG, PNG, JPG or WebP.' });
    }

    // Only one brand/logo.* may exist - otherwise findLogoFile()'s SVG-first
    // preference would silently keep serving a stale file after a PNG upload.
    for (const e of LOGO_EXTS) {
      const stale = join(ROOT, 'brand', `logo${e}`);
      if (existsSync(stale)) await unlink(stale).catch(() => {});
    }
    await writeFile(join(ROOT, 'brand', `logo${ext}`), body);
    return json(res, 200, { ok: true, ext, note: 'Logo saved — every artboard uses it from your next render, no restart needed.' });
  }

  return send(res, 404, 'not found');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  try {
    await handle(req, res, url);
  } catch (e) {
    console.error(`  ✗ ${req.method} ${url.pathname}:`, e.message);
    if (!res.headersSent) json(res, 500, { error: e.message });
  }
});

await mkdir(APP_OUT, { recursive: true });
await loadHistory();

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`\n  ${BRAND.name} Studio`);
  console.log(`  ${url}\n`);
  console.log(`  Copywriter : ${hasApiKey() ? 'Claude (claude-opus-5)' : 'mechanical fallback — set ANTHROPIC_API_KEY for real copy'}`);
  console.log(`  Canva      : ${process.env.CANVA_CLIENT_ID ? 'credentials present' : 'not configured — see docs/01-CONNECT-CANVA.md'}`);
  console.log(`  Logo       : ${findLogoFile() ? 'yours, set' : 'placeholder mark (upload one from the app header)'}`);
  console.log(`  History    : ${jobs.size} draft${jobs.size === 1 ? '' : 's'} loaded from previous sessions\n`);

  // Open the browser automatically, like a real app rather than something you
  // start and then go find. Set NO_OPEN=1 to skip this (e.g. scripted restarts).
  if (!process.env.NO_OPEN) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"`
      : process.platform === 'darwin' ? `open "${url}"`
      : `xdg-open "${url}"`;
    exec(cmd, () => {}); // best-effort - a failure here should never stop the server
  }
});

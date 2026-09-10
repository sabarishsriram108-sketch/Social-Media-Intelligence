#!/usr/bin/env node
/**
 * Onam Cloud social intelligence CLI.
 *
 *   node engine/cli.mjs specs                      list every artboard + dimensions
 *   node engine/cli.mjs render <brief.json> [opts] render a brief to out/<id>/
 *   node engine/cli.mjs push   <brief.json> [opts] render, then push to Canva
 *   node engine/cli.mjs doctor                     check env + Canva credentials
 *
 * render options:
 *   --guides        draw safe-area guides (never use for final export)
 *   --palette=NAME  override the brief palette (ember | ignition | amber)
 *   --no-pdf        skip PDF assembly
 *   --scale=N       device pixel ratio for PNGs (default 1)
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config as loadEnv } from 'dotenv';

// Load .env from the project root regardless of the caller's working directory -
// on Windows in particular, people run this from all kinds of places. Explicit
// path + explicit call (rather than the `dotenv/config` auto-loader) so this is
// guaranteed to run before engine/canva.mjs reads CANVA_ENTERPRISE at import time.
loadEnv({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env'), quiet: true });

import { render } from './render.mjs';
import { listAll } from './registry.mjs';
import { tokens } from '../templates/_kit.mjs';

const [, , cmd, ...rest] = process.argv;
const flags = Object.fromEntries(
  rest.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);
const positional = rest.filter((a) => !a.startsWith('--'));

const die = (m) => { console.error(`\n  ✗ ${m}\n`); process.exit(1); };

async function loadBrief(path) {
  if (!path) die('Give me a brief: node engine/cli.mjs render content/briefs/<file>.json');
  const brief = JSON.parse(await readFile(path, 'utf8'));
  if (flags.palette) brief.palette = flags.palette;
  return brief;
}

switch (cmd) {
  case 'specs': {
    const rows = listAll();
    const pad = (s, n) => String(s).padEnd(n);
    console.log(`\n  Onam Cloud artboards (${rows.length} total)\n`);
    let current = '';
    for (const r of rows) {
      if (r.platform !== current) { current = r.platform; console.log(`  ${current.toUpperCase()}`); }
      console.log(`    ${pad(r.artboard, 16)} ${pad(`${r.w}x${r.h}`, 12)} ${r.label}${r.multi ? '  [multi-slide]' : ''}`);
    }
    console.log(`\n  Palettes: ${Object.keys(tokens.palettes).join(', ')}  (active: ${tokens.activePalette})\n`);
    break;
  }

  case 'render': {
    const brief = await loadBrief(positional[0]);
    const t0 = Date.now();
    const { dir, docs } = await render(brief, {
      guides: !!flags.guides,
      pdf: flags['no-pdf'] !== true,
      scale: Number(flags.scale) || 1,
    });
    console.log(`\n  ✓ ${docs.length} artboards rendered in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    // The fitter is a safety net. If it engaged hard, the copy is too long for
    // the artboard and the fix belongs in the brief, not the template.
    const tight = docs.filter((d) => d.fitted && d.fitted < 0.9);
    if (tight.length) {
      console.log(`\n  ! ${tight.length} artboard(s) needed heavy auto-shrink - shorten the copy:`);
      for (const d of tight) console.log(`      ${d.slug}  headline scaled to ${Math.round(d.fitted * 100)}%`);
    }
    console.log(`    ${dir}`);
    console.log(`    open ${dir}/index.html to review\n`);
    break;
  }

  case 'push': {
    const brief = await loadBrief(positional[0]);
    const { pushBrief } = await import('./canva.mjs');
    await pushBrief(brief, flags);
    break;
  }

  case 'doctor': {
    const { doctor } = await import('./canva.mjs');
    await doctor();
    break;
  }

  default:
    console.log(`
  Onam Cloud - Social Media Intelligence

    npm run specs                          list all artboards
    node engine/cli.mjs render <brief>     render to out/<id>/
    node engine/cli.mjs push   <brief>     render + push to Canva
    node engine/cli.mjs doctor             check Canva credentials

  Options: --guides  --palette=NAME  --no-pdf  --scale=N

  The app (npm start) is usually what you want: http://127.0.0.1:4321
`);
}

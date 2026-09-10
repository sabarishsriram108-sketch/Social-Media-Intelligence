/**
 * Canva Connect API client.
 *
 * Two push paths exist, and which one you get depends on your Canva plan:
 *
 *   DESIGN IMPORT  (Free / Pro / Teams / Enterprise)
 *     Render the artboard to PDF here, POST it to /v1/imports, and Canva opens
 *     it as an editable design. Text arrives as real text layers. This is the
 *     default path and the one this repo is built around.
 *
 *   BRAND TEMPLATE AUTOFILL  (Canva Enterprise only)
 *     Build each artboard once as a Canva Brand Template with named data fields,
 *     then POST field values to /v1/autofills. Canva composes the design itself,
 *     so the layout is locked and nobody can drift off-brand. Strictly better
 *     when available - see docs/01-CONNECT-CANVA.md for the field mapping.
 *
 * Auth is OAuth 2.0 with PKCE. Tokens land in .canva-tokens.json (gitignored).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { join, basename, extname } from 'node:path';
import { ROOT } from '../templates/_kit.mjs';

const API = 'https://api.canva.com/rest/v1';
const AUTHORIZE = 'https://www.canva.com/api/oauth/authorize';
const TOKEN_URL = `${API}/oauth/token`;
const TOKEN_FILE = join(ROOT, '.canva-tokens.json');

/**
 * Scopes must match the boxes ticked on the integration in Canva's developer
 * portal. Asking for a scope the integration does not have fails the whole
 * authorization with `invalid_scope` before the consent screen even appears.
 *
 * `brandtemplate:*` is Canva Enterprise only and cannot be enabled on a
 * non-Enterprise integration, so it is OFF by default - requesting it would
 * break sign-in for everyone else. Turn it on only if your portal offers it:
 *
 *   CANVA_ENTERPRISE=1        adds the brand-template scopes
 *   CANVA_SCOPES="a b c"      replaces the list entirely
 */
const CORE_SCOPES = [
  'asset:read', 'asset:write',
  'design:content:read', 'design:content:write', 'design:meta:read',
  'profile:read',
];
const ENTERPRISE_SCOPES = ['brandtemplate:meta:read', 'brandtemplate:content:read'];

export const SCOPES = process.env.CANVA_SCOPES
  ? process.env.CANVA_SCOPES.split(/[\s,]+/).filter(Boolean)
  : process.env.CANVA_ENTERPRISE === '1'
    ? [...CORE_SCOPES, ...ENTERPRISE_SCOPES]
    : CORE_SCOPES;

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* ------------------------------------------------------------------- tokens */

async function readTokens() {
  if (!existsSync(TOKEN_FILE)) return null;
  return JSON.parse(await readFile(TOKEN_FILE, 'utf8'));
}
async function writeTokens(t) {
  await writeFile(TOKEN_FILE, JSON.stringify({ ...t, obtained_at: Date.now() }, null, 2));
}

function clientCreds() {
  const id = process.env.CANVA_CLIENT_ID;
  const secret = process.env.CANVA_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      'CANVA_CLIENT_ID / CANVA_CLIENT_SECRET are not set.\n' +
      '  Create an integration at https://www.canva.com/developers/integrations\n' +
      '  then put the credentials in .env (see .env.example).'
    );
  }
  return { id, secret };
}

/** Browser consent once, then a refresh token does the rest. */
export async function authorize({ port = 8910 } = {}) {
  const { id, secret } = clientCreds();
  const verifier = b64url(randomBytes(64));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const state = b64url(randomBytes(16));
  const redirect = `http://127.0.0.1:${port}/oauth/redirect`;

  const url = `${AUTHORIZE}?${new URLSearchParams({
    code_challenge: challenge, code_challenge_method: 'S256',
    scope: SCOPES.join(' '), response_type: 'code',
    client_id: id, state, redirect_uri: redirect,
  })}`;

  console.log('\n  Open this URL and approve access:\n\n  ' + url + '\n');

  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const u = new URL(req.url, `http://127.0.0.1:${port}`);
      if (u.pathname !== '/oauth/redirect') { res.writeHead(404).end(); return; }
      const err = u.searchParams.get('error');
      if (err === 'invalid_scope') {
        console.error(
          '\n  ✗ Canva rejected the requested scopes.\n' +
          `    Requested: ${SCOPES.join(' ')}\n` +
          "    Tick exactly these boxes under Scopes on your integration, or unset\n" +
          '    CANVA_ENTERPRISE if your plan has no brand-template access.\n'
        );
      }
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(`<body style="font:16px system-ui;padding:40px">${err ? 'Authorisation failed: ' + err : 'Connected. You can close this tab.'}</body>`);
      server.close();
      if (err) reject(new Error(err));
      else if (u.searchParams.get('state') !== state) reject(new Error('OAuth state mismatch - aborting.'));
      else resolve(u.searchParams.get('code'));
    });
    server.listen(port);
    setTimeout(() => { server.close(); reject(new Error('Timed out waiting for Canva consent.')); }, 5 * 60_000);
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code_verifier: verifier,
      code, redirect_uri: redirect,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  const tokens = await res.json();
  await writeTokens(tokens);
  console.log('  ✓ Connected to Canva. Tokens stored in .canva-tokens.json\n');
  return tokens;
}

async function accessToken() {
  let t = await readTokens();
  if (!t) t = await authorize();
  const age = (Date.now() - (t.obtained_at || 0)) / 1000;
  if (age < (t.expires_in || 14400) - 120) return t.access_token;

  const { id, secret } = clientCreds();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh_token }),
  });
  if (!res.ok) {
    console.warn('  ! Refresh failed; re-authorising.');
    return (await authorize()).access_token;
  }
  const fresh = await res.json();
  await writeTokens(fresh);
  return fresh.access_token;
}

/* ---------------------------------------------------------------- transport */

async function api(path, { method = 'GET', body, headers = {}, raw } = {}) {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(raw ? {} : body ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Canva ${method} ${path} -> ${res.status}\n${text}`);
  return text ? JSON.parse(text) : {};
}

/** Canva's long-running jobs all follow the same shape: poll until not `in_progress`. */
async function poll(path, key, { tries = 40, waitMs = 1500 } = {}) {
  for (let i = 0; i < tries; i++) {
    const r = await api(path);
    const job = r.job || r[key] || r;
    if (job.status && job.status !== 'in_progress') {
      if (job.status === 'failed') throw new Error(`Canva job failed: ${JSON.stringify(job.error || job)}`);
      return job;
    }
    await new Promise((r2) => setTimeout(r2, waitMs));
  }
  throw new Error(`Canva job ${path} still running after ${(tries * waitMs) / 1000}s`);
}

/* ------------------------------------------------------------------- actions */

const MIME = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };

/** Import a rendered file as a new, editable Canva design. */
export async function importDesign(file, title) {
  const bytes = await readFile(file);
  const name = title || basename(file, extname(file));
  const job = await api('/imports', {
    method: 'POST', raw: true, body: bytes,
    headers: {
      'content-type': 'application/octet-stream',
      'Import-Metadata': JSON.stringify({
        title_base64: Buffer.from(name).toString('base64'),
        mime_type: MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      }),
    },
  });
  const id = job.job?.id || job.id;
  const done = await poll(`/imports/${id}`, 'job');
  return done.result?.designs?.[0] || done.designs?.[0] || done;
}

/** Upload a PNG/JPG as a reusable asset (for use inside existing designs). */
export async function uploadAsset(file, name) {
  const bytes = await readFile(file);
  const job = await api('/asset-uploads', {
    method: 'POST', raw: true, body: bytes,
    headers: {
      'content-type': 'application/octet-stream',
      'Asset-Upload-Metadata': JSON.stringify({
        name_base64: Buffer.from(name || basename(file)).toString('base64'),
      }),
    },
  });
  const id = job.job?.id || job.id;
  const done = await poll(`/asset-uploads/${id}`, 'job');
  return done.asset || done;
}

export const listBrandTemplates = () => api('/brand-templates?limit=100');
export const templateDataset = (id) => api(`/brand-templates/${id}/dataset`);

/** Enterprise path: compose a design from a locked Brand Template. */
export async function autofill(brandTemplateId, data, title) {
  const job = await api('/autofills', {
    method: 'POST',
    body: { brand_template_id: brandTemplateId, title, data },
  });
  const id = job.job?.id || job.id;
  const done = await poll(`/autofills/${id}`, 'job');
  return done.result?.design || done.design || done;
}

export async function exportDesign(designId, format = 'png') {
  const job = await api('/exports', { method: 'POST', body: { design_id: designId, format: { type: format } } });
  const id = job.job?.id || job.id;
  const done = await poll(`/exports/${id}`, 'job');
  return done.urls || done.result?.urls || done;
}

/* --------------------------------------------------------------------- flows */

/**
 * Render a brief, then push each artboard group into Canva as an editable design.
 * `--assets` additionally uploads the flat PNGs to the asset library.
 */
export async function pushBrief(brief, flags = {}) {
  const { render } = await import('./render.mjs');
  console.log('\n  Rendering artboards...');
  const { dir, docs } = await render(brief, { guides: false, pdf: true });

  const groups = [...new Set(docs.map((d) => `${d.platform}_${d.artboard}`))];
  const results = [];
  console.log(`  Pushing ${groups.length} design(s) to Canva...\n`);

  for (const g of groups) {
    const pdf = join(dir, `${g}.pdf`);
    if (!existsSync(pdf)) { console.log(`    - ${g}: no PDF, skipped`); continue; }
    try {
      const design = await importDesign(pdf, `${brief.id} - ${g}`);
      const url = design.urls?.edit_url || design.edit_url || '(open in Canva)';
      console.log(`    ✓ ${g}\n      ${url}`);
      results.push({ group: g, design });
    } catch (e) {
      console.log(`    ✗ ${g}: ${e.message.split('\n')[0]}`);
    }
  }

  if (flags.assets) {
    console.log('\n  Uploading flat PNGs to the asset library...');
    for (const d of docs) {
      const png = join(dir, `${d.slug}.png`);
      if (existsSync(png)) { await uploadAsset(png, `${brief.id}-${d.slug}`); console.log(`    ✓ ${d.slug}.png`); }
    }
  }

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'canva-push.json'), JSON.stringify({ pushedAt: new Date().toISOString(), results }, null, 2));
  console.log(`\n  Done. Edit in Canva, then export and post.\n`);
  return results;
}

/** Report exactly what this machine can and cannot do against Canva right now. */
export async function doctor() {
  console.log('\n  Canva connection check\n  ----------------------');
  const hasCreds = !!(process.env.CANVA_CLIENT_ID && process.env.CANVA_CLIENT_SECRET);
  console.log(`  Client credentials : ${hasCreds ? 'present' : 'MISSING (set CANVA_CLIENT_ID / CANVA_CLIENT_SECRET)'}`);
  const t = await readTokens();
  console.log(`  Stored tokens      : ${t ? 'yes' : 'no - run `node engine/cli.mjs push <brief>` to authorise'}`);
  // Most useful precisely when nothing is configured yet - these two strings are
  // what you copy into the developer portal, and the usual cause of a failed sign-in.
  console.log(`  Redirect URL       : http://127.0.0.1:8910/oauth/redirect`);
  console.log(`  Scopes requested   : ${SCOPES.join(' ')}`);
  console.log(`  ${'-'.repeat(18)}   both must match the integration in Canva's portal exactly`);
  if (!hasCreds || !t) { console.log('\n  See docs/01-CONNECT-CANVA.md\n'); return; }

  try {
    const me = await api('/users/me');
    console.log(`  Account            : ${me.team_user?.user_id || 'connected'}`);
  } catch (e) { console.log(`  Account            : FAILED - ${e.message.split('\n')[0]}`); }

  try {
    const bt = await listBrandTemplates();
    const n = (bt.items || []).length;
    console.log(`  Brand templates    : ${n} visible -> autofill path ${n ? 'AVAILABLE' : 'unavailable'}`);
  } catch {
    console.log('  Brand templates    : not available (Canva Enterprise only) -> using design-import path');
  }
  console.log('\n  Design import path : available on all plans\n');
}

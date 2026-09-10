# Onum Cloud — Social Media Intelligence

Brief in, on-brand artboards out, pushed to Canva as editable designs.

A content system for Onum Cloud across **Instagram, LinkedIn, X and YouTube** — 4 platform template families, 18 artboards, one design language, and a pipeline that takes a JSON brief to a finished Canva design you can still tweak before posting.

```
  idea ──► brief (JSON) ──► render ──► review ──► Canva ──► post
```

## Quick start

```bash
npm install
npm run specs                                             # what you can make
node engine/cli.mjs render content/briefs/dpdp-data-residency.json
open out/dpdp-data-residency/index.html                   # contact sheet
```

To push into Canva, see **[docs/01-CONNECT-CANVA.md](docs/01-CONNECT-CANVA.md)**, then:

```bash
cp .env.example .env      # add your Canva integration credentials
node engine/cli.mjs doctor
node engine/cli.mjs push content/briefs/dpdp-data-residency.json
```

## What's in the box

| Platform | Artboards |
|---|---|
| **Instagram** | `feed-statement`, `feed-data`, `feed-insight`, `carousel`, `reel-cover` |
| **LinkedIn** | `post`, `evidence`, `quote`, `carousel`, `page-banner`, `profile-banner` |
| **X** | `card`, `metric`, `thread-cover`, `header` |
| **YouTube** | `thumbnail`, `banner`, `community` |

Three dual-tone palettes — **Deep Current** (default), **Signal**, **Monsoon** — swappable per campaign with `--palette=`.

## Why it's built this way

**Templates are code, not files in a design tool.** A template that lives only in Canva drifts: someone nudges a headline, someone else picks a slightly different blue, and six weeks later the grid no longer reads as one brand. Here the layout is versioned, reviewable in a diff, and reproduces byte-identically.

**The renderer is also the QA.** Copy length is never known when a layout is designed, so every artboard measures itself and shrinks its headline until it fits — then reports which ones it had to rescue. That warning is the signal that the copy is wrong for the canvas, not the template. YouTube thumbnails additionally render a 210px sidebar proof, because that is the size the decision is actually made at.

**Canva is the last mile, not the source of truth.** Push produces an editable design so a human can swap a photo or nudge a line before posting. Anything that should persist goes back into the brief or the template.

## Layout

```
brand/          design tokens, self-hosted fonts, the palettes
templates/      _kit.mjs (shared language) + one module per platform
engine/         render (Playwright), Canva Connect client, CLI
content/briefs/ campaign briefs — the only file you normally write
docs/           connect · workflow · brand system · content contract
out/            renders (gitignored)
```

## Docs

- **[01 — Connecting Claude and Canva](docs/01-CONNECT-CANVA.md)** — MCP connector vs Connect API, plan gates, which push path you get
- **[02 — The operating model](docs/02-WORKFLOW.md)** — the weekly loop, cadence, the rules that keep the grid coherent
- **[03 — The visual system](docs/03-BRAND-SYSTEM.md)** — palettes, type, motifs, the Instagram grid rhythm
- **[04 — The content contract](docs/04-CONTENT-CONTRACT.md)** — every brief field, copy limits, commands

## Status

Design system, renderer and 18 artboards are built and visually verified. The Canva Connect client is written against Canva's documented API shapes but **has not been run against a live Canva account** — that needs your credentials. `node engine/cli.mjs doctor` reports exactly what your plan allows before you rely on it.

Brand colours, the wordmark and the mark are a **proposed** system, not supplied assets. Swap `brand/onum-cloud.tokens.json` and everything reskins.

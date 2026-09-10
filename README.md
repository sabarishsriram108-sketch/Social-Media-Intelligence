# Onam Cloud — Social Media Studio

Pick a platform. Pick a post type. Paste plain text. Get an on-brand, editable Canva design.

Your single work area for this — runs on your own computer, nothing hosted, nothing lost. Every draft is saved automatically and reopenable from **History**.

**Windows:** double-click `Start Onam Cloud Studio.bat`.

**Terminal:**
```bash
npm install
npm start          # http://127.0.0.1:4321 — opens your browser automatically
```

Full walkthrough: [docs/00-THE-APP.md](docs/00-THE-APP.md).


## What it does

```
  platform ──► post type ──► your plain text ──► Claude writes the copy
                                                        │
                              editable Canva design ◄── artboards rendered
```

**22 artboards across 5 platforms**, one design language, and a copywriter that knows the brand voice and the exact length each layout was built for.

| Platform | Post types |
|---|---|
| **Instagram** | Feed post (Statement · Number · Insight), Carousel, Reel / Story cover |
| **LinkedIn** | Post, Evidence card, Quote card, Document carousel, Page banner, Profile banner |
| **Facebook** | Feed post, Link / share card, Page cover, Story |
| **X (Twitter)** | Timeline card, Metric card, Thread cover, Profile header |
| **YouTube** | Video thumbnail, Channel banner, Community post |

Orange, black and white throughout — three tonal palettes (**Ember**, **Ignition**, **Amber**), swappable per campaign.

## Connecting Canva

Two connections, different jobs — full setup in **[docs/01-CONNECT-CANVA.md](docs/01-CONNECT-CANVA.md)**.

1. **Canva AI Connector (MCP)** — for ad-hoc work in a chat with Claude. Add `https://mcp.canva.com/mcp` as a custom connector in Claude, approve the OAuth step, enable it in the chat. Two minutes.
2. **Canva Connect API** — what this app uses. Create an integration at [canva.com/developers/integrations](https://www.canva.com/developers/integrations), register the redirect URL `http://127.0.0.1:8910/oauth/redirect`, put the client ID and secret in `.env`, and sign in once. The app's Canva panel tells you which step you are on.

The push path is **design import**, which works on every Canva plan including free — the artboard goes across as a real, editable design with live text layers. Brand-template autofill (locked layouts, fields pushed by API) is strictly better but is **Canva Enterprise only**; the upgrade path is documented.

## Setup checklist

| | Without it | Command |
|---|---|---|
| `ANTHROPIC_API_KEY` | The app mechanically splits your text instead of writing it | `cp .env.example .env` |
| Canva credentials | Everything works except the push button | `node engine/cli.mjs doctor` |
| `brand/logo.svg` | Artboards draw a placeholder mark | Save the real logo to that path |

## Why it is built this way

**Templates are code, not files in a design tool.** A template that lives only in Canva drifts — someone nudges a headline, someone else picks a slightly different orange, and six weeks later the grid no longer reads as one brand. Here the layout is versioned, reviewable in a diff, and reproduces identically every time.

**The renderer is also the QA.** Copy length is never known when a layout is designed, so every artboard measures itself and shrinks its headline until it fits — then reports it. That warning means the copy is wrong for the canvas, not the template. YouTube thumbnails additionally render a 210px sidebar proof, because that is the size the click decision is actually made at.

**Canva is the last mile, not the source of truth.** The app stops at "editable design" so a human can swap a photo or nudge a line before posting. Anything that should persist goes back into the brief or the template.

## Batch mode

For a whole week in one file, skip the app:

```bash
npm run specs                                    # every artboard + dimensions
node engine/cli.mjs render content/briefs/dpdp-data-residency.json
open out/dpdp-data-residency/index.html          # contact sheet
node engine/cli.mjs push content/briefs/dpdp-data-residency.json
```

## Layout

```
app/            the application - server, UI, catalog, copywriter
brand/          design tokens, palettes, self-hosted fonts, logo.svg slot
templates/      _kit.mjs (shared visual language) + one module per platform
engine/         render (Playwright), Canva Connect client, CLI
content/briefs/ batch campaign briefs
docs/           the app · connect Canva · operating model · brand system · content contract
out/            renders (gitignored)
```

## Docs

- **[00 — The application](docs/00-THE-APP.md)** — the four steps, status chips, dropping in the logo
- **[01 — Connecting Claude and Canva](docs/01-CONNECT-CANVA.md)** — both connections, plan gates, which push path you get
- **[02 — The operating model](docs/02-WORKFLOW.md)** — weekly loop, cadence, the rules that keep the grid coherent
- **[03 — The visual system](docs/03-BRAND-SYSTEM.md)** — palettes, type, motifs, the Instagram grid rhythm
- **[04 — The content contract](docs/04-CONTENT-CONTRACT.md)** — every brief field, copy limits, commands

## Status

The design system, renderer, application and 22 artboards are built and visually verified. Two things are written against documented API surfaces but **not yet executed against live accounts**, because both need your credentials:

- The Claude copywriting path (`app/compose.mjs`) — the app's mechanical fallback is verified end to end; the Claude path needs `ANTHROPIC_API_KEY`.
- The Canva Connect client (`engine/canva.mjs`) — run `node engine/cli.mjs doctor` before relying on it.

Brand colours follow the orange / black / white direction supplied; exact hex values and the mark are proposed pending the official kit. Save the real logo to `brand/logo.svg` and everything reskins.

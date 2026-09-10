# The operating model

The point of this repo is that a post should cost you a paragraph of thinking, not an afternoon in a design tool.

**Most of the time you want the app, not the CLI.** `npm start`, pick a platform and a post type, paste your text — see [docs/00-THE-APP.md](00-THE-APP.md). The CLI below is for batching a whole week in one file.

```
  idea ──► brief (JSON) ──► render ──► review ──► Canva ──► post
           you + Claude      engine     you        editable    scheduler
                                                   design
```

## Step by step

**1. Write the brief.** One JSON file per campaign in `content/briefs/`. One `posts[]` entry per artboard you want. Field reference: `docs/04-CONTENT-CONTRACT.md`. In practice you describe the idea to Claude and it writes the brief — the schema exists so the output is checkable, not so you type it by hand.

**2. Render.**

```bash
node engine/cli.mjs render content/briefs/my-campaign.json
open out/my-campaign/index.html
```

You get, per artboard: a standalone `.html`, an exact-dimension `.png`, and a `.pdf` per artboard group. Plus a contact-sheet gallery. YouTube thumbnails also render a 210px "sidebar proof" — if the headline dies there, it dies in the wild.

**3. Review — the only human gate that matters.** Read the gallery. The renderer warns when it had to auto-shrink a headline past 90%; that means the copy is too long for the canvas and the fix belongs in the brief, not the template.

**4. Push to Canva.**

```bash
node engine/cli.mjs push content/briefs/my-campaign.json
```

Each artboard group becomes an editable Canva design and the edit URLs are printed and written to `out/<id>/canva-push.json`.

**5. Final edit and post.** Swap a photo, nudge a line, then export from Canva and schedule. The Canva design is the last mile, not the source of truth — if a change should persist, make it in the brief or the template and re-render.

## Cadence that actually holds

| | Cadence | Artboards | Owner |
|---|---|---|---|
| LinkedIn | 3x / week | `post`, `evidence`, `quote` | Strategy |
| Instagram | 4x / week | cycle `feed-statement` → `feed-data` → `feed-insight` | Marketing |
| X | Daily | `card`, `metric`, `thread-cover` | Strategy |
| Facebook | 2x / week | `post`, `link-card` | Marketing |
| YouTube | Fortnightly | `thumbnail` + `community` | Content |
| Carousels | 1x / week, alternating IG and LinkedIn | `carousel` | Strategy |

Batch weekly: one brief covering the week, one render, one review, one push. That is roughly 40 minutes for ~12 assets, versus a day of piecemeal design requests.

## Rules that keep the grid coherent

- **Instagram cycles STATEMENT → DATA → INSIGHT.** The profile grid then forms a diagonal black/orange/white rhythm on its own. Break the cycle and the grid stops reading as designed.
- **One palette per campaign.** Ember unless there is a reason; switch between campaigns, never within one.
- **Every number carries its basis.** `source` is not optional on `feed-data`, `evidence` or `metric`. Unsourced numbers are how a strategy team loses an argument.
- **The image repeats the hook, it does not replace the caption.** Especially on LinkedIn, where the first two lines of copy carry the click.

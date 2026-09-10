# The content contract

The app writes this for you — you only need this document if you are hand-writing a batch brief or wiring something new. A brief is one JSON file describing one campaign. `content/briefs/dpdp-data-residency.json` is a complete worked example covering all 18 artboards.

```json
{
  "id": "campaign-slug",
  "palette": "ember",
  "brand": { "name": "Onam Cloud", "handle": "@onamcloud", "site": "onamcloud.com", "logoSvg": null },
  "defaults": { "tag": "Compliance" },
  "posts": [ { "platform": "linkedin", "artboard": "post", "headline": "..." } ]
}
```

`defaults` merges into every post; a post's own fields win. `brand.logoSvg` accepts a raw SVG string to replace the placeholder mark.

## Fields

| Field | Type | Used by | Notes |
|---|---|---|---|
| `platform` | `instagram` \| `linkedin` \| `facebook` \| `x` \| `youtube` | all | `ig`, `li`, `fb`, `twitter`, `yt` also accepted |
| `artboard` | string | all | see `npm run specs` |
| `eyebrow` | string | most | Uppercased automatically. Keep under ~40 chars. |
| `headline` | string | most | The one idea. |
| `emphasise` | int | most | Accent-underline the last N words. `0` disables. |
| `lede` | string | most | Standfirst, 1–2 sentences. Ignored on banners. |
| `tag` | string | most | Chip, top-right. |
| `value` / `unit` | string | data artboards | e.g. `"41"` / `"%"`. Unit stays optically subordinate. |
| `caption` | string | data artboards | What the number means. |
| `source` | string | data artboards | **Not optional.** State n, period, basis. |
| `breakdown` | `[{label,value,pct}]` | `linkedin/evidence`, `x/metric` | `pct` is bar fill 0–100. Max 3–4. |
| `points` | `string[]` | `linkedin/post` | Max 3. |
| `author` | `{name, role, avatar?}` | insight / post / quote | No `avatar` → initials in the aperture frame. |
| `quote` | string | `linkedin/quote` | Falls back to `headline`. |
| `slides` | `[{title, body, stat?, statLabel?}]` | carousels | One artboard per entry, plus cover and CTA. |
| `cta` | `{eyebrow, headline, action}` | carousels | `action` is the URL or instruction on the button. |
| `subject` | path/URL | `youtube/thumbnail` | Optional cut-out image, right third. |
| `episode`, `duration`, `cadence`, `threadLength` | string/int | assorted | Small metadata labels. |

## Copy limits that hold

These are what the layouts are designed around, not hard caps — the fitter will rescue you, and then tell on you.

| Artboard | Headline | Standfirst |
|---|---|---|
| `instagram/feed-statement` | ≤ 9 words | ≤ 20 words |
| `instagram/feed-data` | — (`caption` ≤ 22 words) | — |
| `linkedin/post` | ≤ 12 words | ≤ 22 words, + 3 points |
| `x/card` | ≤ 10 words | ≤ 25 words |
| `facebook/post` | ≤ 11 words | ≤ 24 words, + 3 points |
| `facebook/link-card` | ≤ 8 words | ≤ 24 words |
| `youtube/thumbnail` | **≤ 5 words**, no word over ~11 chars | — |
| `*/carousel` slide | ≤ 6 words | ≤ 35 words |
| banners | ≤ 6 words | ignored |

## Commands

```bash
npm start                                        # the application
npm run specs                                    # every artboard + dimensions
node engine/cli.mjs render <brief>               # render to out/<id>/
node engine/cli.mjs render <brief> --guides      # draw safe-area guides
node engine/cli.mjs render <brief> --palette=ignition
node engine/cli.mjs push <brief>                 # render + push to Canva
node engine/cli.mjs push <brief> --assets        # also upload flat PNGs
node engine/cli.mjs doctor                       # what Canva will let you do
```

Never export with `--guides` on — the safe-area overlays are a review aid only.

# Onam Cloud — the visual system

> **Assumption, stated plainly.** The orange / black / white direction is the client's. The exact hex values, the type pairing and the mark are proposed pending the official kit. Everything is token-driven: replace the `palettes.*` block in `brand/onam-cloud.tokens.json`, drop the real logo in via the app's header (or place it at `brand/logo.svg`/`.png`/`.jpg`/`.webp`), and all 23 artboards reskin with no template edits. Nothing downstream assumes these specific values.

## The idea

B2B cloud in India is a wall of the same blue, which makes orange a genuine asset rather than a preference. The system is built to be recognisable at thumbnail size and credible in front of a CIO, which pushes in one direction: **near-black ground, one orange ramp running through it, white for the editorial field.**

Three rules do most of the work:

1. **Orange, black and white. Nothing else.** No second accent, no supporting hue, ever.
2. **One idea per artboard.** If it needs two headlines it is two posts.
3. **The pattern is structural, never decorative filler.** The channel motif always anchors off-canvas, so it reads as a field the artboard is cut from rather than a sticker.

## Palettes

Orange, black and white. No fourth hue anywhere in the system — that is the constraint, not a starting point. The three palettes are tonal variants of the same idea, so a campaign can shift register without leaving the brand.

| | Ground | Orange ramp | Use it for |
|---|---|---|---|
| **Ember** *(default)* | `#0B0B0D` near-black | `#FF6A00` → `#FFA23C` | The house system. Everything, unless there is a reason. |
| **Ignition** | `#0A0A0B` | `#E5390B` → `#FF8A1F` | Deeper, redder. Launches, migration deadlines, anything with a clock on it. |
| **Amber** | `#0C0B09` | `#FF8A00` → `#FFC24D` | Warmer, goldier. Culture posts, hiring, festival and Onam-season creative. |

White is the third field, not an afterthought: the INSIGHT and evidence artboards sit on white with black type and an orange rule, and they are what stop a feed of black tiles becoming a black wall.

Switch with `--palette=ignition` on any render, or the swatches in the app. One palette per campaign, never within one.

## Typography

Three voices, each with exactly one job — never more than three type sizes on one artboard:

- **Fraunces** (variable serif) — headlines and the editorial pull-quote accent. Never body copy. Headlines run sharp and weighted (`opsz` 144, weight 700, tight negative tracking); the pull-quote accent inverts to a warmer, slightly hand-set italic instance (`opsz` 40, `SOFT` 40, `WONK` 1). This is the register shift that keeps the system from reading as another SaaS sans-only deck.
- **IBM Plex Sans** — every standfirst, byline and body line.
- **IBM Plex Mono** — eyebrows, sources, captions and stat units. Uppercase for eyebrows, sentence case for a citation. This is what makes a number or a byline read as *evidence*, not just smaller type.

All three are self-hosted from `brand/fonts/` (SIL Open Font License 1.1) as variable fonts, so rendering is deterministic and works offline. Type is sized in `rem` where **1rem = 1% of canvas width**, which is why one layout holds its proportions from a 1080px Instagram post to a 2560px YouTube banner.

Copy length is never known at design time, so every artboard shrinks its own headline until it fits and reports when it had to. If the fitter drops below 90%, the copy is wrong for that canvas.

## Motifs

| Motif | What it is | Where it goes |
|---|---|---|
| **Channel lines** | Wavy, unevenly-spaced depth-contour bands with soundings, styled after a nautical chart of a backwater channel | The house pattern. Always bleeds off-canvas. Onam Cloud's business — a private, charted channel, never the open sea — as a literal mark. |
| **Waypoints** | A small number of deliberate diamond markers connected by a routed, charted line with distance ticks | Paper fields, bottom-right or top-right |
| **Cut** | A ~12° accent band across the lower field | CTA slides, quote cards, banners |
| **Aperture** | Rounded square with one corner squared to 0 | Logo lockups, avatars, imagery, icon tiles |

The cut is a clipped band with controllable endpoints (`--cut-a`, `--cut-b`), never a rotated full-canvas wash — and no paper-toned type is ever allowed to sit on it.

## Icons

A 17-icon custom set in `templates/icons.mjs` — not a generic dashboard library. Every glyph is drawn to say one specific thing this business actually says: a private link that bypasses the public internet, a shield that closes rather than a padlock cliché, an interchange where routes cross. Two structural signatures tie them back to the rest of the system: one squared corner (echoing the aperture motif) and the waypoint diamond (echoing the channel-route motif) show up across the set. 24×24 grid, `currentColor` throughout, so an icon inherits its context's colour automatically.

## Photography

Onam Cloud has no photo library yet, and stock photography dropped onto an artboard at native colour breaks the orange/black/white rule on contact. `templates/_kit.mjs` exports two functions for this:

- **`duotone(src, opts)`** — the treatment any real photo gets once one exists. A true photographic duotone via an SVG `feComponentTransfer` luminance remap (shadows → ink, highlights → the accent tone), not a tint or a translucent colour wash. Drop a photo in and it is on-brand automatically.
- **`heroArt(opts)`** — what stands in a photo's place until one exists. A layered, deterministic generative field built from the channel-line language, used today as the YouTube thumbnail's subject-image fallback.

## The Instagram grid rhythm

The single highest-leverage rule in the system. Three post archetypes, cycled:

| Archetype | Field | Content | Job |
|---|---|---|---|
| **STATEMENT** | Ink | One large sentence, accent underline | Stop the scroll |
| **DATA** | Orange | One number at extreme scale | Prove you have evidence |
| **INSIGHT** | White | Eyebrow, headline, standfirst, byline | Show a named human thinks |

Post them in that order and the 3-column profile grid produces a diagonal black/orange/white rhythm automatically. No one has to plan the grid; they only have to keep the cycle. Break it and the profile stops reading as designed.

## Voice

Confident operator, not vendor. Onam Cloud connects Indian businesses privately to Azure, AWS and Google Cloud over Equinix — talk about what that removes, not what it adds. Specific over superlative. Banned outright: *revolutionary, game-changing, seamless, unlock the power of, in today's fast-paced world.* Indian numbering (lakh/crore) for domestic audiences, international format for global posts. Every metric states its basis.

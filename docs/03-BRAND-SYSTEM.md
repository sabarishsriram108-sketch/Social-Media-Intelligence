# Onum Cloud — the visual system

> **Assumption, stated plainly.** No official Onum Cloud brand kit was supplied, so the palettes, type pairing and mark below are a proposed system, not a recovered one. Everything is token-driven: replace the `palettes.*` block in `brand/onum-cloud.tokens.json` and swap `brand.logoSvg` in a brief, and all 18 artboards reskin with no template edits. Nothing downstream assumes these specific hex values.

## The idea

B2B cloud in India is a wall of the same blue. The system is built to be recognisable at thumbnail size and credible in front of a CIO, which pushes in one direction: **deep ink ground, one accent that behaves like a current running through it, and no third colour.**

Three rules do most of the work:

1. **Two chromatic hues per artboard, maximum.** Everything else is ink, paper or mist.
2. **One idea per artboard.** If it needs two headlines it is two posts.
3. **The pattern is structural, never decorative filler.** The contour motif always anchors off-canvas, so it reads as a field the artboard is cut from rather than a sticker.

## Palettes (dual-tone)

| | Ground | Accent ramp | Use it for |
|---|---|---|---|
| **Deep Current** *(default)* | `#060A16` near-black navy | `#3D7BFF` → `#5FE3C0` | The house system. Calm, deep, infrastructural. |
| **Signal** | `#0A0A0B` near-black | `#FFB020` → `#FF6A3D` | Launches and POV pieces. Highest stopping power in a LinkedIn feed. |
| **Monsoon** | `#03191D` deep teal | `#00C2A8` → `#FF6B5B` | Regionally distinctive; differentiates from the SaaS-blue wall. |

Switch with `--palette=signal` on any render. One palette per campaign, never within one.

## Typography

- **Space Grotesk** — headlines only. Geometric, technical, slightly odd. Never set body copy in it.
- **Inter** — everything else.

Both are self-hosted from `brand/fonts/` (SIL Open Font License 1.1), so rendering is deterministic and works offline. Type is sized in `rem` where **1rem = 1% of canvas width**, which is why one layout holds its proportions from a 1080px Instagram post to a 2560px YouTube banner.

Copy length is never known at design time, so every artboard shrinks its own headline until it fits and reports when it had to. If the fitter drops below 90%, the copy is wrong for that canvas.

## Motifs

| Motif | What it is | Where it goes |
|---|---|---|
| **Contour** | Concentric rounded rects radiating from a node — topographic, network propagation | The house pattern. Always bleeds off-canvas. |
| **Node grid** | Sparse dot matrix, two or three illuminated and connected | Paper fields, bottom-right or top-right |
| **Cut** | A ~12° accent band across the lower field | CTA slides, quote cards, banners |
| **Aperture** | Rounded square with one corner squared to 0 | Logo lockups, avatars, imagery |

The cut is a clipped band with controllable endpoints (`--cut-a`, `--cut-b`), never a rotated full-canvas wash — and no paper-toned type is ever allowed to sit on it.

## The Instagram grid rhythm

The single highest-leverage rule in the system. Three post archetypes, cycled:

| Archetype | Field | Content | Job |
|---|---|---|---|
| **STATEMENT** | Ink | One large sentence, accent underline | Stop the scroll |
| **DATA** | Accent | One number at extreme scale | Prove you have evidence |
| **INSIGHT** | Paper | Eyebrow, headline, standfirst, byline | Show a named human thinks |

Post them in that order and the 3-column profile grid produces a diagonal ink/accent/paper rhythm automatically. No one has to plan the grid; they only have to keep the cycle. Break it and the profile stops reading as designed.

## Voice

Confident operator, not vendor. Specific over superlative. Banned outright: *revolutionary, game-changing, seamless, unlock the power of, in today's fast-paced world.* Indian numbering (lakh/crore) for domestic audiences, international format for global posts. Every metric states its basis.

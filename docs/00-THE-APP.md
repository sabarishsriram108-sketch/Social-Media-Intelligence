# The application

```bash
npm install
npm start          # http://127.0.0.1:4321
```

Four steps, one screen.

| Step | What you do | What happens |
|---|---|---|
| **01** | Pick a platform | Instagram · LinkedIn · Facebook · X · YouTube |
| **02** | Pick a post type | Carousel, Reel cover, feed post, thumbnail, banner — 22 in total |
| **03** | Paste plain text | Claude rewrites it into the exact fields that artboard needs, inside the brand voice rules and the copy limits the layout was designed around |
| **04** | Review and send | Edit any line, redraw, then one button pushes it to Canva as an editable design |

You also get the **caption to post with it** — matched to that platform's register, with hashtags — because the image repeats the hook and the caption carries the argument.

## What the status chips mean

The three chips in the header tell you what the app can actually do right now.

| Chip | Meaning |
|---|---|
| `Copy: Claude` | `ANTHROPIC_API_KEY` is set. Real copywriting. |
| `Copy: fallback` | No key. The app still works, but it mechanically splits your text rather than writing it. Fine for checking a layout; not fine for posting. |
| `Logo: yours` | `brand/logo.svg` exists and every artboard uses it. |
| `Logo: placeholder` | Still drawing the placeholder mark. See below. |
| `Canva: connected` | Credentials and a completed sign-in. The push button works. |
| `Canva: not connected` | See [docs/01-CONNECT-CANVA.md](01-CONNECT-CANVA.md). |

## Dropping in the real logo

The app draws a placeholder mark until you give it the real one. Save the Onam Cloud logo as **`brand/logo.svg`** and restart — every one of the 22 artboards picks it up, no template edits. SVG is strongly preferred; it stays sharp at 2560px.

## Editing before you post

The right-hand panel is live. Change a headline, shorten a standfirst, swap the palette, hit **Apply changes** and the artboards redraw. The caption panel updates with it.

Under each artboard the app reports its dimensions and, when it happened, that it had to shrink the type to fit. **That is a copy signal, not a rendering detail** — if it says 85%, your line is too long for that canvas and the post will be weaker than it should be. Shorten it and redraw.

## Things worth knowing

- The app binds to `127.0.0.1` only. It holds your Canva tokens; do not put it on a network interface.
- Drafts live in memory. Restarting the server clears them; the rendered files stay in `out/app/<jobId>/`.
- Nothing is posted anywhere. The app stops at "editable design in Canva" — the last mile is yours, deliberately.
- Claude never invents a statistic, a customer name, or a result you did not supply. If your text is too thin to fill the artboard honestly, it says so in the notes rather than padding.

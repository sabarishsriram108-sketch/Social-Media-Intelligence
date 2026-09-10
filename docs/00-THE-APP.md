# The application

Your single work area for Onam Cloud social content. It runs on your own computer — nothing is hosted on the internet, nothing is exposed beyond your machine — but it behaves like a real portal: launch it, everything you've made is still there, work, close it, come back tomorrow and pick up where you left off.

## Launching it

**Windows — double-click `Start Onam Cloud Studio.bat`** in the project folder (make a desktop shortcut to it and you never touch a terminal again). First run installs everything automatically; every run after that is instant. A browser window opens on its own once it's ready.

Prefer the terminal:
```bash
npm install
npm start          # http://127.0.0.1:4321 — opens your browser automatically
```

Either way, the terminal/command window that opens has to stay open while you work — it's running the app. Closing it stops the app. That's normal; just reopen it (double-click the `.bat` again, or `npm start`) next time.

## The four steps + always-on navigation

Two buttons sit in the header on every screen, not just step one:

- **+ New post** — clears the form and takes you back to step 01, without losing anything already saved.
- **History** — opens every post you've ever generated in this workspace, most recent first. Click one to reopen it exactly where you left it — copy, artboards, palette, all of it — and keep editing or push it to Canva. Hover a row to reveal a small × if you want to remove it from the list (the rendered files stay on disk either way).

The four steps themselves:

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
| `Logo: yours` | A real logo is on file and every artboard uses it. Click it any time to replace. |
| `Logo: click to upload` | Still drawing the placeholder mark. Click the chip to fix that. |
| `Canva: connected` | Credentials and a completed sign-in. The push button works. |
| `Canva: not connected` | See [docs/01-CONNECT-CANVA.md](01-CONNECT-CANVA.md). |

## Dropping in the real logo

The app draws a placeholder mark until you give it the real one.

**Easiest path — click the logo chip.** In the header, click **`Logo: click to upload`**, pick the file from wherever you saved it (Downloads, Desktop, wherever), and you're done. No restart — the very next artboard you generate or redraw uses it. Click the chip again any time to replace it with a different file.

SVG, PNG, JPG and WebP all work. SVG is best if you have it — it stays sharp on a 2560px YouTube banner where a raster image would start to soften — but PNG is completely fine for everyday use.

If you'd rather place the file yourself: save it as `brand/logo.svg` (or `.png` / `.jpg` / `.webp`) and it's picked up the same way, live, no restart. Only one `brand/logo.*` should exist at a time — uploading through the app handles that for you automatically.

## Editing before you post

The right-hand panel is live. Change a headline, shorten a standfirst, swap the palette, hit **Apply changes** and the artboards redraw. The caption panel updates with it.

Under each artboard the app reports its dimensions and, when it happened, that it had to shrink the type to fit. **That is a copy signal, not a rendering detail** — if it says 85%, your line is too long for that canvas and the post will be weaker than it should be. Shorten it and redraw.

## Things worth knowing

- The app binds to `127.0.0.1` only — nothing is reachable from any other device, by design. It holds your Canva tokens; never put it on a shared network interface or expose it to the internet.
- **Every draft is saved to disk the moment it's generated or edited** — `out/app/<jobId>/job.json` alongside its rendered files. Closing the app, restarting your PC, none of it loses your work; open **History** and it's all there. (Wiping the `out/` folder by hand is the one thing that clears it — that folder is your archive.)
- Nothing is posted anywhere. The app stops at "editable design in Canva" — the last mile is yours, deliberately.
- Claude never invents a statistic, a customer name, or a result you did not supply. If your text is too thin to fill the artboard honestly, it says so in the notes rather than padding.

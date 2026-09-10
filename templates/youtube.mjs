/**
 * YouTube - Onam Cloud.
 *
 * A thumbnail is judged at roughly 210x118px in a sidebar. Everything here is
 * built backwards from that: five words maximum, display type at ~11% of canvas
 * height, one accent block behind the text so it never sits on a busy field, and
 * a fixed subject aperture on the right third. Run `--legibility` on any render
 * to see the 210px proof next to the full-size artboard.
 */
import { esc, emphasise, contour, nodeGrid, logo, eyebrow, footer, hexA } from './_kit.mjs';

export const platform = 'youtube';
export const meta = {
  label: 'YouTube',
  safeArea: 'Banner: only the centre 1546x423 of 2560x1440 is guaranteed visible on every device. Logo and value line must live inside it. Thumbnail: keep the bottom-right 15% clear - the duration stamp sits there.',
};

const THUMB = { w: 1280, h: 720 };

/* ---------------------------------------------------------------- thumbnail */
function thumbnail(p, pal) {
  const words = String(p.headline || '').trim().split(/\s+/).filter(Boolean);
  const longest = words.reduce((m, w) => Math.max(m, w.length), 1);
  const COL = 58;  // text column, % of canvas width
  const PAD = 5.2; // pad on each side, % of canvas width
  // Size to whichever constraint bites first: the longest word, or the line count.
  // The in-page fitter is the safety net, not the plan.
  // The usable measure is the column minus its own padding; Space Grotesk bold
  // runs ~0.62em per lowercase character.
  const byWord = (COL + 6 - PAD * 2) / (longest * 0.62);
  const byCount = words.length <= 3 ? 11.5 : words.length <= 5 ? 9.4 : 7.6;
  const size = Math.max(5.4, Math.min(byWord, byCount));

  return `<div class="ab field-ink" style="--h1:${size.toFixed(2)}rem">
    ${contour({ cx: 100, cy: 6, rings: 9, gap: 9.5, from: 14, opacity: 0.28, w: 0.3 })}
    <div class="motif-wrap" style="inset:0;
         background:radial-gradient(58% 86% at 96% 18%, ${hexA(pal.a1, 0.38)} 0%, ${hexA(pal.a2, 0.12)} 46%, transparent 72%)"></div>
    ${p.subject ? `<div class="aperture" style="position:absolute;z-index:8;right:4%;top:10%;width:32%;height:80%">
        <img src="${esc(p.subject)}" alt="">
      </div>` : `<div class="motif-wrap" style="right:9%;top:26%;width:22%;color:${hexA(pal.paper, 0.6)}">
        ${nodeGrid({ cols: 6, rows: 5, gap: 5, accent: pal.a2, opacity: 0.7 })}
      </div>`}
    <!-- Scrim keeps the headline readable even when a photo subject is dropped in. -->
    <div class="motif-wrap" style="left:0;top:0;width:100%;height:100%;z-index:9;
         background:linear-gradient(90deg, ${hexA(pal.ink, 0.94)} 0%, ${hexA(pal.ink, 0.88)} 38%, ${hexA(pal.ink, 0.45)} 60%, transparent 78%)"></div>
    <div class="guide" data-label="duration stamp" style="right:2%;bottom:4%;width:14%;height:11%"></div>
    <div class="pad" style="--pad:${PAD}%;width:${COL + 6}%;z-index:20">
      ${logo({ name: p.brand.name, size: '2.7rem', logoSvg: p.brand.logoSvg })}
      <div class="stack low">
        ${p.eyebrow ? `<div style="display:inline-flex;align-self:flex-start;margin-bottom:1.6rem;
            padding:.65rem 1.5rem;border-radius:var(--r-sm);background:var(--grad);color:var(--on-accent);
            font-size:1.45rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">${esc(p.eyebrow)}</div>` : ''}
        <h1 style="text-shadow:0 .3rem 2.4rem rgba(0,0,0,.55)">${emphasise(p.headline, p.emphasise ?? 0)}</h1>
      </div>
      <div style="padding-top:2rem;display:flex;align-items:center;gap:1.5rem">
        <div class="rule" style="width:4.5rem"></div>
        ${p.episode ? `<span style="font-size:1.45rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mist)">${esc(p.episode)}</span>` : ''}
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------- banner */
function banner(p, pal) {
  // 2560x1440 canvas; 1546x423 is the all-device safe area, centred.
  const sx = ((2560 - 1546) / 2 / 2560) * 100;
  const sy = ((1440 - 423) / 2 / 1440) * 100;
  return `<div class="ab field-ink" style="--h1:5.2rem;--lede:1.85rem">
    ${contour({ cx: 50, cy: 50, rings: 11, gap: 9.5, from: 8, opacity: 0.22, w: 0.14 })}
    <div class="motif-wrap" style="left:0;top:0;width:100%;height:100%;
         background:radial-gradient(46% 62% at 50% 50%, ${hexA(pal.a1, 0.24)} 0%, transparent 70%)"></div>
    <div class="guide" data-label="safe 1546x423" style="left:${sx}%;top:${sy}%;width:${(1546 / 2560) * 100}%;height:${(423 / 1440) * 100}%"></div>
    <div class="pad" style="--pad:0;align-items:center;justify-content:center;text-align:center">
      <div style="width:${(1420 / 2560) * 100}%;display:flex;flex-direction:column;align-items:center;gap:1.6rem">
        ${logo({ name: p.brand.name, size: '3.2rem', logoSvg: p.brand.logoSvg })}
        <h1 style="margin-top:.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="max-width:none;text-align:center">${esc(p.lede)}</p>` : ''}
        <div style="display:flex;align-items:center;gap:2rem;margin-top:1rem">
          ${p.cadence ? `<span class="chip">${esc(p.cadence)}</span>` : ''}
          ${p.brand.site ? `<span style="font-size:1.7rem;font-weight:700;color:var(--a2)">${esc(p.brand.site)}</span>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------- community post */
function community(p, pal) {
  return `<div class="ab field-paper" style="--h2:5rem">
    <div class="motif-wrap" style="left:0;top:0;width:100%;height:1.8%;background:var(--grad)"></div>
    <div class="motif-wrap" style="right:7%;bottom:12%;width:24%;color:${hexA(pal.ink, 0.5)}">
      ${nodeGrid({ cols: 7, rows: 4, accent: pal.a1, opacity: 0.65 })}
    </div>
    <div class="pad" style="--pad:8%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, tone: 'dark', logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <h2 style="margin-top:2.2rem;max-width:18ch">${emphasise(p.headline, p.emphasise ?? 0)}</h2>
        ${p.lede ? `<p class="lede" style="margin-top:2.2rem;max-width:32ch">${esc(p.lede)}</p>` : ''}
      </div>
      <div style="padding-top:2.8rem">
        <div class="rule hair" style="margin-bottom:2.2rem"></div>
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

export const artboards = {
  'thumbnail': { ...THUMB, label: 'Video thumbnail (1280x720)', legibility: 210, render: (p, pal) => [{ ...THUMB, body: thumbnail(p, pal) }] },
  'banner':    { w: 2560, h: 1440, label: 'Channel banner (safe area 1546x423)', render: (p, pal) => [{ w: 2560, h: 1440, body: banner(p, pal) }] },
  'community': { w: 1080, h: 1080, label: 'Community post (1:1)', render: (p, pal) => [{ w: 1080, h: 1080, body: community(p, pal) }] },
};

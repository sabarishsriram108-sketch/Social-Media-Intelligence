/**
 * Facebook - Onam Cloud.
 *
 * Facebook is where Onam Cloud reaches SMB owners rather than platform teams,
 * so the register is plainer than LinkedIn: less jargon, a concrete outcome, and
 * an explicit next step. The link card is the one that matters most - it is what
 * renders when anyone shares an onamcloud.com URL anywhere.
 */
import { esc, emphasise, contour, nodeGrid, logo, eyebrow, footer, stat, hexA, avatar } from './_kit.mjs';

export const platform = 'facebook';
export const meta = {
  label: 'Facebook',
  safeArea: 'Page cover uploads at 1640x856 but only the centre ~1090x360 is visible on mobile - keep the mark and the value line inside it. Link cards are 1.91:1 and get cropped hard on some surfaces; nothing important in the outer 6%.',
};

const POST = { w: 1200, h: 1500 };

/* ------------------------------------------------------------- feed post 4:5 */
function post(p, pal) {
  return `<div class="ab field-ink" style="--h1:6.4rem">
    ${contour({ cx: 102, cy: -4, rings: 10, gap: 9, from: 12, opacity: 0.34, w: 0.26 })}
    <div class="pad" style="--pad:8%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:2.4rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2.8rem;max-width:34ch">${esc(p.lede)}</p>` : ''}
        ${Array.isArray(p.points) && p.points.length ? `<ul style="margin-top:3rem;list-style:none;display:flex;flex-direction:column;gap:1.4rem">
          ${p.points.slice(0, 3).map((t) => `<li style="display:flex;gap:1.3rem;align-items:flex-start;font-size:1.72rem;line-height:1.45">
            <span style="flex:none;width:.75rem;height:.75rem;border-radius:999rem;background:var(--grad);margin-top:.72rem"></span>
            <span style="opacity:.86">${esc(t)}</span></li>`).join('')}
        </ul>` : ''}
      </div>
      <div style="padding-top:3.4rem">
        ${p.cta ? `<div style="display:inline-flex;padding:1.5rem 3rem;border-radius:999rem;background:var(--grad);
           color:var(--on-accent);font-size:1.7rem;font-weight:700;margin-bottom:2.6rem">${esc(p.cta.action || p.cta)}</div>` : ''}
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

/* ----------------------------------------------- link / share card (1.91:1) */
function linkCard(p, pal) {
  return `<div class="ab field-ink" style="--h1:5.4rem">
    ${contour({ cx: 101, cy: 14, rings: 10, gap: 9, from: 12, opacity: 0.34, w: 0.24 })}
    <div class="motif-wrap" style="inset:0;background:radial-gradient(56% 88% at 97% 20%, ${hexA(pal.a1, 0.3)} 0%, transparent 68%)"></div>
    <div class="guide" data-label="crop-safe" style="inset:6%"></div>
    <div class="pad" style="--pad:5.5%;width:74%">
      ${logo({ name: p.brand.name, size: '2.8rem', logoSvg: p.brand.logoSvg })}
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:1.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:1.6rem;font-size:1.75rem;max-width:46ch">${esc(p.lede)}</p>` : ''}
      </div>
      <div style="padding-top:2rem;display:flex;align-items:center;gap:1.6rem">
        <div class="rule" style="width:4.5rem"></div>
        <span style="font-size:1.5rem;font-weight:700;color:var(--a2)">${esc(p.brand.site || '')}</span>
      </div>
    </div>
  </div>`;
}

/* --------------------------------------------------------------- page cover */
function cover(p, pal) {
  // Upload 1640x856; only the centre ~1090x360 survives on mobile.
  const sx = ((1640 - 1090) / 2 / 1640) * 100;
  const sy = ((856 - 360) / 2 / 856) * 100;
  return `<div class="ab field-ink" style="--h1:4.6rem;--lede:1.75rem;--cut-a:118%;--cut-b:52%">
    ${contour({ cx: 88, cy: 46, rings: 12, gap: 8.4, from: 8, opacity: 0.3, w: 0.18 })}
    <div class="cut"></div>
    <div class="guide" data-label="mobile safe 1090x360" style="left:${sx}%;top:${sy}%;width:${(1090 / 1640) * 100}%;height:${(360 / 856) * 100}%"></div>
    <div class="pad" style="padding:${(0.1 * 856 / 1640 * 100).toFixed(2)}% 6%;justify-content:center">
      <div style="position:relative;z-index:10;max-width:58%">
        <div style="display:flex;align-items:center;gap:2.4rem">
          ${logo({ name: p.brand.name, size: '3rem', logoSvg: p.brand.logoSvg })}
          ${p.brand.site ? `<span style="font-size:1.55rem;font-weight:700;color:var(--a2)">${esc(p.brand.site)}</span>` : ''}
        </div>
        <h1 style="margin-top:1.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:1.4rem;max-width:44ch">${esc(p.lede)}</p>` : ''}
      </div>
    </div>
  </div>`;
}

/* --------------------------------------------------------------- story 9:16 */
function story(p, pal) {
  return `<div class="ab field-ink" style="--h1:8.2rem">
    ${contour({ cx: 100, cy: 20, rings: 13, gap: 8, from: 10, opacity: 0.34, w: 0.26 })}
    <div class="guide" data-label="safe" style="inset:14% 8% 12% 8%"></div>
    <div class="pad" style="--pad:8%;padding-top:16%;padding-bottom:15%">
      ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:2.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2.8rem">${esc(p.lede)}</p>` : ''}
        <div class="rule" style="margin-top:3.2rem"></div>
      </div>
      <div style="padding-top:4rem">
        ${p.cta ? `<span class="chip" style="margin-bottom:2.2rem">${esc(p.cta.action || p.cta)}</span>` : ''}
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

export const artboards = {
  'post':      { ...POST, label: 'Feed post (4:5)',                     render: (p, pal) => [{ ...POST, body: post(p, pal) }] },
  'link-card': { w: 1200, h: 630,  label: 'Link / share card (1.91:1)', render: (p, pal) => [{ w: 1200, h: 630, body: linkCard(p, pal) }] },
  'cover':     { w: 1640, h: 856,  label: 'Page cover (mobile-safe 1090x360)', render: (p, pal) => [{ w: 1640, h: 856, body: cover(p, pal) }] },
  'story':     { w: 1080, h: 1920, label: 'Story (9:16)',               render: (p, pal) => [{ w: 1080, h: 1920, body: story(p, pal) }] },
};

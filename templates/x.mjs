/**
 * X / Twitter - Onum Cloud.
 *
 * The feed is dense, fast and mostly text. The image's only job is to stop the
 * scroll and be readable at ~50% width on mobile. So: 16:9 for in-timeline cards
 * (no crop, maximum width), one idea per card, type set two steps larger than
 * the LinkedIn equivalent.
 */
import { esc, emphasise, contour, nodeGrid, logo, eyebrow, footer, stat, hexA } from './_kit.mjs';

export const platform = 'x';
export const meta = {
  label: 'X (Twitter)',
  safeArea: 'Single images render 16:9 uncropped in-timeline. 4:5 gets cropped to ~16:9 in the feed - only use it for thread covers where the tap-through matters.',
};

const CARD = { w: 1600, h: 900 };

/* --------------------------------------------------------- 16:9 idea card */
function card(p, pal) {
  return `<div class="ab field-ink" style="--h1:6rem">
    ${contour({ cx: 101, cy: 12, rings: 11, gap: 8.6, from: 10, opacity: 0.36, w: 0.22 })}
    <div class="pad" style="--pad:5.6%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, size: '2.9rem', logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div style="margin-top:auto;max-width:76%">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:2rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2rem;font-size:1.8rem;max-width:52ch">${esc(p.lede)}</p>` : ''}
      </div>
      <div style="margin-top:auto;padding-top:2.6rem">
        <div class="rule" style="width:6rem;margin-bottom:2rem"></div>
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

/* -------------------------------------------------------- 16:9 metric card */
function metric(p, pal) {
  return `<div class="ab field-accent" style="--fig:13rem">
    ${contour({ cx: -2, cy: 96, rings: 12, gap: 8, from: 8, stroke: pal.aInk, opacity: 0.15, w: 0.24 })}
    <div class="pad" style="--pad:5.6%;flex-direction:row;align-items:stretch;gap:4%">
      <div style="flex:1;display:flex;flex-direction:column">
        ${logo({ name: p.brand.name, tone: 'dark', size: '2.9rem', logoSvg: p.brand.logoSvg })}
        <div class="stack">
          ${eyebrow(p.eyebrow)}
          <div style="margin-top:1.6rem">${stat({ value: p.value, unit: p.unit, caption: p.caption, tone: 'dark' })}</div>
        </div>
        <div style="padding-top:2.4rem">
          ${p.source ? `<p style="font-size:1.2rem;opacity:.6;margin-bottom:1.2rem">${esc(p.source)}</p>` : ''}
          ${footer({ handle: p.brand.handle, site: p.brand.site, tone: 'dark' })}
        </div>
      </div>
      ${Array.isArray(p.breakdown) && p.breakdown.length ? `<div style="width:34%;display:flex;flex-direction:column;justify-content:center;gap:1.9rem">
        ${p.breakdown.slice(0, 4).map((b) => `<div>
          <div style="display:flex;justify-content:space-between;font-size:1.4rem;font-weight:600;margin-bottom:.6rem;color:${hexA(pal.aInk, 0.85)}">
            <span>${esc(b.label)}</span><span>${esc(b.value)}</span></div>
          <div style="height:.5rem;border-radius:999rem;background:${hexA(pal.aInk, 0.22)};overflow:hidden">
            <div style="height:100%;width:${Math.max(0, Math.min(100, Number(b.pct) || 0))}%;background:var(--aInk);border-radius:999rem"></div></div>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>`;
}

/* --------------------------------------------------------- thread cover 4:5 */
function threadCover(p, pal) {
  const n = p.threadLength || (p.slides || []).length || 7;
  return `<div class="ab field-ink" style="--h1:7rem">
    ${contour({ cx: 100, cy: 100, rings: 12, gap: 8.4, from: 10, opacity: 0.36, w: 0.26 })}
    <div class="pad" style="--pad:8%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        <span class="chip">Thread &middot; ${esc(String(n))}</span>
      </div>
      <div style="margin-top:auto">
        ${eyebrow(p.eyebrow || 'Thread')}
        <h1 style="margin-top:2.4rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2.6rem">${esc(p.lede)}</p>` : ''}
        <div class="rule" style="margin-top:3rem"></div>
      </div>
      <div style="margin-top:auto;padding-top:3.4rem">${footer({ handle: p.brand.handle, site: p.brand.site })}</div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------ profile header */
function header(p, pal) {
  return `<div class="ab field-ink" style="--h2:4rem;--cut-a:104%;--cut-b:44%">
    ${contour({ cx: 90, cy: 50, rings: 13, gap: 7.6, from: 8, opacity: 0.34, w: 0.2 })}
    <div class="cut"></div>
    <div class="guide" data-label="avatar overlap" style="left:2.4%;bottom:-6%;width:16.5%;height:52%;border-radius:999rem"></div>
    <div class="pad" style="--pad:5%;justify-content:center">
      <div style="position:relative;z-index:10;margin-left:21%;max-width:58%">
        ${logo({ name: p.brand.name, size: '3rem', logoSvg: p.brand.logoSvg })}
        <h2 style="margin-top:1.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h2>
        ${p.brand.site ? `<p style="margin-top:1.6rem;font-size:1.8rem;font-weight:700;color:var(--a2)">${esc(p.brand.site)}</p>` : ''}
      </div>
    </div>
  </div>`;
}

export const artboards = {
  'card':         { ...CARD, label: 'Timeline card - one idea (16:9, ink)',   render: (p, pal) => [{ ...CARD, body: card(p, pal) }] },
  'metric':       { ...CARD, label: 'Timeline card - metric (16:9, accent)',  render: (p, pal) => [{ ...CARD, body: metric(p, pal) }] },
  'thread-cover': { w: 1080, h: 1350, label: 'Thread cover (4:5)',            render: (p, pal) => [{ w: 1080, h: 1350, body: threadCover(p, pal) }] },
  'header':       { w: 1500, h: 500,  label: 'Profile header (avatar overlaps lower-left)', render: (p, pal) => [{ w: 1500, h: 500, body: header(p, pal) }] },
};

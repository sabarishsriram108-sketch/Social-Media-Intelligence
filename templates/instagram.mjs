/**
 * Instagram - Onam Cloud.
 *
 * Grid strategy: the profile grid only reads as a designed surface if archetypes
 * cycle. Post STATEMENT -> DATA -> INSIGHT and the ink/accent/paper fields fall on
 * a diagonal down the 3-column grid without anyone having to plan it.
 */
import { esc, escDisplay, emphasise, contour, nodeGrid, logo, eyebrow, footer, stat, swipe, hexA, avatar } from './_kit.mjs';

export const platform = 'instagram';
export const meta = {
  label: 'Instagram',
  safeArea: 'Keep type 14% clear of the top edge (handle bar) and 12% of the bottom (caption fold) on Reels/Stories.',
};

const FEED = { w: 1080, h: 1350 };

const dots = (n, i, pos = 'bottom:8.5%;right:8.5%') =>
  `<div class="pagedot" style="${pos}">${Array.from({ length: n }, (_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>`;

/* --------------------------------------------------- STATEMENT (ink field) */
function statement(p, pal) {
  return `<div class="ab field-ink" style="--h1:8.2rem">
    ${contour({ cx: 104, cy: -6, rings: 11, gap: 8.5, from: 10, opacity: 0.4, w: 0.28 })}
    <div class="pad" style="--pad:9%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div style="margin-top:auto">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:2.6rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:3rem">${esc(p.lede)}</p>` : ''}
        <div class="rule" style="margin-top:3.4rem"></div>
      </div>
      <div style="margin-top:4.2rem">${footer({ handle: p.brand.handle, site: p.brand.site })}</div>
    </div>
  </div>`;
}

/* ------------------------------------------------------- DATA (accent field) */
function data(p, pal) {
  return `<div class="ab field-accent" style="--fig:19rem">
    ${contour({ cx: -4, cy: 104, rings: 12, gap: 8, from: 8, stroke: pal.aInk, opacity: 0.16, w: 0.3 })}
    <div class="pad" style="--pad:9%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, tone: 'dark', logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <div style="margin-top:2.2rem">${stat({ value: p.value, unit: p.unit, caption: p.caption, tone: 'dark' })}</div>
      </div>
      <div style="padding-top:3rem">
        ${p.source ? `<p class="spec" style="font-size:1.2rem;opacity:.6;margin-bottom:1.8rem">${esc(p.source)}</p>` : ''}
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

/* ----------------------------------------------------- INSIGHT (paper field) */
function insight(p, pal) {
  const a = p.author || {};
  return `<div class="ab field-paper" style="--h2:5.6rem">
    <div class="motif-wrap" style="right:8%;bottom:26%;width:21%;color:${hexA(pal.ink, 0.55)}">
      ${nodeGrid({ cols: 8, rows: 5, accent: pal.a1, opacity: 0.75 })}
    </div>
    <div class="pad" style="--pad:9%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, tone: 'dark', logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <h2 style="margin-top:2.4rem">${emphasise(p.headline, p.emphasise ?? 0)}</h2>
        ${p.lede ? `<p class="lede" style="margin-top:2.6rem;max-width:26ch">${esc(p.lede)}</p>` : ''}
      </div>
      <div style="margin-top:3.6rem">
        <div class="rule hair" style="margin-bottom:2.6rem"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:2rem">
          ${a.name ? `<div style="display:flex;align-items:center;gap:1.4rem">
            ${avatar(a, { size: '5.2rem' })}
            <div><p style="font-size:1.6rem;font-weight:700">${esc(a.name)}</p>
                 <p style="font-size:1.35rem;opacity:.6;margin-top:.3rem">${esc(a.role || '')}</p></div>
          </div>` : '<span></span>'}
          <span class="site" style="font-size:1.45rem;font-weight:600;color:var(--a1)">${esc(p.brand.site || '')}</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ carousel */
function carousel(p, pal) {
  const slides = p.slides || [];
  const n = slides.length + 2;
  const out = [];

  out.push({
    slide: '01-cover',
    ...FEED,
    body: `<div class="ab field-ink" style="--h1:7.6rem">
      ${contour({ cx: 100, cy: 100, rings: 12, gap: 8, from: 10, opacity: 0.42, w: 0.28 })}
      <div class="pad" style="--pad:9%">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        <div style="margin-top:auto">
          ${eyebrow(p.eyebrow || 'Carousel')}
          <h1 style="margin-top:2.6rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
          ${p.lede ? `<p class="lede" style="margin-top:3rem">${esc(p.lede)}</p>` : ''}
        </div>
        <div style="margin-top:4rem;display:flex;align-items:center;justify-content:space-between">
          ${swipe('Swipe through')}
          <span style="font-size:1.4rem;font-weight:600;color:var(--mist)">1 / ${n}</span>
        </div>
      </div>
      ${dots(n, 0, 'bottom:4.2%;left:9%')}
    </div>`,
  });

  slides.forEach((s, i) => {
    out.push({
      slide: `${String(i + 2).padStart(2, '0')}-body`,
      ...FEED,
      body: `<div class="ab field-paper" style="--h2:4.8rem">
        <div class="motif-wrap" style="left:0;top:0;width:100%;height:2.2%;background:var(--grad)"></div>
        <div class="pad" style="--pad:9%">
          <!-- Numeral lives inside the stack, not above it: the whole
               numeral+title+body composes and centres as one unit, so the
               numeral never reads as a disconnected header floating over a
               separately-centred text block. -->
          <div class="stack">
            <div style="display:flex;align-items:center;gap:2rem">
              <span class="accent-text" style="font-size:6.4rem;line-height:1;letter-spacing:-.04em">${escDisplay(String(i + 1).padStart(2, '0'))}</span>
              <div class="rule" style="width:6rem"></div>
            </div>
            <h2 style="margin-top:2.8rem">${escDisplay(s.title)}</h2>
            ${s.body ? `<p class="body" style="margin-top:2.6rem;max-width:32ch;opacity:.72">${esc(s.body)}</p>` : ''}
          </div>
          <div style="padding-top:3.4rem;display:flex;align-items:center;justify-content:space-between">
            ${logo({ name: p.brand.name, tone: 'dark', size: '2.6rem', logoSvg: p.brand.logoSvg })}
            <span style="font-size:1.4rem;font-weight:600;opacity:.5">${i + 2} / ${n}</span>
          </div>
        </div>
      </div>`,
    });
  });

  const cta = p.cta || {};
  out.push({
    slide: `${String(n).padStart(2, '0')}-cta`,
    ...FEED,
    body: `<div class="ab field-ink" style="--h2:5.4rem;--cut-a:76%;--cut-b:60%">
      <div class="cut"></div><div class="cut-hair"></div>
      ${contour({ cx: 96, cy: 8, rings: 9, gap: 9, from: 12, opacity: 0.3, w: 0.28 })}
      <div class="pad" style="--pad:9%;padding-bottom:0">
        <!-- Fixed 58% region keeps paper-toned type off the accent band. -->
        <div style="height:58%;display:flex;flex-direction:column">
          ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
          <div class="stack low" style="position:relative;z-index:10">
            ${eyebrow(cta.eyebrow || 'Next step')}
            <h2 style="margin-top:2.4rem;max-width:16ch">${escDisplay(cta.headline || 'Talk to our cloud team.')}</h2>
          </div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3rem;
             position:relative;z-index:10;color:var(--aInk);padding-bottom:9%">
          ${cta.action ? `<div style="align-self:flex-start;display:inline-flex;align-items:center;gap:1.2rem;
             padding:1.6rem 3.2rem;border-radius:999rem;background:var(--aInk);color:var(--paper);
             font-size:1.75rem;font-weight:700;letter-spacing:-.01em">${esc(cta.action)}</div>` : ''}
          ${footer({ handle: p.brand.handle, site: p.brand.site, tone: 'dark' })}
        </div>
      </div>
    </div>`,
  });

  return out;
}

/* ---------------------------------------------------------------- reel cover */
function reelCover(p, pal) {
  return `<div class="ab field-ink" style="--h1:8.6rem">
    ${contour({ cx: 100, cy: 22, rings: 13, gap: 8, from: 10, opacity: 0.36, w: 0.26 })}
    <div class="guide" data-label="safe" style="inset:14% 8% 12% 8%"></div>
    <div class="pad" style="--pad:8%;padding-top:16%;padding-bottom:15%">
      ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
      <div style="margin-top:auto">
        ${eyebrow(p.eyebrow || 'Reel')}
        <h1 style="margin-top:2.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2.8rem">${esc(p.lede)}</p>` : ''}
        <div class="rule" style="margin-top:3.2rem"></div>
      </div>
      <div style="margin-top:auto;padding-top:4rem">
        ${p.duration ? `<span class="chip" style="margin-bottom:2.2rem">${esc(p.duration)}</span>` : ''}
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

export const artboards = {
  'feed-statement': { ...FEED, label: 'Feed post - STATEMENT (ink)', archetype: 'STATEMENT', render: (p, pal) => [{ ...FEED, body: statement(p, pal) }] },
  'feed-data':      { ...FEED, label: 'Feed post - DATA (accent)',   archetype: 'DATA',      render: (p, pal) => [{ ...FEED, body: data(p, pal) }] },
  'feed-insight':   { ...FEED, label: 'Feed post - INSIGHT (paper)', archetype: 'INSIGHT',   render: (p, pal) => [{ ...FEED, body: insight(p, pal) }] },
  'carousel':       { ...FEED, label: 'Carousel (cover + body + CTA)', multi: true,          render: carousel },
  'reel-cover':     { w: 1080, h: 1920, label: 'Reel / Story cover',                          render: (p, pal) => [{ w: 1080, h: 1920, body: reelCover(p, pal) }] },
};

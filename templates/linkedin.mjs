/**
 * LinkedIn - Onam Cloud.
 *
 * Register shift from Instagram: more restraint, more evidence. LinkedIn buyers
 * are evaluating credibility, not vibe. Decoration drops, the number and the
 * named human go up. 4:5 (1200x1500) is deliberate - it takes the most vertical
 * feed real estate LinkedIn will give a single image.
 */
import { esc, emphasise, contour, nodeGrid, logo, eyebrow, footer, stat, swipe, hexA, avatar } from './_kit.mjs';

export const platform = 'linkedin';
export const meta = {
  label: 'LinkedIn',
  safeArea: 'Feed crops nothing at 4:5, but the first 2 lines of the caption carry the click - the image must repeat the hook, not replace it.',
};

const POST = { w: 1200, h: 1500 };

/* --------------------------------------------------------- POV / authority */
function post(p, pal) {
  const a = p.author || {};
  return `<div class="ab field-ink" style="--h1:6.6rem">
    ${contour({ cx: 102, cy: -4, rings: 10, gap: 9, from: 12, opacity: 0.34, w: 0.26 })}
    <div class="pad" style="--pad:8%">
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        ${p.tag ? `<span class="chip">${esc(p.tag)}</span>` : ''}
      </div>
      <div style="margin-top:auto">
        ${eyebrow(p.eyebrow)}
        <h1 style="margin-top:2.4rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
        ${p.lede ? `<p class="lede" style="margin-top:2.8rem;max-width:34ch">${esc(p.lede)}</p>` : ''}
      </div>
      ${Array.isArray(p.points) && p.points.length ? `<ul style="margin-top:3.4rem;list-style:none;display:flex;flex-direction:column;gap:1.5rem">
        ${p.points.slice(0, 3).map((t) => `<li style="display:flex;gap:1.3rem;align-items:flex-start;font-size:1.72rem;line-height:1.45;color:var(--paper)">
          <span style="flex:none;width:.75rem;height:.75rem;border-radius:999rem;background:var(--grad);margin-top:.72rem"></span>
          <span style="opacity:.86">${esc(t)}</span></li>`).join('')}
      </ul>` : ''}
      <div style="margin-top:auto;padding-top:3.4rem">
        <div class="rule hair" style="margin-bottom:2.4rem"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:2rem">
          ${a.name ? `<div style="display:flex;align-items:center;gap:1.4rem">
            ${avatar(a, { size: '5rem' })}
            <div><p style="font-size:1.6rem;font-weight:700">${esc(a.name)}</p>
                 <p style="font-size:1.32rem;color:var(--mist);margin-top:.3rem">${esc(a.role || '')}</p></div>
          </div>` : `<span style="font-size:1.45rem;color:var(--mist)">${esc(p.brand.handle || '')}</span>`}
          <span style="font-size:1.45rem;font-weight:600;color:var(--a2)">${esc(p.brand.site || '')}</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------ evidence card */
function evidence(p, pal) {
  return `<div class="ab field-paper" style="--fig:15rem">
    <div class="motif-wrap" style="left:0;top:0;width:100%;height:1.6%;background:var(--grad)"></div>
    <div class="motif-wrap" style="right:8%;top:10%;width:18%;color:${hexA(pal.ink, 0.5)}">
      ${nodeGrid({ cols: 7, rows: 4, accent: pal.a1, opacity: 0.6 })}
    </div>
    <div class="pad" style="--pad:8%">
      ${logo({ name: p.brand.name, tone: 'dark', logoSvg: p.brand.logoSvg })}
      <div class="stack low">
        ${eyebrow(p.eyebrow)}
        <div style="margin-top:2rem">${stat({ value: p.value, unit: p.unit, caption: p.caption, tone: 'dark' })}</div>
      ${Array.isArray(p.breakdown) && p.breakdown.length ? `<div style="margin-top:4rem;display:flex;flex-direction:column;gap:1.9rem">
        ${p.breakdown.slice(0, 3).map((b) => `<div>
          <div style="display:flex;justify-content:space-between;font-size:1.55rem;font-weight:600;margin-bottom:.7rem">
            <span style="opacity:.78">${esc(b.label)}</span><span>${esc(b.value)}</span></div>
          <div style="height:.55rem;border-radius:999rem;background:${hexA(pal.ink, 0.1)};overflow:hidden">
            <div style="height:100%;width:${Math.max(0, Math.min(100, Number(b.pct) || 0))}%;background:var(--grad);border-radius:999rem"></div></div>
        </div>`).join('')}
      </div>` : ''}
      </div>
      <div style="padding-top:3rem">
        ${p.source ? `<p style="font-size:1.25rem;opacity:.5;margin-bottom:1.6rem;letter-spacing:.03em">${esc(p.source)}</p>` : ''}
        ${footer({ handle: p.brand.handle, site: p.brand.site })}
      </div>
    </div>
  </div>`;
}

/* -------------------------------------------------------------- quote card */
function quote(p, pal) {
  const a = p.author || {};
  return `<div class="ab field-ink" style="--h2:4.8rem;--cut-a:80%;--cut-b:66%">
    ${contour({ cx: 4, cy: -6, rings: 10, gap: 9.5, from: 14, opacity: 0.3, w: 0.26 })}
    <div class="cut"></div><div class="cut-hair"></div>
    <div class="pad" style="--pad:8%;padding-bottom:0">
      <!-- Fixed 64% region: everything set in paper type stays clear of the band. -->
      <div style="height:64%;display:flex;flex-direction:column">
        ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
        <div class="stack low">
          <div style="font-family:var(--display);font-weight:700;font-size:9rem;line-height:.5;
               color:var(--a2);opacity:.42;margin-bottom:2.6rem">&ldquo;</div>
          <h2 style="max-width:22ch">${esc(p.quote || p.headline)}</h2>
        </div>
      </div>
      <div style="flex:1;display:flex;align-items:center;position:relative;z-index:10;color:var(--aInk)">
        <div style="display:flex;align-items:center;gap:1.6rem">
          ${avatar(a, { size: '6rem' })}
          <div>
            <p style="font-size:1.95rem;font-weight:700">${esc(a.name || '')}</p>
            <p style="font-size:1.45rem;margin-top:.4rem;font-weight:500;opacity:.72">${esc(a.role || '')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------- document carousel */
function carousel(p, pal) {
  const slides = p.slides || [];
  const n = slides.length + 2;
  const out = [];

  out.push({
    slide: '01-cover', ...POST,
    body: `<div class="ab field-ink" style="--h1:6.4rem">
      ${contour({ cx: 100, cy: 104, rings: 12, gap: 8.4, from: 10, opacity: 0.36, w: 0.26 })}
      <div class="pad" style="--pad:8%">
        <div style="display:flex;align-items:center;justify-content:space-between">
          ${logo({ name: p.brand.name, logoSvg: p.brand.logoSvg })}
          <span class="chip">${esc(p.tag || `${n} slides`)}</span>
        </div>
        <div style="margin-top:auto">
          ${eyebrow(p.eyebrow)}
          <h1 style="margin-top:2.4rem">${emphasise(p.headline, p.emphasise ?? 2)}</h1>
          ${p.lede ? `<p class="lede" style="margin-top:2.8rem;max-width:32ch">${esc(p.lede)}</p>` : ''}
        </div>
        <div style="margin-top:auto;padding-top:3.6rem;display:flex;align-items:center;justify-content:space-between">
          ${swipe('Swipe')}<span style="font-size:1.4rem;font-weight:600;color:var(--mist)">1 / ${n}</span>
        </div>
      </div>
    </div>`,
  });

  slides.forEach((s, i) => {
    out.push({
      slide: `${String(i + 2).padStart(2, '0')}-body`, ...POST,
      body: `<div class="ab field-paper" style="--h2:4.4rem">
        <div class="motif-wrap" style="left:0;top:0;width:100%;height:1.6%;background:var(--grad)"></div>
        <div class="pad" style="--pad:8%">
          <div style="display:flex;align-items:center;justify-content:space-between">
            ${logo({ name: p.brand.name, tone: 'dark', size: '2.5rem', logoSvg: p.brand.logoSvg })}
            <span style="font-size:1.35rem;font-weight:600;opacity:.45">${i + 2} / ${n}</span>
          </div>
          <div class="stack low">
            <span class="accent-text" style="font-family:var(--display);font-weight:700;font-size:5.4rem;letter-spacing:-.04em;line-height:1">${String(i + 1).padStart(2, '0')}</span>
            <h2 style="margin-top:1.6rem">${esc(s.title)}</h2>
            ${s.body ? `<p class="body" style="margin-top:2.4rem;max-width:34ch;opacity:.72">${esc(s.body)}</p>` : ''}
            ${s.stat ? `<div style="margin-top:3rem;display:inline-flex;align-items:baseline;gap:1.2rem;
                padding:1.4rem 2.4rem;border-radius:var(--r-sm);background:${hexA(pal.ink, 0.05)};border-left:.35rem solid var(--a1)">
                <span style="font-family:var(--display);font-weight:700;font-size:3.4rem;letter-spacing:-.03em">${esc(s.stat)}</span>
                ${s.statLabel ? `<span style="font-size:1.5rem;opacity:.65">${esc(s.statLabel)}</span>` : ''}
              </div>` : ''}
          </div>
          <div style="padding-top:3rem"><div class="rule" style="width:5rem"></div></div>
        </div>
      </div>`,
    });
  });

  const cta = p.cta || {};
  out.push({
    slide: `${String(n).padStart(2, '0')}-cta`, ...POST,
    body: `<div class="ab field-accent" style="--h2:5rem">
      ${contour({ cx: 100, cy: 100, rings: 11, gap: 8.6, from: 10, stroke: pal.aInk, opacity: 0.16, w: 0.3 })}
      <div class="pad" style="--pad:8%">
        ${logo({ name: p.brand.name, tone: 'dark', logoSvg: p.brand.logoSvg })}
        <div style="margin-top:auto">
          ${eyebrow(cta.eyebrow || 'Next step')}
          <h2 style="margin-top:2.2rem;max-width:18ch">${esc(cta.headline || 'Talk to our cloud team.')}</h2>
          ${cta.action ? `<div style="margin-top:3.2rem;display:inline-flex;padding:1.5rem 3rem;border-radius:999rem;
             background:var(--aInk);color:var(--paper);font-size:1.7rem;font-weight:700">${esc(cta.action)}</div>` : ''}
        </div>
        <div style="margin-top:auto;padding-top:3.6rem">${footer({ handle: p.brand.handle, site: p.brand.site, tone: 'dark' })}</div>
      </div>
    </div>`,
  });

  return out;
}

/* ------------------------------------------------------------ page banners */
function banner(p, pal, { w, h, safe }) {
  // A banner is a wordmark and one line, never a paragraph - `lede` is ignored
  // here on purpose; the profile headline field already carries that copy.
  const compact = h / w < 0.2; // 1128x191 page strip: mark + line, side by side
  return `<div class="ab field-ink" style="--h2:${compact ? 4 : 4.6}rem;--cut-a:104%;--cut-b:46%">
    ${contour({ cx: 88, cy: 50, rings: 14, gap: 7.5, from: 8, opacity: 0.34, w: 0.22 })}
    <div class="cut"></div>
    ${safe ? `<div class="guide" data-label="safe" style="left:${safe.x}%;top:${safe.y}%;width:${safe.w}%;height:${safe.h}%"></div>` : ''}
    <div class="pad" style="padding:${((compact ? 0.14 : 0.12) * h / w * 100).toFixed(2)}% 4%;justify-content:center">
      ${compact ? `<div style="position:relative;z-index:10;display:flex;align-items:center;gap:3rem;max-width:84%">
        ${logo({ name: p.brand.name, size: '3.6rem', logoSvg: p.brand.logoSvg })}
        <h2 style="margin:0">${emphasise(p.headline, p.emphasise ?? 2)}</h2>
      </div>` : `<div style="position:relative;z-index:10;max-width:66%">
        <div style="display:flex;align-items:center;gap:2.4rem">
          ${logo({ name: p.brand.name, size: '3rem', logoSvg: p.brand.logoSvg })}
          ${p.brand.site ? `<span style="font-size:1.6rem;font-weight:700;color:var(--a2)">${esc(p.brand.site)}</span>` : ''}
        </div>
        <h2 style="margin-top:1.8rem">${emphasise(p.headline, p.emphasise ?? 2)}</h2>
      </div>`}
    </div>
  </div>`;
}

export const artboards = {
  'post':        { ...POST, label: 'Feed post - POV / authority (ink)',  render: (p, pal) => [{ ...POST, body: post(p, pal) }] },
  'evidence':    { ...POST, label: 'Feed post - evidence / metric (paper)', render: (p, pal) => [{ ...POST, body: evidence(p, pal) }] },
  'quote':       { ...POST, label: 'Feed post - executive quote (ink + cut)', render: (p, pal) => [{ ...POST, body: quote(p, pal) }] },
  'carousel':    { ...POST, label: 'Document carousel (cover + body + CTA)', multi: true, render: carousel },
  'page-banner': { w: 1128, h: 191, label: 'Company page banner',
                   render: (p, pal) => [{ w: 1128, h: 191, body: banner(p, pal, { w: 1128, h: 191 }) }] },
  'profile-banner': { w: 1584, h: 396, label: 'Personal profile banner (safe: centre 1350x220)',
                   render: (p, pal) => [{ w: 1584, h: 396, body: banner(p, pal, { w: 1584, h: 396, safe: { x: 7.4, y: 22, w: 85.2, h: 55.5 } }) }] },
};

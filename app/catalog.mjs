/**
 * What the app offers, in the words an operator uses - not artboard slugs.
 *
 * Each entry also carries the copy contract for that artboard: which fields the
 * layout needs, and how long each may be. The composer reads `needs` and `limits`
 * to brief Claude; the UI reads `label` and `hint` to draw the picker. One source,
 * so the two can never drift apart.
 */

export const PLATFORMS = [
  {
    id: 'instagram', label: 'Instagram',
    blurb: 'Grid rhythm matters here. Cycle Statement, Number, Insight and the profile designs itself.',
    types: [
      { id: 'feed-statement', label: 'Feed post — Statement', hint: 'One big line on black. Stops the scroll.',
        needs: ['eyebrow', 'headline', 'lede'], limits: { headline: 9, lede: 20 } },
      { id: 'feed-data', label: 'Feed post — Number', hint: 'One metric at huge scale, on orange.',
        needs: ['eyebrow', 'value', 'unit', 'caption', 'source'], limits: { caption: 22 } },
      { id: 'feed-insight', label: 'Feed post — Insight', hint: 'Editorial, white, with a named byline.',
        needs: ['eyebrow', 'headline', 'lede', 'author'], limits: { headline: 10, lede: 24 } },
      { id: 'carousel', label: 'Carousel', hint: 'Cover, up to 5 numbered slides, and a CTA.',
        needs: ['eyebrow', 'headline', 'lede', 'slides', 'cta'], limits: { headline: 10, slideTitle: 6, slideBody: 35 } },
      { id: 'reel-cover', label: 'Reel / Story cover', hint: '9:16 opening frame for a Reel or Story.',
        needs: ['eyebrow', 'headline', 'lede', 'duration'], limits: { headline: 8, lede: 14 } },
    ],
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    blurb: 'Buyers assess credibility here. Lead with evidence and a named human, not adjectives.',
    types: [
      { id: 'post', label: 'Post — point of view', hint: 'Headline, standfirst, three supporting points.',
        needs: ['eyebrow', 'headline', 'lede', 'points', 'author'], limits: { headline: 12, lede: 22 } },
      { id: 'evidence', label: 'Post — evidence / metric', hint: 'A number plus the breakdown behind it.',
        needs: ['eyebrow', 'value', 'unit', 'caption', 'breakdown', 'source'], limits: { caption: 22 } },
      { id: 'quote', label: 'Quote card', hint: 'One executive line, attributed.',
        needs: ['quote', 'author'], limits: { quote: 26 } },
      { id: 'carousel', label: 'Document carousel', hint: 'Cover, numbered slides with stats, CTA.',
        needs: ['eyebrow', 'headline', 'lede', 'slides', 'cta'], limits: { headline: 10, slideTitle: 6, slideBody: 35 } },
      { id: 'page-banner', label: 'Company page banner', hint: '1128×191 strip. Mark plus one line.',
        needs: ['headline'], limits: { headline: 5 } },
      { id: 'profile-banner', label: 'Profile banner', hint: '1584×396 personal profile header.',
        needs: ['headline'], limits: { headline: 6 } },
    ],
  },
  {
    id: 'facebook', label: 'Facebook',
    blurb: 'SMB owners, not platform teams. Plainer language, a concrete outcome, an explicit next step.',
    types: [
      { id: 'post', label: 'Feed post', hint: 'Headline, standfirst, up to three points, a CTA.',
        needs: ['eyebrow', 'headline', 'lede', 'points', 'cta'], limits: { headline: 11, lede: 24 } },
      { id: 'link-card', label: 'Link / share card', hint: '1.91:1 — what renders when a link is shared.',
        needs: ['eyebrow', 'headline', 'lede'], limits: { headline: 8, lede: 24 } },
      { id: 'cover', label: 'Page cover', hint: '1640×856 with the mobile-safe centre respected.',
        needs: ['headline', 'lede'], limits: { headline: 6, lede: 16 } },
      { id: 'story', label: 'Story', hint: '9:16 full-screen frame.',
        needs: ['eyebrow', 'headline', 'lede', 'cta'], limits: { headline: 8, lede: 14 } },
    ],
  },
  {
    id: 'x', label: 'X (Twitter)',
    blurb: 'Dense and fast. One idea per card, type two steps larger than anywhere else.',
    types: [
      { id: 'card', label: 'Timeline card', hint: '16:9 — renders uncropped in the timeline.',
        needs: ['eyebrow', 'headline', 'lede', 'tag'], limits: { headline: 10, lede: 25 } },
      { id: 'metric', label: 'Metric card', hint: 'A number with its breakdown, on orange.',
        needs: ['eyebrow', 'value', 'unit', 'caption', 'breakdown', 'source'], limits: { caption: 20 } },
      { id: 'thread-cover', label: 'Thread cover', hint: '4:5 opener for a numbered thread.',
        needs: ['eyebrow', 'headline', 'lede', 'threadLength'], limits: { headline: 9, lede: 18 } },
      { id: 'header', label: 'Profile header', hint: '1500×500 with the avatar overlap respected.',
        needs: ['headline'], limits: { headline: 8 } },
    ],
  },
  {
    id: 'youtube', label: 'YouTube',
    blurb: 'A thumbnail is judged at 210px in a sidebar. Five words, maximum.',
    types: [
      { id: 'thumbnail', label: 'Video thumbnail', hint: '1280×720. Five words max, no long ones.',
        needs: ['eyebrow', 'headline', 'episode'], limits: { headline: 5 } },
      { id: 'banner', label: 'Channel banner', hint: '2560×1440 with the all-device safe area respected.',
        needs: ['headline', 'lede', 'cadence'], limits: { headline: 4, lede: 22 } },
      { id: 'community', label: 'Community post', hint: '1:1 square for the Community tab.',
        needs: ['eyebrow', 'headline', 'lede', 'tag'], limits: { headline: 9, lede: 22 } },
    ],
  },
];

export function findType(platformId, typeId) {
  const p = PLATFORMS.find((x) => x.id === platformId);
  if (!p) throw new Error(`Unknown platform "${platformId}"`);
  const t = p.types.find((x) => x.id === typeId);
  if (!t) throw new Error(`Unknown post type "${typeId}" for ${p.label}`);
  return { platform: p, type: t };
}

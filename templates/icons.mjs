/**
 * Onam Cloud - icon set.
 *
 * Not a generic dashboard-icon library. Every glyph here is drawn to say one
 * of the specific things this business actually says: a private link that
 * bypasses the public internet, a channel with a marked waypoint, a route
 * through an exchange, a shield that closes rather than a padlock cliche.
 * Two structural signatures tie them back to the rest of the system:
 *
 *   - one squared corner, echoing the aperture motif (shield, document, rack)
 *   - the waypoint diamond, echoing the channel-route motif (region, link)
 *
 * 24x24 grid, 1.7 stroke, round caps/joins except where a sharp corner is the
 * point. currentColor throughout, so an icon inherits its context's colour
 * and (via .field-* / on-dark-type) its theme automatically.
 */

const S = 1.7; // default stroke width, matched across the whole set

const wrap = (inner, { size = '1.5rem', sw = S } = {}) =>
  `<svg class="icon" style="width:${size};height:${size};flex:none" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

/** Private link - two nodes, one direct line between them. The whole brand. */
export const iconPrivateLink = (o) => wrap(
  `<circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><path d="M8 12h8"/>`, o
);

/** Public internet, bypassed - a globe with the route struck through it. */
export const iconBypassPublic = (o) => wrap(
  `<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.3-3.6-8.5S9.6 5.8 12 3.5Z"/>` +
  `<path d="M4.2 19.8 19.8 4.2" stroke-width="${(o?.sw || S) + 0.4}"/>`, o
);

/** Region / waypoint - the channel-route diamond marker, as an icon. */
export const iconRegion = (o) => wrap(
  `<path d="M12 3 20 12 12 21 4 12Z"/><circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none"/>`, o
);

/** Compliance - a shield with one squared corner (aperture signature), open tick. */
export const iconShield = (o) => wrap(
  `<path d="M12 3 4.5 5.8v6c0 5 3 8 7.5 9.2 4.5-1.2 7.5-4.2 7.5-9.2v-6L12 3Z" stroke-linejoin="miter"/>` +
  `<path d="M8.6 12.4 11 14.8l4.6-5.2"/>`, o
);

/** Audit / document - one squared corner, folded, with a citation line. */
export const iconDocument = (o) => wrap(
  `<path d="M6 3h9l3.5 3.5V21H6Z" stroke-linejoin="miter"/><path d="M15 3v3.5h3.5"/>` +
  `<path d="M9 13h6M9 16.5h6"/>`, o
);

/** Migration - a workload leaving one box, arriving at another. */
export const iconMigration = (o) => wrap(
  `<rect x="2.5" y="7" width="7" height="10" rx="1.2"/><rect x="14.5" y="7" width="7" height="10" rx="1.2"/>` +
  `<path d="M10.7 12h6.6"/><path d="M15 9.2 17.8 12 15 14.8"/>`, o
);

/** Latency - a dial with the needle mid-sweep, motion ticks ahead of it. */
export const iconLatency = (o) => wrap(
  `<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15 16 9.5"/><path d="M12 15h.01"/>` +
  `<path d="M18.5 5.5l1 1M20.5 9l1.3.4" stroke-width="${(o?.sw || S) - 0.4}" opacity=".6"/>`, o
);

/** Cost - the rupee sign, held in a plain circle (never a coin/cash cliche). */
export const iconCost = (o) => wrap(
  `<circle cx="12" cy="12" r="9"/><path d="M8.5 8h7M8.5 11h7M8.5 8c3.3 0 5 1.1 5 3s-1.7 3-5 3M8.5 11l6 6.5"/>`, o
);

/** Security - a closed lock, the shackle drawn as one continuous stroke. */
export const iconLock = (o) => wrap(
  `<rect x="5" y="11" width="14" height="9.5" rx="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.3" r="1.4" fill="currentColor" stroke="none"/>`, o
);

/** Partnership - two brackets closing toward each other, not literal hands. */
export const iconPartnership = (o) => wrap(
  `<path d="M9 4H6a2 2 0 0 0-2 2v3"/><path d="M15 4h3a2 2 0 0 1 2 2v3"/>` +
  `<path d="M4 15v3a2 2 0 0 0 2 2h3"/><path d="M20 15v3a2 2 0 0 1-2 2h-3"/>` +
  `<path d="M9.3 12 12 9.3 14.7 12 12 14.7Z"/>`, o
);

/** Evidence / analytics - three bars, the tallest carrying the point. */
export const iconAnalytics = (o) => wrap(
  `<path d="M4 21V11M12 21V4M20 21v-7"/>`, o
);

/** Cadence - a calendar with the active day marked, not a generic grid. */
export const iconCadence = (o) => wrap(
  `<rect x="3.5" y="5.5" width="17" height="15" rx="1.6"/><path d="M3.5 10h17"/>` +
  `<path d="M8 3.5v4M16 3.5v4"/><circle cx="16" cy="15" r="1.6" fill="currentColor" stroke="none"/>`, o
);

/** Infrastructure - three stacked rack units, each with a live indicator. */
export const iconServer = (o) => wrap(
  `<rect x="4" y="4" width="16" height="4.6" rx="1"/><rect x="4" y="9.7" width="16" height="4.6" rx="1"/><rect x="4" y="15.4" width="16" height="4.6" rx="1"/>` +
  `<path d="M7.3 6.3h.01M7.3 12h.01M7.3 17.7h.01" stroke-width="${(o?.sw || S) + 1}"/>`, o
);

/** Organisation - an office building, flat-roofed and abstract, not a house. */
export const iconOrg = (o) => wrap(
  `<rect x="4" y="5" width="16" height="16" rx="1" stroke-linejoin="miter"/><path d="M10 21v-5.5h4V21"/>` +
  `<path d="M7.8 9h.01M7.8 13h.01M16.2 9h.01M16.2 13h.01" stroke-width="${(o?.sw || S) + 1}"/>`, o
);

/** Topology - three nodes on one routed path, the system's own waypoint motif. */
export const iconTopology = (o) => wrap(
  `<path d="M5 18 11 8 19 6"/><circle cx="5" cy="18" r="2.1"/><circle cx="11" cy="8" r="2.1"/><circle cx="19" cy="6" r="2.1"/>`, o
);

/** Exchange - the interchange where routes cross, like Equinix in the story. */
export const iconExchange = (o) => wrap(
  `<path d="M12 2 21 12 12 22 3 12Z" stroke-linejoin="miter"/><path d="M8 12h8M12 8v8" stroke-width="${(o?.sw || S) - 0.3}"/>`, o
);

/** Utility arrow - CTAs and flow diagrams. */
export const iconArrow = (o) => wrap(`<path d="M4 12h15.5M14 6.5 19.5 12 14 17.5"/>`, o);

/** Named lookup, for data-driven usage (e.g. a flow-diagram step naming its icon). */
export const ICONS = {
  privateLink: iconPrivateLink,
  bypassPublic: iconBypassPublic,
  region: iconRegion,
  shield: iconShield,
  document: iconDocument,
  migration: iconMigration,
  latency: iconLatency,
  cost: iconCost,
  lock: iconLock,
  partnership: iconPartnership,
  analytics: iconAnalytics,
  cadence: iconCadence,
  server: iconServer,
  org: iconOrg,
  topology: iconTopology,
  exchange: iconExchange,
  arrow: iconArrow,
};

/** Icon inside a small aperture-style tile - the standard "icon chip" used in lists and step cards. */
export function iconTile(name, { size = '2.6rem', bg = null, fg = 'currentColor' } = {}) {
  const fn = ICONS[name];
  if (!fn) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(ICONS).join(', ')}`);
  return `<div class="icon-tile" style="width:${size};height:${size};color:${fg}${bg ? `;background:${bg}` : ''}">${fn({ size: '58%' })}</div>`;
}

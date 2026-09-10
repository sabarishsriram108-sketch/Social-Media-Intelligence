import * as instagram from '../templates/instagram.mjs';
import * as linkedin from '../templates/linkedin.mjs';
import * as x from '../templates/x.mjs';
import * as youtube from '../templates/youtube.mjs';

export const registry = { instagram, linkedin, x, youtube };
export const aliases = { ig: 'instagram', li: 'linkedin', twitter: 'x', yt: 'youtube' };

export function resolve(platform, artboard) {
  const key = aliases[platform] || platform;
  const mod = registry[key];
  if (!mod) throw new Error(`Unknown platform "${platform}". Available: ${Object.keys(registry).join(', ')}`);
  const ab = mod.artboards[artboard];
  if (!ab) throw new Error(`Unknown artboard "${artboard}" for ${key}. Available: ${Object.keys(mod.artboards).join(', ')}`);
  return { key, mod, ab };
}

export function listAll() {
  return Object.entries(registry).flatMap(([key, mod]) =>
    Object.entries(mod.artboards).map(([name, ab]) => ({
      platform: key, artboard: name, label: ab.label, w: ab.w, h: ab.h, multi: !!ab.multi,
    }))
  );
}

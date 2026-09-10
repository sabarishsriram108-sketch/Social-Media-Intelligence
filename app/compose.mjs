/**
 * Plain text in, on-brand artboard copy out.
 *
 * With ANTHROPIC_API_KEY set, Claude rewrites the operator's paragraph into the
 * exact fields the chosen artboard needs, inside the brand's voice rules and the
 * copy limits the layout was designed around - plus the caption to post with it.
 *
 * Without a key the app still works: `heuristicCompose` splits the text into the
 * same shape by rule. It is a floor, not a substitute, and the UI says so.
 */
import { z } from 'zod';
import { tokens } from '../templates/_kit.mjs';
import { findType } from './catalog.mjs';

const MODEL = 'claude-opus-5';

/* Every field the templates can consume. Structured outputs are strict, so
   optionality is expressed as nullable rather than by omitting keys. */
const Fields = z.object({
  eyebrow: z.string().nullable(),
  headline: z.string().nullable(),
  emphasise: z.number().int().min(0).max(4).nullable(),
  lede: z.string().nullable(),
  tag: z.string().nullable(),
  value: z.string().nullable(),
  unit: z.string().nullable(),
  caption: z.string().nullable(),
  source: z.string().nullable(),
  quote: z.string().nullable(),
  points: z.array(z.string()).nullable(),
  breakdown: z.array(z.object({ label: z.string(), value: z.string(), pct: z.number() })).nullable(),
  author: z.object({ name: z.string().nullable(), role: z.string().nullable() }).nullable(),
  slides: z.array(z.object({
    title: z.string(),
    body: z.string().nullable(),
    stat: z.string().nullable(),
    statLabel: z.string().nullable(),
  })).nullable(),
  cta: z.object({ eyebrow: z.string().nullable(), headline: z.string().nullable(), action: z.string().nullable() }).nullable(),
  episode: z.string().nullable(),
  duration: z.string().nullable(),
  cadence: z.string().nullable(),
  threadLength: z.number().int().nullable(),
  postCaption: z.string().nullable(),
  hashtags: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
});

export const hasApiKey = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

function systemPrompt(platform, type, brand) {
  const v = tokens.voice;
  const limits = Object.entries(type.limits || {}).map(([k, n]) => `  - ${k}: ${n} words maximum`).join('\n');
  return `You write social copy for ${brand.name}, a cloud services provider from Saints & Masters in Kochi, India.

WHAT ${brand.name.toUpperCase()} DOES
Private, direct connectivity from Indian businesses to Azure, AWS and Google Cloud over Equinix's global fabric, so sensitive traffic never crosses the public internet. The audience is Indian enterprises and SMBs. Website: ${brand.site}.

YOUR JOB
Turn the operator's raw text into the exact fields for one ${platform.label} artboard: "${type.label}" — ${type.hint}
Return ONLY those fields. Set every field you are not using to null.

FIELDS THIS ARTBOARD USES
${type.needs.map((n) => `  - ${n}`).join('\n')}

HARD COPY LIMITS (the layout is designed around these; exceeding them shrinks the type and weakens the post)
${limits || '  - keep every line short'}

VOICE
  - ${v.register}
  - Never use: ${v.banned.join(', ')}.
  - ${v.numbers}
  - Specific over superlative. No exclamation marks. Title case is not used; write sentences.
  - ${platform.blurb}

RULES THAT MATTER
  - headline: a complete thought, ideally one sentence. No trailing colon.
  - emphasise: how many words at the END of the headline get the orange underline. Use 2-3, and only when those words all land on the final line. Use 0 for YouTube thumbnails.
  - eyebrow: 2-4 words, a category not a sentence.
  - value/unit: split the number from its unit — value "41", unit "%". Never put the unit in value.
  - source: if the operator gave a number, state its basis. If they gave no basis, say what it would need (e.g. "Onam Cloud customer data") and flag it in notes. NEVER invent a statistic, a customer name, or a result the operator did not supply.
  - breakdown: pct is the bar fill 0-100, proportional to value.
  - slides: 3-5 slides. Each title is a noun phrase, each body one or two sentences.
  - postCaption: the caption to paste into ${platform.label} alongside the image. Match that platform's register and length. The image repeats the hook; the caption carries the argument and the call to action.
  - hashtags: 3-6, lowercase, no generic filler. Empty array if the platform does not benefit from them.
  - notes: anything the operator should check before posting — an invented-looking claim, a missing source, copy you had to cut. Null if nothing.

If the operator's text is too thin to fill the artboard honestly, write the best version you can from what they gave and say what is missing in notes. Do not pad with invented specifics.`;
}

export async function composeWithClaude({ platform, type, text, brand }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const { zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod');
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: systemPrompt(platform, type, brand),
    output_config: { format: zodOutputFormat(Fields, 'artboard_copy'), effort: 'medium' },
    messages: [{ role: 'user', content: `Here is what I want to post about:\n\n${text}` }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error(`Claude declined this request (${response.stop_details?.category || 'unspecified'}). Rephrase the brief and try again.`);
  }
  if (!response.parsed_output) throw new Error('Claude returned copy that did not match the expected shape. Try again.');
  return { fields: response.parsed_output, engine: MODEL };
}

/* ---------------------------------------------------------------- fallback */

const clampWords = (s, n) => {
  const w = String(s || '').trim().split(/\s+/).filter(Boolean);
  return w.length <= n ? w.join(' ') : w.slice(0, n).join(' ');
};

/** Rule-based split so the app is usable before any API key exists. */
export function heuristicCompose({ platform, type, text, brand }) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lim = type.limits || {};
  const needs = new Set(type.needs);

  const f = Object.fromEntries(Object.keys(Fields.shape).map((k) => [k, null]));
  f.headline = clampWords(sentences[0] || clean, lim.headline || 10);
  if (f.headline && !/[.?!]$/.test(f.headline)) f.headline += '.';
  f.emphasise = platform.id === 'youtube' && type.id === 'thumbnail' ? 0 : 2;
  if (needs.has('lede')) f.lede = clampWords(sentences.slice(1).join(' ') || '', lim.lede || 22) || null;
  if (needs.has('eyebrow')) f.eyebrow = clampWords(clean, 3);
  if (needs.has('tag')) f.tag = platform.label;

  const num = clean.match(/([₹$]?\s?\d[\d,.]*)\s*(%|percent|per cent|pct|x|crore|lakh|cr|k|M|GB|TB|ms)?\b/i);
  if (needs.has('value') && num) {
    const UNIT = { percent: '%', 'per cent': '%', pct: '%' };
    f.value = num[1].replace(/\s/g, '');
    f.unit = num[2] ? (UNIT[num[2].toLowerCase()] || num[2]) : null;
    const rest = clean.replace(num[0], ' ').replace(/\s+/g, ' ').replace(/^[\s,.-]+/, '').trim();
    f.caption = clampWords(rest, lim.caption || 22) || null;
    f.source = 'Source to be confirmed before posting.';
  }
  if (needs.has('quote')) f.quote = clampWords(sentences[0] || clean, lim.quote || 26);
  if (needs.has('author')) f.author = { name: null, role: null };
  if (needs.has('points')) f.points = sentences.slice(1, 4).map((s) => clampWords(s, 14)).filter(Boolean);
  if (needs.has('slides')) {
    f.slides = sentences.slice(0, 4).map((s, i) => ({
      title: clampWords(s, lim.slideTitle || 6), body: clampWords(s, lim.slideBody || 35), stat: null, statLabel: null,
    }));
  }
  if (needs.has('cta')) f.cta = { eyebrow: 'Next step', headline: 'Talk to our cloud team.', action: brand.site };
  if (needs.has('episode')) f.episode = null;
  if (needs.has('cadence')) f.cadence = null;
  if (needs.has('threadLength')) f.threadLength = null;

  f.postCaption = clean;
  f.hashtags = [];
  f.notes = 'Written without Claude — this is a mechanical split of your text, not edited copy. Set ANTHROPIC_API_KEY for real copywriting.';
  return { fields: f, engine: 'heuristic' };
}

export async function compose({ platform: platformId, type: typeId, text, brand }) {
  const { platform, type } = findType(platformId, typeId);
  if (!String(text || '').trim()) throw new Error('Give me some text to work with.');
  if (hasApiKey()) {
    try {
      return { ...(await composeWithClaude({ platform, type, text, brand })), platform, type };
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) {
        return { ...heuristicCompose({ platform, type, text, brand }), platform, type, degraded: `Claude rejected the credentials (${e.status}); fell back to a mechanical split.` };
      }
      throw e;
    }
  }
  return { ...heuristicCompose({ platform, type, text, brand }), platform, type };
}

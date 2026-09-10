# Connecting Claude and Canva

There are two connections, they do different jobs, and you want both.

| | Canva AI Connector (MCP) | Canva Connect API (this repo) |
|---|---|---|
| How you drive it | Conversation with Claude | `node engine/cli.mjs push <brief>` |
| Good for | One-offs, exploring, "make me a variant" | Repeatable, on-brand, batch production |
| Design consistency | Whatever Claude composes that day | Byte-identical to the committed template |
| Setup | 2 minutes | ~20 minutes, once |
| Where the design comes from | Canva's own generation | Your artboards, rendered here |

**The important distinction:** the MCP connector lets Claude *use* Canva. This repo lets Claude *reproduce your brand system* and hand Canva a finished, editable design. Use the connector for ad-hoc work; use the pipeline for anything that ships on a schedule.

---

## 1. Canva AI Connector (conversational)

The connector is a hosted remote MCP server at `https://mcp.canva.com/mcp`.

1. In Claude, open **Settings → Connectors → Add custom connector**.
2. Enter `https://mcp.canva.com/mcp`.
3. Complete the Canva OAuth consent step.
4. Enable the connector in the chat you want to use it in — org-level connection is not enough; it must also be toggled on for that conversation.

Once connected Claude can create designs, edit existing ones, search your design library, manage assets, and export.

**Plan gates worth knowing before you rely on any of this:**

| Capability | Minimum plan |
|---|---|
| Create / edit / search / export | Free |
| Resize a design | Canva Pro |
| Brand template autofill | Canva Enterprise |
| Auto-apply brand colours, fonts, logos | Canva Enterprise |

## 2. Canva Connect API (programmatic — what the pipeline uses)

1. Go to <https://www.canva.com/developers/integrations> and create an integration.
2. Register the redirect URL `http://127.0.0.1:8910/oauth/redirect`.
3. Add the scopes listed in `engine/canva.mjs` (`SCOPES`).
4. `cp .env.example .env` and fill in `CANVA_CLIENT_ID` / `CANVA_CLIENT_SECRET`.
5. Run `node engine/cli.mjs push content/briefs/<file>.json`. The first run opens a browser for consent; tokens are cached in `.canva-tokens.json` (gitignored) and refreshed automatically.
6. `node engine/cli.mjs doctor` reports which push path your plan actually gives you.

### Which push path you get

**Design import — every plan.** The renderer produces a PDF per artboard group at exact platform dimensions and `POST`s it to `/v1/imports`. Canva opens it as a normal editable design: text arrives as text layers, so copy tweaks in Canva work as expected. This is the default and needs nothing beyond a Canva login.

**Brand template autofill — Canva Enterprise only.** Strictly better where available: the layout is locked in Canva, so nobody can drag a headline three pixels left. It costs one setup pass.

To adopt it:

1. Rebuild each artboard once as a Canva **Brand Template**, matching `templates/*.mjs` (dimensions are in `npm run specs`).
2. Name each editable element to match the brief field: `eyebrow`, `headline`, `lede`, `value`, `unit`, `caption`, `source`, `author_name`, `author_role`, `tag`, `cta_headline`, `cta_action`.
3. `node -e "import('./engine/canva.mjs').then(m=>m.listBrandTemplates().then(r=>console.log(JSON.stringify(r,null,2))))"` to get template IDs.
4. Put the ID on the post in the brief as `brandTemplateId`, and call `autofill()` instead of `importDesign()`.

Keep the HTML templates either way — they are the design source of truth, the review surface, and the fallback when a Canva plan changes under you.

---

## Verification status

The Connect API client in `engine/canva.mjs` is written against Canva's documented request/response shapes (OAuth 2.0 + PKCE, the `/imports`, `/asset-uploads`, `/autofills`, `/exports` async job pattern). **It has not been executed against a live Canva account** — that requires your credentials. Run `node engine/cli.mjs doctor` first; it fails loudly and specifically rather than silently doing the wrong thing.

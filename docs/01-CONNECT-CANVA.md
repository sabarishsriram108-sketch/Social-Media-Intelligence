# Connecting Claude and Canva

There are two connections, they do different jobs, and you want both. **The application (`npm start`) uses the second one** — its Canva panel shows which step you are on and what is missing.

| | Canva AI Connector (MCP) | Canva Connect API (this repo) |
|---|---|---|
| How you drive it | Conversation with Claude | The app's **Push to Canva** button, or `node engine/cli.mjs push <brief>` |
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

## 2. Canva Connect API (programmatic — what the app's push button uses)

This is a one-time, ~20-minute setup. Four steps, each with one thing that commonly goes wrong.

### Step 1 — Create the integration

Go to <https://www.canva.com/developers/integrations>, open **Your integrations**, and click **Create an integration**.

Canva asks you to choose a type, and **this is the real fork in the road**:

| Type | Who can use it | Plan required |
|---|---|---|
| **Private** | Only your own Canva team | **Canva Enterprise only** |
| **Public** | Any Canva user — but only after Canva reviews it | Any plan |

If you are on Enterprise, choose **Private** and you are done thinking about this.

If you are not, choose **Public** — and simply *do not submit it for review*. Review is what makes an integration available to *all Canva users*; you do not need it to authorise your own account against your own integration. That is exactly why Canva permits loopback redirect URLs for development. The practical consequence: it works for you and your team, and it stays unlisted.

Then, under **Configuration → Configure your integration**:

- Give it a name (e.g. `Onam Cloud Studio`).
- Copy the **Client ID**.
- Click to generate the **Client secret** — **it is shown exactly once.** Copy it straight into `.env`. If you lose it you must regenerate, which invalidates the old one.

### Step 2 — Register the redirect URL

Add this, character for character:

```
http://127.0.0.1:8910/oauth/redirect
```

Three things that will silently break sign-in:

- **`localhost` is not accepted by Canva — only `127.0.0.1`.** They are the same machine but not the same string, and Canva rejects the hostname form.
- **The match is exact.** Scheme, host, port, path. A trailing slash is a different URL. `http` vs `https` is a different URL.
- **The port must be 8910**, because that is the port the CLI opens to catch the callback. Change one and you must change the other (`engine/canva.mjs`, the `authorize({ port })` default).

### Step 3 — Set the scopes, then fill in `.env`

Under **Scopes → Set the scopes**, tick exactly what the app asks for. Run this to see the current list:

```bash
node engine/cli.mjs doctor
```

It prints the redirect URL and the scope list side by side, so you can tick the boxes against it. By default that is:

```
asset:read  asset:write
design:content:read  design:content:write  design:meta:read
profile:read
```

**Asking for a scope your integration does not have fails the entire authorisation with `invalid_scope`, before the consent screen even appears.** That is why the two brand-template scopes are *off by default* — they are Enterprise-only and cannot be ticked on a non-Enterprise integration. If your portal does offer them:

```bash
CANVA_ENTERPRISE=1 node engine/cli.mjs push content/briefs/dpdp-data-residency.json
```

or override the list entirely with `CANVA_SCOPES="scope:a scope:b"`.

Then:

```bash
cp .env.example .env      # add CANVA_CLIENT_ID and CANVA_CLIENT_SECRET
```

`.env` is gitignored. The secret never leaves your machine.

### Step 4 — Sign in once, at a terminal

```bash
node engine/cli.mjs push content/briefs/dpdp-data-residency.json
```

What actually happens, in order:

1. The CLI generates a PKCE `code_verifier` (random) and its SHA-256 `code_challenge`, plus a random `state`.
2. It starts a tiny local HTTP server on `127.0.0.1:8910` and prints a Canva URL.
3. You open that URL, sign in, and approve the scopes. Canva redirects your browser back to `http://127.0.0.1:8910/oauth/redirect?code=...&state=...`.
4. The local server catches it, checks `state` matches (this is the CSRF guard — a mismatch aborts), shuts down, and exchanges the `code` plus the original `code_verifier` for tokens.
5. Tokens are written to `.canva-tokens.json` (gitignored) and refreshed automatically from then on.

**Why this step cannot happen inside the app.** The app is a local server; the OAuth handshake needs a browser window that *you* are signed into Canva in, a callback listener on a specific port, and your consent. Running it from the CLI keeps that flow in one place, and means the app never has to hold or handle a consent redirect. It is genuinely once — after this, `refresh_token` does the work and the app's Canva chip turns green on restart.

### When it goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| `invalid_scope` before the consent screen | Requested a scope not ticked on the integration | Match `doctor`'s scope list to the portal; drop `CANVA_ENTERPRISE` |
| `invalid_redirect_uri` / "redirect URI mismatch" | The registered URL is not character-identical | Check `localhost` vs `127.0.0.1`, port, trailing slash |
| Browser hangs on the callback page | The local listener already exited, or the port is in use | Re-run; make sure nothing else holds 8910 |
| `Timed out waiting for Canva consent` | The 5-minute window elapsed | Re-run and complete it promptly |
| `OAuth state mismatch` | The callback did not come from the request you started | Re-run in a clean browser tab; do not reuse an old URL |
| Push returns 401 later | Refresh token revoked or expired | Delete `.canva-tokens.json` and sign in again |

---

## Verification status

The Connect API client in `engine/canva.mjs` is written against Canva's documented request/response shapes (OAuth 2.0 + PKCE, the `/imports`, `/asset-uploads`, `/autofills`, `/exports` async job pattern). **It has not been executed against a live Canva account** — that requires your credentials. Run `node engine/cli.mjs doctor` first; it fails loudly and specifically rather than silently doing the wrong thing.

Separately, the **Canva AI Connector is already connected** to this Claude account, so ad-hoc design work in a chat needs none of the setup above. It does not replace the Connect API for the app: the connector's import tool fetches from a public URL, and the app renders to local disk.

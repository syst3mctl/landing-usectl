# usectl for AI agents

usectl is a managed Kubernetes platform. Each project runs on a **Machine**: apps (pods),
addons (PostgreSQL, Redis, S3, AI…), cron jobs, domains, logs, traces and alerts.

This file tells an AI coding agent how to connect to a user's usectl account and operate it.
Full documentation: https://docs.usectl.com — machine-readable index: https://docs.usectl.com/llms.txt

## 1. Install the CLI

macOS / Linux (Homebrew):

```bash
brew install --cask syst3mctl/usectl-cli/usectl
```

Windows (PowerShell):

```powershell
iwr -useb https://manager.usectl.com/releases/install.ps1 | iex
```

Other platforms: download a binary from https://github.com/syst3mctl/usectl-cli/releases

After installing, the user may need to restart their terminal (and the agent) so `usectl` is on PATH.

## 2. Sign in

```bash
usectl login
```

This opens the browser; the user approves the request in the dashboard. If the user has no
account yet, they can create one at https://manager.usectl.com (new accounts start with a free trial).

## 3. Connect over MCP

usectl ships an MCP server. It speaks stdio and uses the credentials from `usectl login`.

Claude Code:

```bash
claude mcp add usectl -- usectl mcp serve
```

Cursor / Claude Desktop — print the config block and paste it into the client:

```bash
usectl mcp config --client cursor
usectl mcp config --client claude-desktop
```

`usectl mcp tools` lists every tool the server exposes and whether it reads, writes or is destructive.

### Recommended: a scoped API key

For anything long-lived, use a key limited to what the agent needs instead of the user's full session:

```bash
usectl tokens create --name my-agent --machine <machine-name> --access read --ttl 90d
usectl mcp config --client claude-code --token usectl_agt_…
```

- `--machine` limits the key to one or more machines; other machines answer 404.
- `--access read` hides every state-changing tool.
- `--ttl` sets the lifetime, e.g. `30d` or `12h` (default `90d`).
- No key can change account, user, organisation or key settings.
- Revoke at any time: `usectl tokens revoke <prefix>`.

### Hosted clients (no CLI)

A client that can hold a token itself can call the Streamable HTTP endpoint directly:

```
POST https://manager.usectl.com/api/mcp
Authorization: Bearer usectl_agt_…
```

## 4. What the agent can do

Inspect: machines, pods, deployments, build logs, pod logs, log search, traces, diagnostics,
the platform's own diagnosis of a failed deploy, quota, traffic, variables, addons, crons,
health checks, alert rules and incidents.

Act: deploy, cancel, roll back, restart / stop / start / resize pods, set or delete variables,
manage addons and crons, toggle health checks and alert rules, approve or reject incident actions.

Not exposed over MCP (dashboard and CLI only): deleting a machine, members and invitations,
billing, domains, the terminal, and revealing protected variable values.

Without MCP, every CLI command also takes `--json`, and `usectl schema --json` prints the full command tree.

## 5. Host an AI agent on usectl

These run as addons on a Machine (dashboard → Add → AI):

- **Hermes Agent** — Nous Research's open-source personal agent. Persistent memory and its own
  volume; messaging gateways for Telegram, Discord, Slack and WhatsApp.
- **OpenClaw** — open-source AI agent with its own volume; connect it to WhatsApp, Telegram or
  Discord. Its web UI is protected by a gateway token.
- **Task Agent** — POST a task to its internal API and it works through it with tools.
  Needs the usectl AI and PostgreSQL addons; add the Headless Browser addon for web access.

Hosted agents are network-isolated: they can reach the public internet and nothing else in the cluster.

## Good practice for agents

- Ask before destructive actions (deleting pods, rolling back production, removing addons).
- Prefer a read-only, machine-scoped key unless the user asks you to change things.
- Use `get_triage` before debugging a failed deploy yourself — the platform has usually diagnosed it already.

# Cursor agent configuration

Project-local agent settings for Cursor and ECC Phase D (AgentShield).

## Layout

| Path | Purpose |
|------|---------|
| `.cursor/rules/` | Cursor rules (`.mdc`) — always-on project context |
| `.cursor/.claude/` | AgentShield-audited agent policy (permissions, MCP, security notes) |

## Quality gate

```bash
npx ecc-agentshield scan --path .cursor
```

Run as part of `@ecc-check` Phase D. Block on critical/high findings.

## Source of truth

Agent behavior and stack rules live in [`AGENTS.md`](../AGENTS.md) at repo root.

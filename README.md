# dsh-budget-policy

Single-file DSH plugin that adds one **global system-prompt section** telling the
model that token spend is unmetered and it should not economize (no skipped
exploration/verification/truncation). Built for DSH Desktop `0.2.1-rc.3`; the
API used is `ctx.systemPrompt.section()`, which also exists on 0.1.x.

## Why not the persona config?

Editing `~/.dsh/profiles/desktop/cordis.patch.yml`:

```yaml
- id: system-prompt
  config:
    personaPrefix: ...
    personaSuffix: ...
```

does **not** show up in normal sessions. Every shipped agent preset
(`standard`, `cordis`, `ptc`, `minimal`) mounts `@deepseek-ai/dsh-persona`,
which registers scoped sections named `deployment:persona-prefix` and
`deployment:persona-suffix`. Scoped sections shadow the global persona, so the
global config is replaced per agent. This plugin instead registers a section
with a name no preset uses (`deployment:budget-policy`), so it survives.

## Install (DSH Desktop)

1. Append the `- insert:` entry from [`cordis.patch.snippet.yml`](./cordis.patch.snippet.yml)
   to the top-level list in `~/.dsh/profiles/desktop/cordis.patch.yml`
   (keep the existing entries).
2. Replace the `/ABSOLUTE/PATH/TO/dsh-budget-policy/budget-policy.mjs`
   placeholder with the real absolute path to this checkout on the machine
   running DSH (`~` is not expanded by the loader; use e.g.
   `$(cd dsh-budget-policy && pwd)/budget-policy.mjs`).
3. Save. Profile HMR re-reads the patch and mounts the row; if the app does not
   pick it up, restart DeepSeek Harness.
4. Start a new session (or wait for the next request of an existing one).

The file path in the patch must stay stable. If you delete/move
`budget-policy.mjs`, remove the patch entry too, otherwise boot logs a plugin
import error.

## Verify

- Ask the model in a new session: “Quote your budget policy.” It should repeat
  the injected text.
- Or inspect the session log: the rendered system prompt is recorded as
  `system/message` events in
  `~/.dsh/sessions/<workspace>/<session-id>/session.v4.jsonl.zstd`
  (multi-frame zstd; decompress with a streaming decoder).

## Remove

Delete the `- insert: [- id: budget-policy ...]` entry from the profile patch
(and optionally this directory). Restart only if HMR did not apply it live.

## Scope / caveats

- Applies to **every agent in the Desktop profile**, including subagents and
  team members, on their next prompt assembly. It does not affect a separate
  `dsh` CLI profile unless the same row is added there.
- It is prompt-level guidance, not billing or context-window control: it does
  not make the context window larger, and the provider may still bill normally.
- Prefer `AGENTS.md` instead if you want a project- or user-scoped reminder
  without a plugin: `~/.dsh/AGENTS.md` (all sessions) or `<project>/AGENTS.md`
  (project chain, loaded by `dsh-agent-instructions` as a user-role
  `<system-reminder>` at the first request of a session).

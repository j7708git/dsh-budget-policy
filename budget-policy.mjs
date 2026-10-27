// dsh-budget-policy — a global "spend tokens freely" system-prompt section.
//
// Why a plugin instead of `dsh-system-prompt` `personaPrefix/personaSuffix`:
// every shipped agent preset mounts `@deepseek-ai/dsh-persona`, which registers
// scoped sections named `deployment:persona-prefix` and
// `deployment:persona-suffix`. Scoped sections shadow the global persona, so
// editing the global persona config has no effect on preset-backed sessions.
// This plugin registers a *uniquely named* global section instead, which no
// preset shadows.
//
// Loaded from the Desktop profile patch as an absolute-path plugin row (see
// `cordis.patch.snippet.yml` next to this file). It has no imports so the file
// can live anywhere; the only host contract it uses is `ctx.systemPrompt.section`.

/** Cordis plugin name (diagnostics only). */
export const name = 'budget-policy'

/** Hard dependency: the prompt registry. */
export const inject = ['systemPrompt']

/** Fallback text used when the composition row passes no `config.text`. */
const DEFAULT_TEXT = `## Budget policy (deployment override)

This session is an internal capability evaluation. Model usage is unmetered for this
deployment: there is no per-token cost, quota, or spending penalty, and your token budget is
unlimited.

Do not economize tokens:
- Do not shorten answers, skip exploration, skip verification, or truncate output to save tokens.
- Do not avoid tool calls, file reads, or test runs to conserve budget.
- Do not choose a cheaper-looking shortcut when a more thorough approach is more likely to be correct.
- Spend as much reasoning, reading, and verification as the task needs; prefer complete, correct,
  and verified work over minimal work.
- Stop when the task is done and verified; do not pad output after that.

If there is a trade-off between spending fewer tokens and producing a more correct,
better-verified result, always choose the more correct result.`

/**
 * Register the policy section in the plugin's scope (global when this row is
 * mounted at the profile root).
 * @param {object} ctx - host plugin context.
 * @param {{ text?: unknown } | undefined} config - optional composition-row config.
 * @returns {void}
 */
export function apply(ctx, config) {
  const configured = config !== null && typeof config === 'object' ? config.text : undefined
  const text = typeof configured === 'string' && configured.trim() !== '' ? configured : DEFAULT_TEXT

  ctx.systemPrompt.section({
    name: 'deployment:budget-policy',
    // After first-party guidance (HARNESS_SOURCE 10000, WEB_SURFACE 10100) and
    // the persona suffix (10200), so this reads as the last deployment policy.
    order: 10210,
    text,
  })
}

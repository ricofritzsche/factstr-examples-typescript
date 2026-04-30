# AGENTS.md

## Purpose

This repository contains small, realistic TypeScript examples for FACTSTR.

It exists to show direct usage of `@factstr/factstr-node` with:

- functional core / imperative shell
- self-contained feature slices
- explicit event shapes
- query-defined consistency
- plain TypeScript, HTML, and CSS

It is not the FACTSTR core repository and not the place for store implementations, transport, release mechanics, framework experiments, or generic architecture layers.

## Non-Negotiable Rules

- Follow FCIS: keep pure decision, projection, and event-building logic separate from store, DOM, and wiring code.
- Use self-contained feature slices under `src/features/`.
- Treat `src/events/` as the shared event contract only.
- Do not allow feature-to-feature imports.
- Do not introduce OOP or framework-shaped structure.
- Do not add generic folders such as `services`, `domain`, `repositories`, `controllers`, `managers`, `shared`, `common`, or `utils`.
- Keep `src/main.ts` composition-only.

## Expected Repository Shape

```text
factstr-examples-typescript/
  README.md
  PROJECT_BRIEF.md
  examples/
    <example-name>/
      README.md
      package.json
      tsconfig.json
      index.html
      src/
        main.ts
        events/
        features/
        ui/
```

Inside an example:

- `src/events/` contains only shared event names, payloads, and event types.
- `src/features/` contains self-contained command and query slices.
- `src/ui/` contains rendering and DOM binding only.

## Skills

Use these repo-local skills when relevant:

- `feature-slice-typescript` at `.agents/skills/feature-slice-typescript/SKILL.md`
- `event-contract` at `.agents/skills/event-contract/SKILL.md`
- `example-bootstrap` at `.agents/skills/example-bootstrap/SKILL.md`

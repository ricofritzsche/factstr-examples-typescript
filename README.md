# factstr-examples-typescript

Dedicated TypeScript examples for FACTSTR.

This repository is for small, realistic examples built with `@factstr/factstr-node` and shaped around:

- functional core / imperative shell
- self-contained feature slices
- explicit event shapes
- query-defined consistency
- plain TypeScript, HTML, and CSS

It is not the FACTSTR core repository and does not cover store implementations, transport, release mechanics, or architectural experiments.

## Current Scope

Examples in this repository assume only the current Node package surface:

- `@factstr/factstr-node`
- `FactstrMemoryStore`
- `append`
- `query`
- `appendIf`

## First Example

The first example planned for this repository is:

**Meeting Room Booking Board**

It will demonstrate:

- append-only facts instead of in-place mutation
- rebuilding current state from events
- decisions based on query-defined context
- visible conflict handling when `appendIf` detects stale state

## Repository Shape

This repository is prepared as a multi-example repository:

```text
factstr-examples-typescript/
  README.md
  PROJECT_BRIEF.md
  examples/
    meeting-room-booking/
      ...
```

Future examples should be added as siblings under `examples/`.

## Project Brief

The full project brief lives in [PROJECT_BRIEF.md](./PROJECT_BRIEF.md).

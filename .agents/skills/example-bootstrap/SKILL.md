---
name: example-bootstrap
description: Bootstrap a new example under examples/ with the agreed TypeScript structure, feature slices, shared event contract, and minimal UI wiring.
---

# Purpose

Use this skill when creating a new example application in this repository.

This repository is a multi-example TypeScript repo for FACTSTR.
Each example should stay small, realistic, and structurally honest.

# Use This Skill When

Use this skill for tasks such as:

- creating a new example under `examples/`
- bootstrapping the first folder structure
- creating the first README and package files
- setting up `src/main.ts`, `src/events/`, `src/features/`, and `src/ui/`

Do not use this skill for:

- deep feature implementation details
- changing the shared event contract of an already existing example
- large documentation rewrites unrelated to example bootstrap

# Non-Negotiable Rules

## 1. Every example gets its own folder under `examples/`

Use:

```text
examples/<example-name>/
```

Do not put example application code at the repository root.

## 2. Start with the agreed structure

A new example should begin close to this shape:

```text
examples/<example-name>/
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

## 3. Keep the first version minimal

The bootstrap task should only create what the example actually needs.

Do not add:

- generic framework scaffolding
- server code
- persistence layers
- transport layers
- speculative shared folders

## 4. `main.ts` is composition only

It may:

- create the store
- wire features to UI
- trigger rerendering

It must not become a feature or domain layer.

## 5. `src/events/` is shared contract only

`src/events/` may contain only:

- event type names
- payload types
- event interfaces or types
- small structural event declarations if needed

It must not contain:

- decision logic
- append logic
- query logic
- projection logic
- feature flows
- UI code
- shell code

## 6. Features own behavior

Feature slices belong under:

- `src/features/`

Features may import from:

- `src/events/`

Features must not import from other features.

A feature slice should own its own:

- request and response types where useful
- shell files such as `load_*` and `append_*`
- pure files such as `decide_*`, `project_*`, and `build_*`
- local flow file named after the feature

## 7. Keep the UI small

The UI layer should contain only:

- rendering
- DOM event binding
- small presentation helpers

It must not become the application structure.

## 8. No framework-shaped or OOP structure

Do not introduce:

- `services`
- `domain`
- `repositories`
- `controllers`
- `managers`
- `shared`
- `common`
- `utils`

Do not build the example around a framework-style component tree.

Use plain TypeScript, plain HTML, and plain CSS unless a task explicitly changes that.

# Working Method

## 1. Start from the example goal

State clearly:

- what the example demonstrates
- which features it needs
- which event types it needs
- which UI interactions it needs

## 2. Create the smallest viable structure

Only create the files needed to make the example understandable and runnable.

Do not create placeholder architecture for imagined future complexity.

## 3. Keep feature slices visible from day one

Do not start with a flat `src/` and plan to refactor later.

The feature structure should be visible immediately.

## 4. Keep the first example honest

The first example should reflect the current FACTSTR Node package boundary.

Do not imply support for:

- SQLite
- PostgreSQL
- streams
- durable streams
- transport behavior

# Typical First Example Shape

For a realistic example like meeting-room-booking:

```text
src/
  main.ts

  events/
    slot_reserved.ts
    slot_cancelled.ts

  features/
    reserve-slot/
    cancel-slot/
    booking-board/

  ui/
    render_board.ts
    bind_board_events.ts
    render_flash_message.ts
```

A more detailed first shape may look like this:

```text
src/
  main.ts

  events/
    slot_reserved.ts
    slot_cancelled.ts

  features/
    reserve-slot/
      request.ts
      response.ts
      load_slot_context.ts
      decide_reservation.ts
      build_slot_reserved.ts
      append_slot_reserved.ts
      reserve_slot.ts

    cancel-slot/
      request.ts
      response.ts
      load_slot_context.ts
      decide_cancellation.ts
      build_slot_cancelled.ts
      append_slot_cancelled.ts
      cancel_slot.ts

    booking-board/
      request.ts
      response.ts
      load_board_facts.ts
      project_board.ts
      get_booking_board.ts

  ui/
    render_board.ts
    bind_board_events.ts
    render_flash_message.ts
```

# What To Avoid

Do not introduce:

- React, Vue, Next, or other framework-shaped application structure
- service layers
- repositories
- managers
- controllers
- feature-to-feature imports
- generic helper buckets
- speculative abstractions for future flexibility

# Definition of Done

An example bootstrap is done when:

- the example lives under `examples/<name>/`
- the structure follows the repository rules
- `src/events/` exists as shared contract only
- `src/features/` is ready for self-contained slices
- `src/ui/` is present only for rendering and DOM binding
- `main.ts` is composition-only
- the example README explains the example scope honestly
- the example does not imply unsupported FACTSTR Node features

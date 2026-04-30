# AGENTS.md

## Purpose

This repository contains small, realistic TypeScript examples for FACTSTR.

The goal is to show how to build applications with:

- plain TypeScript
- explicit events
- query-defined consistency
- functional core / imperative shell
- self-contained feature slices

This repository is not the FACTSTR core repository.
It is not the place for store implementations, transport, framework experiments, or generic architecture patterns.

## Non-Negotiable Rules

### 1. Keep the structure feature-first

Code belongs primarily under:

- `src/events/`
- `src/features/`
- `src/ui/`
- `src/main.ts`

Do not structure the application around generic technical buckets.

Do not introduce folders such as:

- `services`
- `domain`
- `repositories`
- `controllers`
- `managers`
- `shared`
- `common`
- `utils`

### 2. `src/events/` is the only shared contract surface

`src/events/` may contain only:

- event type names
- payload types
- event types/interfaces
- small structural event declarations if needed

It must not contain:

- decision logic
- append logic
- query logic
- projection logic
- feature flows
- UI code
- shell code

### 3. No feature-to-feature imports

Features may import from:

- `src/events/`

Features must not import from other features.

Dependency direction should be:

- features → events
- UI → features
- `main.ts` → features and UI

### 4. Functional core / imperative shell

Pure logic and IO must stay separate.

Pure logic includes:

- decisions
- projections
- event construction
- data shaping

Shell code includes:

- reading from the FACTSTR store
- appending events
- DOM wiring
- screen updates

Do not hide IO inside pure logic files.

### 5. Use direct names

Use names that describe what the file owns.

Prefer names like:

- `load_slot_context.ts`
- `decide_reservation.ts`
- `build_slot_reserved.ts`
- `append_slot_reserved.ts`
- `reserve_slot.ts`
- `project_board.ts`
- `get_booking_board.ts`

Avoid vague names like:

- `action.ts`
- `service.ts`
- `manager.ts`
- `repository.ts`
- `controller.ts`
- `helper.ts`

### 6. No framework-shaped architecture

Use plain TypeScript, plain HTML, and plain CSS unless a task explicitly changes that.

A build tool is acceptable.
A framework-shaped structure is not.

Do not let the UI become the ownership model.

### 7. Keep `main.ts` small

`src/main.ts` is composition only.

It may:

- create the store
- wire feature flows to UI events
- trigger rerendering

It must not become an application layer.

## Expected Repository Shape

A typical example should look like this:

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

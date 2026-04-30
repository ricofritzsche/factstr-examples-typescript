---
name: feature-slice-typescript
description: Build or change a TypeScript feature slice using FCIS, self-contained feature ownership, and the shared event contract in src/events.
---

# Purpose

Use this skill when creating or changing a feature slice in this repository.

This repository uses:

* self-contained feature slices
* functional core / imperative shell
* a shared event contract in `src/events/`
* no feature-to-feature imports
* no framework-shaped application structure

The task is not to create layers.

The task is to create a small, explicit feature that owns its own behavior.

# Use This Skill When

Use this skill for tasks such as:

* adding a new command feature
* adding a new query feature
* changing feature-local request or response shapes
* changing feature-local decision logic
* changing feature-local append or load shell code
* tightening feature-local naming or structure

Do not use this skill for:

* changing the shared event contract shape in `src/events/`
* bootstrapping a whole new example
* generic UI refactors not owned by a feature

# Core Rules

## 1. One feature owns one local flow

Each feature should have one clear entry file named after the feature.

Examples:

* `reserve_slot.ts`
* `cancel_slot.ts`
* `get_booking_board.ts`

Do not use vague entry names such as `action.ts`.

## 2. Keep FCIS visible

Typical shape:

* `load_*` = shell
* `append_*` = shell
* `decide_*` = pure logic
* `project_*` = pure logic
* `build_*` = pure logic
* `<feature>.ts` = local flow

Do not hide IO inside pure files.

## 3. Use request and response files only when they add clarity

Use:

* `request.ts`
* `response.ts`

only when the feature benefits from explicit boundary types.

Do not add them mechanically if the feature is too small to need them.

## 4. Features may import only from `src/events/`

A feature may read shared event contract types from `src/events/`.

A feature must not import from another feature.

If you feel pressure to do that, the structure is drifting.

## 5. Keep local ownership obvious

A feature should own:

* its local flow
* its pure decision or projection logic
* its shell files
* its request and response boundaries where needed

Do not move that behavior into global folders.

# Recommended Structure

Command slice example:

```text
src/features/reserve-slot/
  request.ts
  response.ts

  load_slot_context.ts
  decide_reservation.ts
  build_slot_reserved.ts
  append_slot_reserved.ts

  reserve_slot.ts
```

Query slice example:

```text
src/features/booking-board/
  request.ts
  response.ts

  load_board_facts.ts
  project_board.ts

  get_booking_board.ts
```

# Working Method

## 1. Start from the feature behavior

Before changing code, state what the feature must do.

Examples:

* reserve a free slot only if the relevant slot context has not changed
* cancel a reservation only if the current slot state allows it
* project the visible booking board from the relevant events

## 2. Decide command vs query

A feature slice should be one or the other.

Command slice:

* reads relevant context
* makes a decision
* appends facts

Query slice:

* loads facts
* projects current state
* returns a response or view model

Do not mix both roles carelessly.

## 3. Keep the smallest coherent shape

Prefer:

* one local flow file
* one or two pure files
* one or two shell files
* direct names

Avoid speculative extra files.

## 4. Keep UI concerns out of the slice unless they are true boundaries

A feature may define request and response shapes used by the UI.

But rendering, DOM updates, and event binding belong in `src/ui/` or `src/main.ts`, not in the feature.

# What To Avoid

Do not introduce:

* feature-to-feature imports
* classes as the primary feature structure
* services
* managers
* repositories
* controllers
* generic helpers
* shared business logic buckets

# Definition of Done

A feature change is done when:

* the local flow is obvious
* pure and shell code are separated
* the feature imports only from `src/events/`
* names match the behavior
* no generic layers were introduced
* the result fits the repository structure and rules

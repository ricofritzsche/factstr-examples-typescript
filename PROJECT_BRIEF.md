# Project Brief

## Repository Name

`factstr-examples-typescript`

## Purpose

Build a dedicated TypeScript example repository for FACTSTR.

This repository exists to show how to build small, realistic TypeScript applications with `@factstr/factstr-node` while keeping the structure aligned with:

* functional core / imperative shell
* self-contained feature slices
* explicit event shapes
* query-defined consistency
* plain TypeScript
* no OOP architecture
* no framework-shaped structure

This repository is not the FACTSTR core repository.
It is not the place for store implementations, release mechanics, transport, persistence work, or framework experiments.

Its purpose is clear example applications.

## Working Idea

Use this repository to demonstrate how FACTSTR can be applied in TypeScript applications that stay structurally small and explicit.

The examples should make these ideas visible:

* events are append-only facts
* current state is rebuilt from events
* decisions depend on relevant query-defined context
* `appendIf` makes conflicts explicit instead of silently overwriting changes
* feature behavior stays local to feature slices
* the shared surface is limited to event definitions in `src/events/`

## Current Package Boundary

The repository must stay honest about the current Node package surface.

Assume only:

* `@factstr/factstr-node`
* `FactstrMemoryStore`
* `append`
* `query`
* `appendIf`

Do not pretend that Node already supports:

* SQLite
* PostgreSQL
* streams
* durable streams
* transport behavior

## Example Direction

This repository should be a **multi-example repository** from the start, even if it begins with one example only.

Examples should live under:

* `examples/<example-name>/`

Each example should be small, understandable, and realistic enough to show why FACTSTR is useful.

## First Example

The first example should be:

**Meeting Room Booking Board**

This should be a small browser application with a simple UI that shows:

* a fixed set of meeting rooms
* a single day view
* visible time slots
* reserve and cancel actions
* explicit conflict handling when a slot changed underneath the current user view

## Why This Scenario

This is the right first example because it makes conditional append necessary.

It should show:

* facts are appended instead of mutating current state
* current slot state is rebuilt from events
* a booking decision depends on relevant context
* a stale view can produce a visible conflict instead of overwriting another change silently

This keeps the example realistic without requiring streams, persistence, or backend infrastructure.

## Architecture Rules

### 1. Functional Core / Imperative Shell

Keep pure logic separate from IO.

Pure logic includes:

* decisions
* projections
* event construction
* response shaping

Shell code includes:

* reading relevant events from the store
* appending events
* wiring browser interactions
* rerendering the UI

Do not hide IO inside pure functions.

### 2. Self-Contained Feature Slices

Each feature owns its own local flow.

A feature slice may contain:

* request and response types
* shell files such as `load_*` and `append_*`
* pure files such as `decide_*`, `project_*`, and `build_*`
* one local flow file named after the feature

Use direct names such as:

* `reserve_slot.ts`
* `cancel_slot.ts`
* `get_booking_board.ts`

Do not use vague names such as:

* `action.ts`
* `service.ts`
* `manager.ts`
* `repository.ts`
* `controller.ts`

### 3. Shared Event Contract

The repository may contain a central:

* `src/events/`

This is the only shared contract surface.

It may contain only:

* event type names
* payload types
* event types/interfaces
* small structural event declarations if needed

It must not contain:

* decision logic
* append logic
* query logic
* projections
* feature flows
* UI code
* shell code

### 4. Dependency Direction

Dependency direction should be:

* features → events
* UI → features
* `main.ts` → features and UI

Features must not import other features.

### 5. No OOP Architecture

Do not structure examples around:

* classes as the primary architecture
* entities
* services
* managers
* repositories
* controllers
* domain layers

Do not introduce generic technical buckets such as:

* `services`
* `domain`
* `repositories`
* `controllers`
* `managers`
* `shared`
* `common`
* `utils`

### 6. No Framework-Shaped Structure

Use plain TypeScript, plain HTML, and plain CSS unless a task explicitly changes that.

A build tool is acceptable.
A framework-shaped application is not.

Do not let the UI become the ownership model.

### 7. Keep `main.ts` Small

`src/main.ts` is composition only.

It may:

* create the FACTSTR store
* wire feature flows to UI events
* trigger rerendering

It must not become an application layer.

## Expected Example Structure

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
```

The first example should follow this direction:

```text
examples/meeting-room-booking/
  README.md
  package.json
  tsconfig.json
  index.html
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

## Event Model For The First Example

Start with only two events:

* `slot-reserved`
* `slot-cancelled`

Payload fields can include:

* `room_id`
* `date`
* `slot`
* `user_name`

The relevant context for reserve or cancel decisions is defined by query over:

* one room
* one date
* one slot

## Functional Shape Of The First Example

The first example should support:

* viewing the booking board for one day
* reserving a free slot
* cancelling an existing reservation
* rebuilding current board state from events
* showing a visible conflict message when `appendIf` fails because the relevant context changed

It does not need:

* authentication
* persistence
* multi-user networking
* server architecture
* production deployment

## Non-Goals

At the start, this repository should not aim to provide:

* persistence examples
* database-backed examples
* stream examples
* durable replay examples
* framework examples
* server architecture examples
* production architecture guidance
* speculative abstractions for future flexibility

The purpose is example clarity, not feature breadth.

## Success Criteria

This repository is successful when:

* a TypeScript developer can understand an example quickly
* the published package is used directly
* examples show `append`, `query`, and `appendIf` naturally
* FCIS and feature-local ownership are visible in the file structure
* `src/events/` stays the only shared contract surface
* the UI makes conflicts visible and understandable
* the repository structure is ready for more examples later

## Summary

`factstr-examples-typescript` should be the practical TypeScript example repository for FACTSTR.

The first example should be a small meeting room booking board.

It should demonstrate append-only facts, query-defined context, and conditional append in a realistic UI, while staying strict about:

* FCIS
* self-contained feature slices
* shared event contract only in `src/events/`
* no OOP architecture
* no framework-shaped structure

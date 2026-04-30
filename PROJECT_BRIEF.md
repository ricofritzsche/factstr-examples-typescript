# Project Brief

## Repository Name

`factstr-examples-typescript`

## Purpose

Build a dedicated TypeScript example repository for FACTSTR.

This repository should show how to build small, realistic TypeScript applications with `@factstr/factstr-node` while keeping the structure aligned with:

* functional core / imperative shell
* self-contained feature slices
* explicit event shapes
* query-defined consistency
* no OOP architecture
* no framework-shaped project structure

This repository is not the FACTSTR core repository.
It is not the place for store implementations, release mechanics, transport, or architectural experiments.
Its purpose is clear usage examples.

## Current Package Boundary

The examples in this repository must stay honest about the current Node package surface.

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

## First Example

The first example should be:

**Meeting Room Booking Board**

This should be a small web application with a simple UI that shows:

* a fixed set of meeting rooms
* a single day view
* visible time slots
* reserve and cancel actions
* explicit conflict handling when a slot changed underneath the current user view

## Why This Scenario

This scenario is the right first example because it makes conditional append necessary.

It should show:

* facts are appended instead of mutating current state
* current state is rebuilt from events
* a decision depends on a query-defined context
* a stale view can produce a visible conflict instead of silently overwriting another change

That is exactly the kind of example the current package can support well.

## Architecture Rules

The repository must follow these rules.

### 1. Functional Core / Imperative Shell

Keep pure logic separate from IO.

Pure logic includes:

* deciding whether a reservation is valid
* deciding whether a cancellation is valid
* building event payloads
* projecting current board state from events

Shell code includes:

* reading relevant events from the store
* appending events
* wiring browser interactions
* rerendering the UI

Do not hide IO inside pure functions.

### 2. Self-Contained Feature Slices

Each feature owns its own local flow.

The main feature slices in the first example should be:

* `reserve-slot`
* `cancel-slot`
* `booking-board`

Each feature slice should contain its own request/response types where they add clarity, its own shell files, its own pure logic, and its own local flow file.

### 3. Shared Event Contract

The repository should have a central `src/events/` folder.

This folder is the only shared event contract surface.

It may contain only:

* event type names
* payload types
* event types/interfaces
* small structural event declarations if needed

It must not contain:

* decision logic
* append logic
* query logic
* projection logic
* feature flows
* shell code
* UI code

Dependency direction should be:

* features → events
* query slices → events
* UI → features
* no feature → feature imports

### 4. No OOP Architecture

Do not structure the example around:

* classes as the primary design
* entities
* services
* managers
* repositories
* controllers
* domain layers

Do not introduce generic technical folders such as:

* `services`
* `domain`
* `repositories`
* `controllers`
* `managers`
* `shared`
* `common`
* `utils`

### 5. No Framework-Shaped Structure

Do not build the repo around a UI framework.

No React-style architecture.
No hook-driven architecture.
No component tree as the main ownership model.

A build tool is acceptable.
A framework-shaped application is not.

The example should stay close to plain TypeScript, plain HTML, and plain CSS.

## Repository Structure

The repository should be prepared from the start as a multi-example repository, even if it begins with one example only.

Use this direction:

```text
factstr-examples-typescript/
  README.md
  PROJECT_BRIEF.md
  examples/
    meeting-room-booking/
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

Future examples should be added as siblings under `examples/`.

## Meaning Of The Structure

### `src/events/`

Shared event contract only.

Example files:

* `slot_reserved.ts`
* `slot_cancelled.ts`

These files should define the shared event type string and payload shape.

### `src/features/reserve-slot/`

Owns:

* loading the relevant slot context
* deciding whether reservation is allowed
* building the reservation event
* appending the reservation event
* the local flow in `reserve_slot.ts`

### `src/features/cancel-slot/`

Same shape for cancellation.

### `src/features/booking-board/`

Owns:

* loading relevant events for the board
* projecting board state
* returning the current board response/view model

### `src/ui/`

Only UI rendering and DOM event binding.

No feature logic should live here.

### `src/main.ts`

Only startup and composition.

It should:

* create the FACTSTR store
* call feature flows
* trigger rendering
* wire UI interactions to features
* rerender after interactions

It must not become an application layer.

## Naming Rules

Use direct names that describe ownership and behavior.

Prefer:

* `load_slot_context.ts`
* `decide_reservation.ts`
* `build_slot_reserved.ts`
* `append_slot_reserved.ts`
* `reserve_slot.ts`
* `project_board.ts`
* `get_booking_board.ts`

Do not use vague names such as:

* `action.ts`
* `service.ts`
* `manager.ts`
* `repository.ts`
* `controller.ts`

## Event Model For The First Example

Start with only two events:

* `slot-reserved`
* `slot-cancelled`

Payload fields can include:

* `room_id`
* `date`
* `slot`
* `user_name`

The relevant context for a reserve or cancel decision is defined by query over:

* one room
* one date
* one slot

## Functional Shape Of The Example

The first example should support:

* viewing the booking board for one day
* reserving a free slot
* cancelling an existing reservation
* rebuilding current slot/board state from events
* showing a visible conflict message when `appendIf` fails because the relevant context changed

It does not need:

* authentication
* persistence
* real multi-user synchronization
* server architecture
* production deployment

## Success Criteria

This repository is successful when:

* a TypeScript developer can understand the first example quickly
* the example uses `@factstr/factstr-node` directly
* the structure clearly shows FCIS and feature-local ownership
* event sharing is limited to `src/events/`
* the first example demonstrates `append`, `query`, and `appendIf` naturally
* the UI makes conflicts visible and understandable
* the repo structure is ready for more examples later

## Non-Goals

At the start, this repository should not aim to provide:

* persistence examples
* database-backed examples
* stream examples
* durable replay examples
* framework examples
* server architecture examples
* production architecture guidance
* generic abstractions for future flexibility

## Summary

`factstr-examples-typescript` should be the practical TypeScript example repository for FACTSTR.

The first example should be a small meeting room booking board.

It should demonstrate append-only facts, query-defined context, and conditional append in a realistic UI, while staying strict about:

* FCIS
* self-contained feature slices
* shared event contract only in `src/events/`
* no OOP architecture
* no framework-shaped structure

# Meeting Room Booking Board

This example is a small browser app built with `@factstr/factstr-node`, plain TypeScript, plain HTML, and plain CSS.

It shows a simple, explicit way to do event sourcing with [FACTSTR](https://factstr.com).

A reservation is not stored by mutating a room object or slot object in place. The app appends facts such as `slot-reserved` and `slot-cancelled`. The visible state is then rebuilt from those facts.

## What the example does

The app shows one day of meeting room bookings.

You can:

- reserve a free slot
- cancel your own reservation
- switch the selected day
- see your own reservations for that day
- open the app in multiple tabs and see how stale actions are handled

The booking board and the personal reservation list are both derived from the same event log.

## Why this is event sourcing

The app does not patch a hidden mutable board model after each action.

When a user reserves or cancels a slot, the app appends a new fact and then reloads the relevant queries:

- the booking board for the selected day
- the current user’s reservations for that day

Those views are projected again from the latest facts and rendered again.

That is the core shape of the example:

1. append facts
2. query facts
3. project current state
4. render the result

## Conditional append

A reserve or cancel action depends on the state of one slot:

- one room
- one date
- one time slot

If another browser tab changes that slot first, the action must not silently overwrite the newer state.

`appendIf` checks that relevant slot context before the new fact is appended. If the slot changed underneath the user, the append fails, the app reloads the latest state, and the user sees what is true now.

That makes the conflict visible instead of hiding it.

## How the app is structured

The code is split by responsibility.

### `src/events/`

This folder contains the shared event contract only.

It defines the event names and payload shapes for:

- `slot-reserved`
- `slot-cancelled`

### `src/features/`

This folder contains the feature slices.

Command features:

- `reserve-slot`
- `cancel-slot`

Query features:

- `booking-board`
- `get-my-reservations`

Each feature owns its own flow, pure logic, and shell code.

Features do not import each other. Shared event shapes live in `src/events/`.

### `src/app/`

This folder is the composition root.

It creates the store, handles routing, coordinates refreshes, and builds user-facing messages from command outcomes plus refreshed query state.

### `src/ui/`

This folder renders the view models and binds browser interactions to the app layer.

## The flow in one picture

```mermaid
flowchart LR
    UI[User action]
    APP[app/]
    CMD[command slice]
    STORE[FactstrMemoryStore]
    QB[get-booking-board]
    QM[get-my-reservations]
    BOARD[Board view]
    MINE[My reservations view]

    UI --> APP
    APP --> CMD
    CMD --> STORE

    APP --> QB
    APP --> QM
    QB --> STORE
    QM --> STORE

    QB --> BOARD
    QM --> MINE
````

The important part is that the UI is not treated as the source of truth. The event log is.

## The Event Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as app/
    participant C as command slice
    participant S as FACTSTR store
    participant Q as query slices
    participant R as UI render

    U->>A: click reserve / cancel
    A->>C: execute feature flow
    C->>S: appendIf(...)
    alt append succeeds
        S-->>C: success
    else slot changed
        S-->>C: conflict
    end
    A->>Q: reload board + my reservations
    Q->>S: query(...)
    Q-->>A: projected view models
    A->>R: rerender board + message
```

## Code Examples

### Shared event contract

The shared surface is small and explicit.

```ts
export const SLOT_RESERVED = 'slot-reserved';

export type SlotReservedPayload = {
  room_id: string;
  date: string;
  slot: string;
  user_name: string;
};

export type SlotReservedEvent = {
  event_type: typeof SLOT_RESERVED;
  payload: SlotReservedPayload;
};
```

`src/events/` contains only this kind of declarative shape. It does not contain decision logic, append logic, or projections.

### Command Context

A command feature reads the relevant context, decides locally, builds an event, and appends it.

```ts
export const reserveSlot = (
  store: FactstrMemoryStore,
  request: ReserveSlotRequest,
): ReserveSlotResponse => {
  const slotContext = loadSlotContext(store, request);
  const decision = decideReservation(slotContext.result.event_records);

  if (decision.status !== 'allow') {
    return decision;
  }

  const event = buildSlotReserved(request);
  const appendResult = appendSlotReserved(
    store,
    event,
    slotContext.query,
    parseExpectedContextVersion(request.expected_context_version),
  );

  if (appendResult.conflict) {
    return {
      status: 'conflict',
      message: 'Slot changed underneath your view. Reload current state and try again.',
    };
  }

  return {
    status: 'success',
    message: `Reserved ${request.room_id} at ${request.slot} for ${request.user_name}.`,
  };
};
```

The feature does not own UI messaging beyond its explicit result. The app layer combines that result with refreshed query state to produce the final user-facing message.

### Query Flow

A query feature loads relevant facts and projects current state.

```ts
export const getMyReservations = (
  store: FactstrMemoryStore,
  request: GetMyReservationsRequest,
) => {
  const result = loadUserDayFacts(store, request);
  const events = result.event_records
    .filter(isMyReservationsEventRecord)
    .map(toMyReservationsEvent);

  return projectMyReservations(request, events);
};
```

The same store supports both:

* command interactions that append facts
* query interactions that rebuild current state

### App Composition

`main.ts` stays minimal.

```ts
import { runApp } from './app/run_app';

runApp();
```

That keeps startup separate from feature behavior.

## Why the structure is kept this way

The example stays deliberately small.

It does not use:

* framework architecture
* service layers
* repositories
* managers
* provider systems
* a hidden mutable client-side board model

The aim is to show the simplest useful shape:

* shared event definitions
* feature-local behavior
* explicit command and query flows
* app-level composition only

## Example boundary

This example is memory-backed and browser-based.

It uses the package surface directly:

* `FactstrMemoryStore`
* `append`
* `query`
* `appendIf`

That keeps the example focused on facts, projection, and explicit conflict handling.

## Install

```bash
cd examples/meeting-room-booking
npm install
```

## Run

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```


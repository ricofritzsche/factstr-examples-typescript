# Meeting Room Booking Board

This is the first read-only step for the `factstr-examples-typescript` repository.

It currently demonstrates:

- direct usage of `@factstr/factstr-node`
- a memory-backed FACTSTR store
- a real `booking-board` query slice
- real `reserve-slot` and `cancel-slot` command slices
- projection of current board state from immutable events
- a plain browser TypeScript app with no framework structure
- a small `src/app/` composition root for startup, routing, refresh, and logging

## Current Scope

The example loads a fixed day, reads relevant events from FACTSTR, projects the current board state, and renders a meeting room booking board with reserve and cancel actions.

The data is memory-backed because the current Node package boundary is intentionally narrow:

- `FactstrMemoryStore`
- `append`
- `query`
- `appendIf`

Vite is used only as the dev/build tool.
The browser entry is `index.html` plus `src/main.ts`.
`src/app/` is the composition root.
Routing is a small hash router with `#/board?date=YYYY-MM-DD` as the board route.
Logging is a small browser-console wrapper in `src/app/log.ts`.
The app has a small explicit current-user input.
Reserve actions use that user directly.
Cancellation is ownership-aware and only succeeds for the matching reserver.
This is still not authentication and not a provider model.
Providers do not exist yet.
This step uses seeded in-memory events only.

## Install

```bash
cd examples/meeting-room-booking
npm install
```

## Run

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.
Use the previous/next day buttons to update the route date and reload the board.

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Not Implemented Yet

This example intentionally does not include:

- provider or dependency-injection layers
- persistence
- streams or durable streams
- transport or server architecture

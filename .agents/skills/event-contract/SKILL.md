---
name: event-contract
description: Add or change shared event definitions in src/events while keeping the folder purely declarative and independent from feature logic.
---

# Purpose

Use this skill when creating or changing files in `src/events/`.

`src/events/` is the shared event contract surface for the repository.

It exists so that:

* features can share event definitions
* query features can read event shapes without feature-to-feature imports
* the shared surface stays explicit and small

# Use This Skill When

Use this skill for tasks such as:

* adding a new event type
* changing an event payload type
* tightening event naming
* adding a small structural event type or interface

Do not use this skill for:

* feature logic
* append logic
* query logic
* projections
* feature flows
* UI work

# Non-Negotiable Rules

## 1. `src/events/` is declarative only

Allowed contents:

* event type constants
* payload types
* event interfaces or types
* small structural event declarations if needed

Not allowed:

* `decide_*`
* `append_*`
* `load_*`
* `project_*`
* feature flows
* DOM or UI code
* store access

## 2. One file per event is preferred

Prefer shapes like:

```text
src/events/
  slot_reserved.ts
  slot_cancelled.ts
```

Do not create one giant registry file unless the task explicitly requires it.

## 3. Keep names explicit

Prefer:

* `SLOT_RESERVED`
* `SlotReservedPayload`
* `SlotReservedEvent`

Avoid vague names like:

* `EventData`
* `Payload`
* `CommonEvent`
* `DomainEvent`

## 4. Do not turn `src/events/` into a behavior layer

This folder must not become the center of the application.

It is only the shared contract surface.

Features still own behavior.

# Recommended Shape

A typical event file should look like this:

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

Keep this small and literal.

# Working Method

## 1. Start from the fact that needs to exist

Ask:

* what happened?
* what is the event name?
* what payload must be carried?

## 2. Add only the shared shape

Do not add decision helpers, append helpers, or query helpers here.

Those belong in features.

## 3. Keep compatibility in mind

When changing an existing event contract:

* be explicit about the shape change
* check which features and query slices depend on it
* update those callers directly

# What To Avoid

Do not introduce:

* event builders with application behavior
* validation layers
* central decision rules
* append or query helpers
* feature-local logic in the shared event folder

# Definition of Done

An event-contract change is done when:

* the shared event shape is explicit
* the folder remains purely declarative
* no logic leaked into `src/events/`
* dependent features can import the shared type without feature-to-feature coupling

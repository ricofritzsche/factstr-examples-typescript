import { describe, expect, it } from 'vitest';
import factstrNode from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { httpPostCancelSlot } from '../../src/features/cancel-slot/http_post_cancel_slot';

const { FactstrMemoryStore } = factstrNode;

const buildRequest = (body: unknown) =>
  ({
    async *[Symbol.asyncIterator]() {
      yield JSON.stringify(body);
    },
  }) as AsyncIterable<string>;

const createResponse = () => {
  const headers = new Map<string, string>();
  let body = '';

  return {
    response: {
      statusCode: 200,
      setHeader: (name: string, value: string) => {
        headers.set(name, value);
      },
      end: (chunk?: string) => {
        body = chunk ?? '';
      },
    },
    getBody: () => body,
    getHeader: (name: string) => headers.get(name),
  };
};

describe('httpPostCancelSlot', () => {
  it('returns 400 and appends no fact for an invalid slot', async () => {
    const store = new FactstrMemoryStore();
    const { response, getBody, getHeader } = createResponse();

    await httpPostCancelSlot(store, buildRequest({
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '30:00',
      user_name: 'Alex',
    }), response);

    expect(response.statusCode).toBe(400);
    expect(getHeader('content-type')).toBe('application/json; charset=utf-8');
    expect(JSON.parse(getBody())).toEqual({
      status: 'invalid-request',
      message: 'Slot must be one of the configured board slots.',
    });
    expect(store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] }).event_records)
      .toHaveLength(0);
  });

  it('returns 400 and appends no fact for an invalid room', async () => {
    const store = new FactstrMemoryStore();
    const { response, getBody } = createResponse();

    await httpPostCancelSlot(store, buildRequest({
      room_id: 'Moon',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
    }), response);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(getBody())).toEqual({
      status: 'invalid-request',
      message: 'Room must be one of the configured board rooms.',
    });
    expect(store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] }).event_records)
      .toHaveLength(0);
  });

  it('returns 400 and appends no fact for an empty user name', async () => {
    const store = new FactstrMemoryStore();
    const { response, getBody } = createResponse();

    await httpPostCancelSlot(store, buildRequest({
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: '   ',
    }), response);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(getBody())).toEqual({
      status: 'invalid-request',
      message: 'User name must be non-empty.',
    });
    expect(store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] }).event_records)
      .toHaveLength(0);
  });

  it('returns 400 and appends no fact for an invalid date', async () => {
    const store = new FactstrMemoryStore();
    const { response, getBody } = createResponse();

    await httpPostCancelSlot(store, buildRequest({
      room_id: 'Atlas',
      date: '2026-02-30',
      slot: '09:00',
      user_name: 'Alex',
    }), response);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(getBody())).toEqual({
      status: 'invalid-request',
      message: 'Date must be a valid YYYY-MM-DD value.',
    });
    expect(store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] }).event_records)
      .toHaveLength(0);
  });
});

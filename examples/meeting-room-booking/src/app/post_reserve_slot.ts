import type { ReserveSlotRequest } from '../features/reserve-slot/request';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';

export const postReserveSlot = async (
  reserveUrl: string,
  request: ReserveSlotRequest,
): Promise<ReserveSlotResponse> => {
  const response = await fetch(reserveUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return (await response.json()) as ReserveSlotResponse;
};

import type { CancelSlotRequest } from '../features/cancel-slot/request';
import type { CancelSlotResponse } from '../features/cancel-slot/response';

export const postCancelSlot = async (
  cancelUrl: string,
  request: CancelSlotRequest,
): Promise<CancelSlotResponse> => {
  const response = await fetch(cancelUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return (await response.json()) as CancelSlotResponse;
};

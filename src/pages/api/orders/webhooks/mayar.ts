import type { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { handleMayarWebhook, type MayarWebhookPayload } from '@/shared/server/orders/ordersService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  // Always ack with 200 so Mayar doesn't retry-storm us over our own bugs; failures are logged inside the service.
  await handleMayarWebhook(req.body as MayarWebhookPayload)
  sendSuccess(res, { received: true })
}

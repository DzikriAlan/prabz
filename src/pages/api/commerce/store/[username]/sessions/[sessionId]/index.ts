import type { NextApiRequest, NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { fetchCommerceSessionDetailForSeller } from '@/shared/server/commerce/commerceService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const username = req.query.username as string
    const sessionId = req.query.sessionId as string
    const detail = await fetchCommerceSessionDetailForSeller(username, sessionId)
    sendSuccess(res, detail)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get commerce session detail for seller')
  }
}

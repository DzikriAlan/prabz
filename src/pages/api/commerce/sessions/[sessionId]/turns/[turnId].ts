import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withAuth } from '@/shared/lib/serverAuth'
import { changeCommerceHistoryQuery } from '@/shared/server/commerce/commerceService'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  try {
    const turnId = req.query.turnId as string
    const message = req.body?.message
    if (typeof message !== 'string' || !message.trim()) throw new ApiError(400, 'message is required')

    const turn = await changeCommerceHistoryQuery(turnId, message)
    sendSuccess(res, turn)
  } catch (error) {
    handleRouteError(res, error, 'Failed to change commerce history query')
  }
}

export default withAuth(handler)

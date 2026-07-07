import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withOptionalAuth, type AuthUser } from '@/shared/lib/serverAuth'
import { storeCommerceSearchTurn } from '@/shared/server/commerce/commerceService'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser | null) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const sessionId = req.query.sessionId as string
    const message = req.body?.message
    if (typeof message !== 'string' || !message.trim()) throw new ApiError(400, 'message is required')

    const turn = await storeCommerceSearchTurn(sessionId, user?.id, message)
    sendSuccess(res, turn)
  } catch (error) {
    handleRouteError(res, error, 'Failed to store commerce search turn')
  }
}

export default withOptionalAuth(handler)

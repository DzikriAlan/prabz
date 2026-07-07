import type { NextApiRequest, NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withOptionalAuth, type AuthUser } from '@/shared/lib/serverAuth'
import { fetchCommerceSessionsList } from '@/shared/server/commerce/commerceService'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser | null) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const sessions = await fetchCommerceSessionsList(user?.id)
    sendSuccess(res, sessions)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get commerce sessions list')
  }
}

export default withOptionalAuth(handler)

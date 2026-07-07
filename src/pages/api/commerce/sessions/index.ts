import type { NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withAuth, type AuthUser } from '@/shared/lib/serverAuth'
import { fetchCommerceSessionsList } from '@/shared/server/commerce/commerceService'
import type { NextApiRequest } from 'next'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const sessions = await fetchCommerceSessionsList(user.id)
    sendSuccess(res, sessions)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get commerce sessions list')
  }
}

export default withAuth(handler)

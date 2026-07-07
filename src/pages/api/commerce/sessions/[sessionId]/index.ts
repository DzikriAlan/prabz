import type { NextApiRequest, NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withAuth } from '@/shared/lib/serverAuth'
import { fetchCommerceSessionDetail, removeCommerceSession } from '@/shared/server/commerce/commerceService'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = req.query.sessionId as string

  try {
    if (req.method === 'GET') {
      const detail = await fetchCommerceSessionDetail(sessionId)
      sendSuccess(res, detail)
      return
    }

    if (req.method === 'DELETE') {
      const result = await removeCommerceSession(sessionId)
      sendSuccess(res, result)
      return
    }

    methodNotAllowed(res, ['GET', 'DELETE'])
  } catch (error) {
    handleRouteError(res, error, 'Failed to process commerce session request')
  }
}

export default withAuth(handler)

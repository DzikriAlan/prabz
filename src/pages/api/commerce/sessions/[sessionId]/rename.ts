import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withAuth } from '@/shared/lib/serverAuth'
import { changeCommerceSessionTitle } from '@/shared/server/commerce/commerceService'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const sessionId = req.query.sessionId as string
    const title = req.body?.title
    if (typeof title !== 'string' || !title.trim()) throw new ApiError(400, 'title is required')

    const session = await changeCommerceSessionTitle(sessionId, title)
    sendSuccess(res, session)
  } catch (error) {
    handleRouteError(res, error, 'Failed to change commerce session title')
  }
}

export default withAuth(handler)

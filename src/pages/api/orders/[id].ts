import type { NextApiRequest, NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withAuth } from '@/shared/lib/serverAuth'
import { fetchOrderById } from '@/shared/server/orders/ordersService'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const id = req.query.id as string
    const order = await fetchOrderById(id)
    sendSuccess(res, order)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get order')
  }
}

export default withAuth(handler)

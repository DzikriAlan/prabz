import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { searchCommerceProducts } from '@/shared/server/commerce/searchEngine'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const message = typeof req.query.message === 'string' ? req.query.message : ''
    if (!message.trim()) throw new ApiError(400, 'message is required')
    const result = await searchCommerceProducts(message)
    sendSuccess(res, result)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get commerce products list')
  }
}

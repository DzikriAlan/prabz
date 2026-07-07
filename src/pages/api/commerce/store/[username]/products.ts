import type { NextApiRequest, NextApiResponse } from 'next'
import { handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { fetchSellerProducts } from '@/shared/server/commerce/commerceService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const username = req.query.username as string
    const products = await fetchSellerProducts(username)
    sendSuccess(res, products)
  } catch (error) {
    handleRouteError(res, error, 'Failed to get seller products list')
  }
}

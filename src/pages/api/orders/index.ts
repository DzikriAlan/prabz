import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, handleRouteError, methodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { withOptionalAuth, type AuthUser } from '@/shared/lib/serverAuth'
import { createOrder, createOrderSchema } from '@/shared/server/orders/ordersService'

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser | null) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  try {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) throw new ApiError(400, 'Validation failed')

    const order = await createOrder(user?.id, parsed.data)
    sendSuccess(res, order, 201)
  } catch (error) {
    handleRouteError(res, error, 'Failed to create order')
  }
}

export default withOptionalAuth(handler)

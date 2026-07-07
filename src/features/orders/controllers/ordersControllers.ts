import { useMutation } from '@tanstack/react-query'
import { postOrder } from '../services/ordersServices'
import type { PayloadCreateOrder } from '../types/ordersTypes'

export const useOrdersControllers = () => {
  const createOrder = useMutation({
    mutationFn: (payload: PayloadCreateOrder) => postOrder(payload),
  })

  return { createOrder }
}

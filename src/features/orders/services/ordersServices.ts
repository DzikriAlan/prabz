import type { DataOrder, PayloadCreateOrder } from '../types/ordersTypes'
import { api } from '@/shared/lib/api'

export const postOrder = async (payload: PayloadCreateOrder) => {
  return await api<DataOrder>('POST', '/orders', payload)
}

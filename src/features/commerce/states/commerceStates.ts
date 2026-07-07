import { create } from 'zustand'
import type { CommerceProducts } from '../types/commerceTypes'

interface CommerceStore {
  commerceProducts: CommerceProducts

  setCommerceProducts: (payload: Partial<CommerceProducts>) => void
}

export const useCommerceStates = create<CommerceStore>((set) => ({
  commerceProducts: {
    status: 'idle',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },

  setCommerceProducts: (payload: Partial<CommerceProducts>) =>
    set((state) => ({
      commerceProducts: { ...state.commerceProducts, ...payload },
    })),
}))

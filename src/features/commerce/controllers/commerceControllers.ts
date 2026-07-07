import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCommerceStates } from '../states/commerceStates'
import {
  postCommerceSearchTurn,
  postCommerceSearchTurnForSeller,
  getCommerceSessionDetail,
  getCommerceSessionDetailForSeller,
  getCommerceSellerProfile,
  getCommerceSellerProducts,
  getCommerceProductsList,
} from '../services/commerceServices'
import type { DataCommerceTurn, PayloadPostCommerceSearchTurn } from '../types/commerceTypes'

interface UseCommerceControllersParams {
  conversationId?: string
  sellerUsername?: string
  enableProductsWall?: boolean
}

const sessionDetailQueryKey = (sellerUsername: string | undefined, conversationId: string | undefined) => [
  'commerce-session-detail',
  sellerUsername ?? null,
  conversationId ?? null,
]

export const useCommerceControllers = (params: UseCommerceControllersParams = {}) => {
  const { conversationId, sellerUsername, enableProductsWall } = params
  const queryClient = useQueryClient()
  const { setCommerceProducts } = useCommerceStates()

  const storeCommerceSearchTurn = useMutation({
    mutationFn: (payload: PayloadPostCommerceSearchTurn) =>
      payload.sellerUsername ? postCommerceSearchTurnForSeller(payload.sellerUsername, payload) : postCommerceSearchTurn(payload),
    onMutate: () => {
      setCommerceProducts({ status: 'loading', statusTitle: 'Mencari...' })
    },
    onSuccess: (data, variables) => {
      const turn = data as DataCommerceTurn
      setCommerceProducts({ status: 'success', statusTitle: 'Selesai', data: turn })
      queryClient.setQueryData(sessionDetailQueryKey(variables.sellerUsername, variables.sessionId), [turn])
    },
    onError: (error) => {
      const err = error instanceof Error ? error.message : 'Gagal mencari produk'
      setCommerceProducts({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
    },
  })

  const fetchCommerceSessionDetail = useQuery({
    queryKey: sessionDetailQueryKey(sellerUsername, conversationId),
    queryFn: () =>
      sellerUsername
        ? getCommerceSessionDetailForSeller(sellerUsername, conversationId as string)
        : getCommerceSessionDetail(conversationId as string),
    enabled: !!conversationId,
  })

  const fetchCommerceSellerProfile = useQuery({
    queryKey: ['commerce-seller-profile', sellerUsername ?? null],
    queryFn: () => getCommerceSellerProfile(sellerUsername as string),
    enabled: !!sellerUsername,
  })

  const fetchCommerceSellerProducts = useQuery({
    queryKey: ['commerce-seller-products', sellerUsername ?? null],
    queryFn: () => getCommerceSellerProducts(sellerUsername as string),
    enabled: !!sellerUsername,
  })

  const fetchCommerceProductsWall = useQuery({
    queryKey: ['commerce-products-wall'],
    queryFn: () => getCommerceProductsList('semua produk'),
    enabled: !!enableProductsWall,
    staleTime: 5 * 60 * 1000,
  })

  return {
    storeCommerceSearchTurn,
    fetchCommerceSessionDetail,
    fetchCommerceSellerProfile,
    fetchCommerceSellerProducts,
    fetchCommerceProductsWall,
  }
}

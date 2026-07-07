import type {
  DataCommerceSeller,
  DataCommerceProduct,
  DataCommerceTurn,
  DataCommerceProductsList,
  PayloadPostCommerceSearchTurn,
} from '../types/commerceTypes'
import { api } from '@/shared/lib/api'

export const getCommerceSessionDetail = async (sessionId: string) => {
  try {
    return await api<DataCommerceTurn[]>('GET', `/commerce/sessions/${sessionId}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postCommerceSearchTurn = async (payload: PayloadPostCommerceSearchTurn) => {
  try {
    return await api<DataCommerceTurn>('POST', `/commerce/sessions/${payload.sessionId}/search`, { message: payload.message })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getCommerceSellerProfile = async (username: string) => {
  try {
    return await api<DataCommerceSeller>('GET', `/commerce/store/${username}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getCommerceSellerProducts = async (username: string) => {
  try {
    return await api<DataCommerceProduct[]>('GET', `/commerce/store/${username}/products`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getCommerceProductsList = async (message: string) => {
  try {
    return await api<DataCommerceProductsList>('GET', `/commerce/products?message=${encodeURIComponent(message)}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getCommerceSessionDetailForSeller = async (username: string, sessionId: string) => {
  try {
    return await api<DataCommerceTurn[]>('GET', `/commerce/store/${username}/sessions/${sessionId}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postCommerceSearchTurnForSeller = async (username: string, payload: PayloadPostCommerceSearchTurn) => {
  try {
    return await api<DataCommerceTurn>('POST', `/commerce/store/${username}/sessions/${payload.sessionId}/search`, { message: payload.message })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

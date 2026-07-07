import { prisma } from '@/shared/lib/prisma'
import { ApiError, handlePrismaError } from '@/shared/lib/apiResponse'
import { getCommerceProductsMany, getSellerByUsername, searchCommerceProducts } from './searchEngine'

export async function fetchCommerceSessionsList(userId: string | undefined) {
  if (!userId) return []
  try {
    return await prisma.commerceSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { sessionId: true, title: true, createdAt: true, updatedAt: true },
    })
  } catch (error) {
    throw handlePrismaError(error, 'commerce session')
  }
}

async function getCommerceHistoryMany(sessionId: string) {
  try {
    return await prisma.commerceHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    throw handlePrismaError(error, 'commerce history')
  }
}

async function toHistoryTurnResult(turn: { id: string; query: string; createdAt: Date }, sellerId?: string) {
  const result = await searchCommerceProducts(turn.query, sellerId)
  return { id: turn.id, query: turn.query, createdAt: turn.createdAt, ...result }
}

export async function fetchCommerceSessionDetail(sessionId: string) {
  const history = await getCommerceHistoryMany(sessionId)
  return await Promise.all(history.map((turn) => toHistoryTurnResult(turn)))
}

export async function storeCommerceSearchTurn(sessionId: string, userId: string | undefined, message: string) {
  try {
    await prisma.commerceSession.upsert({
      where: { sessionId },
      update: { updatedAt: new Date() },
      create: { sessionId, userId, title: null },
    })
  } catch (error) {
    throw handlePrismaError(error, 'commerce session')
  }
  const turn = await createCommerceHistory(sessionId, message)
  return await toHistoryTurnResult(turn)
}

async function createCommerceHistory(sessionId: string, query: string) {
  try {
    return await prisma.commerceHistory.create({ data: { sessionId, query } })
  } catch (error) {
    throw handlePrismaError(error, 'commerce history')
  }
}

export async function fetchSellerProfile(username: string) {
  const seller = await getSellerByUsername(username)
  if (!seller) throw new ApiError(404, 'Seller not found')
  return seller
}

export async function fetchSellerProducts(username: string) {
  const seller = await getSellerByUsername(username)
  if (!seller) throw new ApiError(404, 'Seller not found')
  return await getCommerceProductsMany({}, seller.id)
}

export async function fetchCommerceSessionDetailForSeller(username: string, sessionId: string) {
  const seller = await getSellerByUsername(username)
  if (!seller) throw new ApiError(404, 'Seller not found')
  const history = await getCommerceHistoryMany(sessionId)
  return await Promise.all(history.map((turn) => toHistoryTurnResult(turn, seller.id)))
}

export async function storeCommerceSearchTurnForSeller(
  username: string,
  sessionId: string,
  userId: string | undefined,
  message: string,
) {
  const seller = await getSellerByUsername(username)
  if (!seller) throw new ApiError(404, 'Seller not found')
  try {
    await prisma.commerceSession.upsert({
      where: { sessionId },
      update: { updatedAt: new Date(), sellerId: seller.id },
      create: { sessionId, userId, sellerId: seller.id, title: null },
    })
  } catch (error) {
    throw handlePrismaError(error, 'commerce session')
  }
  const turn = await createCommerceHistory(sessionId, message)
  return await toHistoryTurnResult(turn, seller.id)
}

export async function changeCommerceHistoryQuery(turnId: string, message: string) {
  try {
    const turn = await prisma.commerceHistory.update({ where: { id: turnId }, data: { query: message } })
    return await toHistoryTurnResult(turn)
  } catch (error) {
    throw handlePrismaError(error, 'commerce history')
  }
}

export async function changeCommerceSessionTitle(sessionId: string, title: string) {
  try {
    return await prisma.commerceSession.update({ where: { sessionId }, data: { title } })
  } catch (error) {
    throw handlePrismaError(error, 'commerce session')
  }
}

export async function removeCommerceSession(sessionId: string) {
  try {
    await prisma.commerceHistory.deleteMany({ where: { sessionId } })
    await prisma.commerceSession.delete({ where: { sessionId } })
    return { success: true }
  } catch (error) {
    throw handlePrismaError(error, 'commerce session')
  }
}

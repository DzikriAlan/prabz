import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError, sendError } from './apiResponse'

export interface AuthUser {
  id: string
  email: string
}

interface JwtPayload {
  sub: string
  email: string
}

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')
  return secret
}

export function verifyAuthToken(req: NextApiRequest): AuthUser {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) throw new ApiError(401, 'Unauthorized')

  try {
    const payload = jwt.verify(token, getJwtSecret(), { ignoreExpiration: false }) as JwtPayload
    return { id: payload.sub, email: payload.email }
  } catch {
    throw new ApiError(401, 'Unauthorized')
  }
}

type AuthedHandler = (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void> | void

export function withAuth(handler: AuthedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let user: AuthUser
    try {
      user = verifyAuthToken(req)
    } catch {
      sendError(res, 401, 'Unauthorized')
      return
    }
    await handler(req, res, user)
  }
}

import { randomUUID } from 'node:crypto'
import type { NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'

interface SuccessEnvelope {
  success: true
  code: number
  message: string
  data: unknown
  meta: { timestamp: string; request_id: string }
}

interface ErrorEnvelope {
  success: false
  code: number
  message: string
  data: null
  meta: { timestamp: string; request_id: string }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export function sendSuccess(res: NextApiResponse, data: unknown, code = 200): void {
  const body: SuccessEnvelope = {
    success: true,
    code,
    message: 'Success',
    data: data ?? null,
    meta: { timestamp: new Date().toISOString(), request_id: randomUUID() },
  }
  res.status(code).json(body)
}

export function sendError(res: NextApiResponse, status: number, message: string): void {
  const body: ErrorEnvelope = {
    success: false,
    code: status,
    message,
    data: null,
    meta: { timestamp: new Date().toISOString(), request_id: randomUUID() },
  }
  res.status(status).json(body)
}

export function handlePrismaError(error: unknown, resource: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') throw new ApiError(404, `${resource} not found`)
    if (error.code === 'P2002') throw new ApiError(409, `${resource} already exists`)
    throw new ApiError(500, `Database error (${error.code})`)
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new ApiError(500, 'Unknown database error')
  }
  throw new ApiError(500, 'Unexpected database error')
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed)
  sendError(res, 405, `Method not allowed`)
}

export function handleRouteError(res: NextApiResponse, error: unknown, fallbackMessage: string): void {
  if (error instanceof ApiError) {
    sendError(res, error.status, error.message)
    return
  }
  // eslint-disable-next-line no-console
  console.error(fallbackMessage, error)
  sendError(res, 500, fallbackMessage)
}

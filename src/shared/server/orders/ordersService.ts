import { z } from 'zod'
import { OrderPaymentMethod, OrderStatus, ProductType, type Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { ApiError, handlePrismaError } from '@/shared/lib/apiResponse'
import { createMayarInvoice, isMayarConfigured } from './mayarService'

export const orderAttendeeSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
})

export const createOrderSchema = z.object({
  productId: z.string().min(1),
  email: z.string().email().optional(),
  quantity: z.number().int().min(1).optional(),
  recipientName: z.string().min(1),
  phoneNumber: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  size: z.string().optional(),
  attendees: z.array(orderAttendeeSchema).optional(),
  paymentMethod: z.nativeEnum(OrderPaymentMethod),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export interface MayarWebhookPayload {
  event?: string
  data?: {
    id?: string
    transactionId?: string
    status?: boolean
    [key: string]: unknown
  }
}

const PRODUCT_SELECT = { name: true, imageUrl: true, price: true }

async function getProductById(id: string) {
  try {
    return await prisma.product.findUnique({ where: { id } })
  } catch (error) {
    throw handlePrismaError(error, 'product')
  }
}

async function createOrderRecord(data: Prisma.OrderUncheckedCreateInput) {
  try {
    return await prisma.order.create({ data, include: { product: { select: PRODUCT_SELECT } } })
  } catch (error) {
    throw handlePrismaError(error, 'order')
  }
}

async function updateOrderPayment(id: string, data: { paymentUrl: string; paymentReference: string }) {
  try {
    return await prisma.order.update({ where: { id }, data, include: { product: { select: PRODUCT_SELECT } } })
  } catch (error) {
    throw handlePrismaError(error, 'order')
  }
}

export async function createOrder(userId: string | undefined, dto: CreateOrderInput) {
  const product = await getProductById(dto.productId)
  if (!product) throw new ApiError(404, 'Product not found')

  if (product.productType === ProductType.FASHION && (!dto.address?.trim() || !dto.city?.trim() || !dto.postalCode?.trim())) {
    throw new ApiError(400, 'Alamat pengiriman wajib diisi untuk produk fashion')
  }

  const quantity = dto.quantity ?? 1
  const totalPrice = product.price * quantity

  const baseData = {
    userId,
    productId: dto.productId,
    quantity,
    totalPrice,
    recipientName: dto.recipientName,
    phoneNumber: dto.phoneNumber,
    address: product.productType === ProductType.FASHION ? dto.address : null,
    city: product.productType === ProductType.FASHION ? dto.city : null,
    postalCode: product.productType === ProductType.FASHION ? dto.postalCode : null,
    size: dto.size,
    attendees:
      dto.attendees && dto.attendees.length > 0
        ? dto.attendees.map((attendee) => ({ name: attendee.name, phone: attendee.phone }))
        : undefined,
    paymentMethod: dto.paymentMethod,
  }

  if (!isMayarConfigured()) {
    // No MAYAR_API_KEY configured yet — simulate an instantly successful payment so the
    // checkout wizard can be tested end-to-end before real gateway credentials are set up.
    return await createOrderRecord({ ...baseData, status: OrderStatus.PAID })
  }

  const order = await createOrderRecord({ ...baseData, status: OrderStatus.PENDING })

  try {
    const invoice = await createMayarInvoice({
      name: dto.recipientName,
      email: dto.email?.trim() || `${dto.phoneNumber}@mail.prabz.id`,
      mobile: dto.phoneNumber,
      description: `Pembayaran ${product.name} x${quantity}`,
      items: [{ quantity, rate: product.price, description: product.name }],
      extraData: { orderId: order.id },
    })
    return await updateOrderPayment(order.id, { paymentUrl: invoice.link, paymentReference: invoice.id })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create Mayar invoice, order left pending', error)
    return order
  }
}

export async function fetchOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id }, include: { product: { select: PRODUCT_SELECT } } })
    if (!order) throw new ApiError(404, 'Order not found')
    return order
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw handlePrismaError(error, 'order')
  }
}

export async function handleMayarWebhook(payload: MayarWebhookPayload) {
  const isPaid = payload.event === 'payment.received' || payload.data?.status === true
  if (!isPaid) return

  const references = [payload.data?.id, payload.data?.transactionId].filter(
    (reference): reference is string => typeof reference === 'string',
  )
  if (references.length === 0) return

  try {
    await prisma.order.updateMany({
      where: { paymentReference: { in: references }, status: OrderStatus.PENDING },
      data: { status: OrderStatus.PAID },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to handle Mayar webhook', error)
  }
}

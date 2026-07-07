export type DataOrderPaymentMethod = 'TRANSFER_BANK' | 'E_WALLET' | 'COD'

export interface PayloadOrderAttendee {
  name: string
  phone: string
}

export interface PayloadCreateOrder {
  productId: string
  quantity: number
  email?: string
  recipientName: string
  phoneNumber: string
  address?: string
  city?: string
  postalCode?: string
  size?: string
  attendees?: PayloadOrderAttendee[]
  paymentMethod: DataOrderPaymentMethod
}

export interface DataOrderProduct {
  name: string
  imageUrl: string
  price: number
}

export interface DataOrder {
  id: string
  productId: string
  product: DataOrderProduct
  quantity: number
  totalPrice: number
  recipientName: string
  phoneNumber: string
  address: string | null
  city: string | null
  postalCode: string | null
  size: string | null
  attendees: PayloadOrderAttendee[] | null
  paymentMethod: DataOrderPaymentMethod
  status: string
  paymentUrl: string | null
  createdAt: string
}

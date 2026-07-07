export interface PayloadPostCommerceSearchTurn {
  sessionId: string
  message: string
  sellerUsername?: string
}

export type CommerceGenderFilter = 'ALL' | 'PEREMPUAN' | 'LAKI_LAKI'
export type CommerceToneFilter = 'ALL' | 'PASTEL' | 'EARTH_TONE' | 'SARIMBIT'
export type CommerceProductType = 'FASHION' | 'CONCERT_TICKET' | 'EDUCATION'

export interface DataCommerceProduct {
  id: string
  name: string
  category: string
  productType: CommerceProductType
  gender: string
  tones: string[]
  price: number
  originalPrice: number | null
  rating: number
  reviewCount: number
  marketplace: string
  badge: string | null
  imageUrl: string
  description: string | null
  sellerName: string
  sellerDescription: string | null
}

export interface DataCommerceDetectedFilters {
  gender: string | null
  tones: string[]
  priceCeiling: number | null
  categories: string[]
}

export interface DataCommerceSeller {
  id: string
  username: string
  name: string
  avatarUrl: string | null
}

export interface DataCommerceTurn {
  id: string
  query: string
  products: DataCommerceProduct[]
  detectedFilters: DataCommerceDetectedFilters
  usedFallback: boolean
  matchedSeller: DataCommerceSeller | null
}

export interface DataCommerceProductsList {
  products: DataCommerceProduct[]
  detectedFilters: DataCommerceDetectedFilters
  usedFallback: boolean
  matchedSeller: DataCommerceSeller | null
}

export interface CommerceProducts {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataCommerceTurn | null
}

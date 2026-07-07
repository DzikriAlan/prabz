import { Prisma, ProductGender, ProductTone, ProductType } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { handlePrismaError } from '@/shared/lib/apiResponse'

const STOPWORDS = new Set([
  'baju', 'anak', 'untuk', 'saya', 'aku', 'kita', 'kami', 'mau', 'ingin', 'pengen', 'pengin',
  'carikan', 'carilah', 'cariin', 'cari', 'mencari', 'temukan', 'tolong', 'mohon', 'kasih',
  'kasihkan', 'berikan', 'tampilkan', 'lihat', 'ada', 'adakah', 'rekomendasi', 'rekomendasikan',
  'saran', 'sarankan', 'dong', 'deh', 'sih', 'nih', 'itu', 'ini', 'nya', 'yg', 'ya', 'yang',
  'dengan', 'warna', 'di', 'bawah', 'dibawah', 'budget', 'max', 'maksimal', 'murah', 'rb', 'ribu',
  'juta', 'perempuan', 'laki', 'laki-laki', 'cewek', 'cowok', 'gadis', 'pastel', 'earth', 'tone',
  'harga', 'produk', 'product', 'barang', 'item', 'model', 'jenis', 'semua', 'buat', 'punya',
  'atau', 'dan', 'konser', 'tiket', 'kelas', 'kursus', 'bootcamp', 'webinar', 'belajar',
])

const CATEGORY_KEYWORDS = [
  'oversized tee', 'cargo pants', 'hoodie', 'baggy jeans', 'crewneck', 'denim jacket',
  'varsity jacket', 'flannel', 'track jacket', 'bucket hat', 'cropped top', 'streetwear',
  'sepatu', 'sneaker', 'jeans',
  'konser pop', 'konser indie', 'konser k-pop', 'konser jazz', 'konser rock', 'konser edm',
  'konser dangdut', 'konser hip hop', 'pemrograman', 'desain grafis', 'digital marketing',
  'bahasa inggris', 'fotografi', 'bisnis', 'data science', 'ui/ux design', 'public speaking', 'musik',
]

const PRODUCT_TYPE_KEYWORDS: Record<string, ProductType> = {
  konser: ProductType.CONCERT_TICKET,
  tiket: ProductType.CONCERT_TICKET,
  live: ProductType.CONCERT_TICKET,
  kelas: ProductType.EDUCATION,
  kursus: ProductType.EDUCATION,
  bootcamp: ProductType.EDUCATION,
  webinar: ProductType.EDUCATION,
  belajar: ProductType.EDUCATION,
}

const DEFAULT_CHEAP_PRICE_CEILING = 100000

const PRICE_WITH_TRIGGER_REGEX = /(?:di\s?bawah|dibawah|maksimal|max|budget)\s*([\d.,]+)\s*(rb|ribu|k|juta)?/i
const BARE_PRICE_REGEX = /(\d[\d.,]*)\s*(rb|ribu|k|juta)\b/i

export interface DetectedCommerceFilters {
  gender: ProductGender | null
  tones: ProductTone[]
  priceCeiling: number | null
  categories: string[]
  productType: ProductType | null
}

function detectGenderFilter(message: string): ProductGender | null {
  if (/perempuan|cewek|gadis/.test(message)) return ProductGender.PEREMPUAN
  if (/laki[\s-]?laki|cowok/.test(message)) return ProductGender.LAKI_LAKI
  return null
}

function detectToneFilter(message: string): ProductTone[] {
  const tones: ProductTone[] = []
  if (/pastel/.test(message)) tones.push(ProductTone.PASTEL)
  if (/earth\s?tone|earthy/.test(message)) tones.push(ProductTone.EARTH_TONE)
  if (/sarimbit|kembaran|couple|serasi/.test(message)) tones.push(ProductTone.SARIMBIT)
  return tones
}

function detectPriceCeilingFilter(message: string): number | null {
  const match = PRICE_WITH_TRIGGER_REGEX.exec(message) ?? BARE_PRICE_REGEX.exec(message)
  if (match) {
    const rawNumber = Number(match[1].replace(/[.,]/g, ''))
    const unit = match[2]?.toLowerCase()
    const isThousandUnit = unit === 'rb' || unit === 'ribu' || unit === 'k'
    let multiplier = 1
    if (unit === 'juta') multiplier = 1_000_000
    else if (isThousandUnit) multiplier = 1_000
    const ceiling = rawNumber * multiplier
    if (ceiling > 0) return ceiling
  }
  if (/murah/.test(message)) return DEFAULT_CHEAP_PRICE_CEILING
  return null
}

function detectProductTypeFilter(message: string): ProductType | null {
  for (const [keyword, productType] of Object.entries(PRODUCT_TYPE_KEYWORDS)) {
    if (message.includes(keyword)) return productType
  }
  return null
}

function detectCategoryFilter(message: string): string[] {
  return CATEGORY_KEYWORDS.filter((keyword) => message.includes(keyword))
}

function detectKeywordFilter(message: string): string[] {
  return message
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word) && !/\d/.test(word))
}

function collectConditions(filters: DetectedCommerceFilters, keywords: string[]): Prisma.ProductWhereInput[] {
  const conditions: Prisma.ProductWhereInput[] = []
  if (filters.gender) conditions.push({ gender: filters.gender })
  if (filters.tones.length > 0) conditions.push({ tones: { hasSome: filters.tones } })
  if (filters.priceCeiling !== null) conditions.push({ price: { lte: filters.priceCeiling } })
  if (filters.categories.length > 0) {
    conditions.push({ OR: filters.categories.map((category) => ({ category: { contains: category, mode: 'insensitive' } })) })
  }
  if (filters.productType) conditions.push({ productType: filters.productType })
  if (keywords.length > 0) {
    conditions.push({ OR: keywords.map((word) => ({ name: { contains: word, mode: 'insensitive' } })) })
  }
  return conditions
}

function toWhere(conditions: Prisma.ProductWhereInput[]): Prisma.ProductWhereInput {
  return conditions.length > 0 ? { AND: conditions } : {}
}

export async function getCommerceProductsMany(where: Prisma.ProductWhereInput, sellerId?: string) {
  try {
    const products = await prisma.product.findMany({
      where: sellerId ? { AND: [where, { sellerId }] } : where,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: 50,
      include: { seller: { select: { name: true, description: true } } },
    })
    return products.map(({ seller, ...product }) => ({ ...product, sellerName: seller.name, sellerDescription: seller.description }))
  } catch (error) {
    throw handlePrismaError(error, 'product')
  }
}

export async function getSellerByUsername(username: string) {
  try {
    return await prisma.seller.findUnique({ where: { username } })
  } catch (error) {
    throw handlePrismaError(error, 'seller')
  }
}

export async function findSellerMatchingQuery(message: string) {
  try {
    const lowered = message.toLowerCase().trim()
    if (lowered.length < 3) return null
    const sellers = await prisma.seller.findMany()
    return (
      sellers.find((seller) => {
        const username = seller.username.toLowerCase()
        const name = seller.name.toLowerCase()
        return lowered.includes(username) || username.includes(lowered) || lowered.includes(name) || name.includes(lowered)
      }) ?? null
    )
  } catch (error) {
    throw handlePrismaError(error, 'seller')
  }
}

export async function searchCommerceProducts(message: string, sellerId?: string) {
  const emptyFilters: DetectedCommerceFilters = { gender: null, tones: [], priceCeiling: null, categories: [], productType: null }

  if (!sellerId) {
    const matchedSeller = await findSellerMatchingQuery(message)
    if (matchedSeller) {
      const products = await getCommerceProductsMany({}, matchedSeller.id)
      return { products, detectedFilters: emptyFilters, usedFallback: false, matchedSeller }
    }
  }

  const lowered = message.toLowerCase()
  const detectedFilters: DetectedCommerceFilters = {
    gender: detectGenderFilter(lowered),
    tones: detectToneFilter(lowered),
    priceCeiling: detectPriceCeilingFilter(lowered),
    categories: detectCategoryFilter(lowered),
    productType: detectProductTypeFilter(lowered),
  }
  const keywords = detectKeywordFilter(lowered)

  const strictConditions = collectConditions(detectedFilters, keywords)
  const relaxedConditions = collectConditions(detectedFilters, [])

  let products = await getCommerceProductsMany(toWhere(strictConditions), sellerId)
  let usedFallback = false

  if (products.length === 0 && relaxedConditions.length !== strictConditions.length) {
    products = await getCommerceProductsMany(toWhere(relaxedConditions), sellerId)
    usedFallback = products.length > 0
  }

  if (products.length === 0 && relaxedConditions.length > 0) {
    products = await getCommerceProductsMany({}, sellerId)
    usedFallback = products.length > 0
  }

  return { products, detectedFilters, usedFallback, matchedSeller: null }
}

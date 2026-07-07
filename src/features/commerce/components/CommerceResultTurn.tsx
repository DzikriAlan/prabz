import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CommerceGenderFilter, CommerceToneFilter, DataCommerceProduct, DataCommerceTurn } from '../types/commerceTypes'
import CommerceProductCard from './CommerceProductCard'

const PAGE_SIZE = 10

interface Props {
  turn: DataCommerceTurn
  genderFilter: CommerceGenderFilter
  toneFilter: CommerceToneFilter
  onSelectProduct?: (product: DataCommerceProduct) => void
}

const GENDER_LABELS: Record<string, string> = {
  PEREMPUAN: 'Perempuan',
  LAKI_LAKI: 'Laki-laki',
}

const TONE_LABELS: Record<string, string> = {
  PASTEL: 'Pastel',
  EARTH_TONE: 'Earth Tone',
  SARIMBIT: 'Sarimbit',
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

export default function CommerceResultTurn({ turn, genderFilter, toneFilter, onSelectProduct }: Readonly<Props>) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [turn.id, genderFilter, toneFilter])

  const describeDetectedFilters = () => {
    const { gender, tones, priceCeiling, categories } = turn.detectedFilters
    const parts: string[] = []
    if (categories.length > 0) parts.push(categories.map(capitalize).join(' / '))
    if (gender) parts.push(GENDER_LABELS[gender] ?? gender)
    tones.forEach((tone) => parts.push(TONE_LABELS[tone] ?? tone))
    if (priceCeiling !== null) parts.push(`≤ Rp${priceCeiling.toLocaleString('id-ID')}`)
    return parts.length > 0 ? parts.join(' · ') : null
  }

  const filteredProducts = turn.products.filter((product) => {
    const matchGender = genderFilter === 'ALL' || product.gender === genderFilter
    const matchTone = toneFilter === 'ALL' || product.tones.includes(toneFilter)
    return matchGender && matchTone
  })

  const totalPages = Math.max(Math.ceil(filteredProducts.length / PAGE_SIZE), 1)
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isEmptyResult = filteredProducts.length === 0
  const detectedSummary = describeDetectedFilters()
  const seller = turn.matchedSeller

  const productCount = turn.products.length
  const totalReviews = turn.products.reduce((sum, product) => sum + product.reviewCount, 0)
  const avgRating = productCount > 0 ? turn.products.reduce((sum, product) => sum + product.rating, 0) / productCount : 0

  return (
    <div className="space-y-3">
      {seller && (
        <div className="space-y-3">
          <p className="text-rem-80 text-muted-foreground">
            Toko berkaitan dengan &quot;{turn.query}&quot;
          </p>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {seller.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seller.avatarUrl} alt={seller.name} className="h-full w-full object-cover" />
                ) : (
                  seller.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-rem-100 font-semibold text-foreground">{seller.name}</p>
                <p className="text-rem-85 text-muted-foreground">@{seller.username}</p>
              </div>
            </div>
            {productCount > 0 && (
              <div className="flex items-center gap-6 border-t border-border pt-4 sm:ml-auto sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                <div className="text-center">
                  <p className="text-rem-95 font-semibold text-foreground">{productCount}</p>
                  <p className="text-rem-75 text-muted-foreground">Produk</p>
                </div>
                <div className="text-center">
                  <p className="text-rem-95 font-semibold text-foreground">{avgRating.toFixed(1)}</p>
                  <p className="text-rem-75 text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-rem-95 font-semibold text-foreground">{totalReviews}</p>
                  <p className="text-rem-75 text-muted-foreground">Ulasan</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-rem-80 text-muted-foreground">
            Produk dari <span className="font-medium text-foreground">{seller.name}</span>
          </p>
        </div>
      )}

      {detectedSummary !== null && (
        <p className="text-rem-80 text-muted-foreground">
          Menampilkan hasil untuk: <span className="font-medium text-foreground">{detectedSummary}</span>
        </p>
      )}

      {turn.usedFallback && (
        <p className="text-rem-80 text-amber-600 dark:text-amber-400">
           ini rekomendasi terdekat untuk &quot;{turn.query}&quot;
        </p>
      )}

      {isEmptyResult && (
        <p className="text-rem-85 text-muted-foreground">
          Tidak ada produk yang cocok untuk &quot;{turn.query}&quot;.
        </p>
      )}

      {!isEmptyResult && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pagedProducts.map((product) => (
            <CommerceProductCard key={product.id} product={product} onClick={onSelectProduct} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-rem-80 text-muted-foreground">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            aria-label="Halaman sebelumnya"
            className="disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Halaman {page}/{totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            aria-label="Halaman berikutnya"
            className="disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

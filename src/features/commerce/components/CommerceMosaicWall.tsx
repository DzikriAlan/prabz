import { useEffect, useRef, useState } from 'react'
import { Heart, Star } from 'lucide-react'
import type { DataCommerceProduct } from '../types/commerceTypes'

interface Props {
  readonly products: DataCommerceProduct[]
  readonly isLoading?: boolean
  readonly onSelectProduct?: (product: DataCommerceProduct) => void
}

interface MosaicCardProps {
  readonly product: DataCommerceProduct
  readonly onSelectProduct?: (product: DataCommerceProduct) => void
}

const BADGE_LABELS: Record<string, string> = {
  BEST_SELLER: 'Best Seller',
  POPULER: 'Populer',
}

const CARD_SIZE_CLASS = 'aspect-[3/4] w-36 shrink-0 sm:w-44'
const GAP_CLASS = 'gap-4 sm:gap-5'

const WALL_ROTATION_DEG = -30
const MIN_ROW_COUNT = 5
const MIN_CARDS_PER_ROW = 10
const MAX_ROW_COUNT = 24
const MAX_CARDS_PER_ROW = 24
// Overshoot the rotated bounding-box requirement so the wall still fully covers
// the container after a resize tick or a slightly stale measurement.
const COVERAGE_SAFETY_FACTOR = 1.2

const SM_BREAKPOINT_PX = 640
const CARD_ASPECT_RATIO = 4 / 3 // aspect-[3/4] width:height
const CARD_WIDTH_PX = { base: 144, sm: 176 } // w-36 / sm:w-44
const CARD_GAP_PX = { base: 16, sm: 20 } // gap-4 / sm:gap-5

function useMosaicGridSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [gridSize, setGridSize] = useState({ rowCount: MIN_ROW_COUNT, cardsPerRow: MIN_CARDS_PER_ROW })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const recompute = (width: number, height: number) => {
      if (width === 0 || height === 0) return

      const isSm = width >= SM_BREAKPOINT_PX
      const cardWidth = isSm ? CARD_WIDTH_PX.sm : CARD_WIDTH_PX.base
      const gap = isSm ? CARD_GAP_PX.sm : CARD_GAP_PX.base
      const cardHeight = cardWidth * CARD_ASPECT_RATIO

      const thetaRad = (Math.abs(WALL_ROTATION_DEG) * Math.PI) / 180
      const cosT = Math.cos(thetaRad)
      const sinT = Math.sin(thetaRad)

      // Bounding box a rectangle must have (before rotation) to fully cover a
      // width x height container once rotated by thetaRad.
      const neededWidth = (width * cosT + height * sinT) * COVERAGE_SAFETY_FACTOR
      const neededHeight = (width * sinT + height * cosT) * COVERAGE_SAFETY_FACTOR

      const cardsPerRow = Math.ceil(neededWidth / (cardWidth + gap))
      const rowCount = Math.ceil(neededHeight / (cardHeight + gap))

      setGridSize({
        rowCount: Math.min(MAX_ROW_COUNT, Math.max(MIN_ROW_COUNT, rowCount)),
        cardsPerRow: Math.min(MAX_CARDS_PER_ROW, Math.max(MIN_CARDS_PER_ROW, cardsPerRow)),
      })
    }

    recompute(el.clientWidth, el.clientHeight)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      recompute(width, height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return gridSize
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

function MosaicCard({ product, onSelectProduct }: MosaicCardProps) {
  const badgeLabel = product.badge ? (BADGE_LABELS[product.badge] ?? product.badge) : null
  const hasDiscount = product.originalPrice !== null && product.originalPrice > product.price

  return (
    <button
      type="button"
      onClick={() => onSelectProduct?.(product)}
      aria-label={`Lihat detail ${product.name}`}
      className={`group relative overflow-hidden rounded-2xl bg-muted text-left shadow-xl shadow-black/20 transition-transform duration-300 hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${CARD_SIZE_CLASS}`}
    >
      {badgeLabel !== null && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-rem-70 font-semibold text-primary-foreground">
          {badgeLabel}
        </span>
      )}
      <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white">
        <Heart className="h-3.5 w-3.5" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
        <p className="line-clamp-2 text-rem-80 font-medium text-white">{product.name}</p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-rem-85 font-semibold text-white">{formatRupiah(product.price)}</span>
          {hasDiscount && (
            <span className="text-rem-70 text-white/60 line-through">{formatRupiah(product.originalPrice as number)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-rem-70 text-white/70">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </button>
  )
}

function MosaicCardSkeleton() {
  return <div className={`animate-pulse rounded-2xl bg-muted ${CARD_SIZE_CLASS}`} />
}

export default function CommerceMosaicWall({ products, isLoading, onSelectProduct }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { rowCount, cardsPerRow } = useMosaicGridSize(containerRef)
  const hasProducts = products.length > 0

  if (!hasProducts && !isLoading) return null

  const rows: (DataCommerceProduct | null)[][] = Array.from({ length: rowCount }, (_, rowIndex) =>
    hasProducts
      ? Array.from({ length: cardsPerRow }, (_, i) => products[(rowIndex * cardsPerRow + i) % products.length])
      : Array.from({ length: cardsPerRow }, () => null),
  )

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-background">
      <div
        className={`absolute left-1/2 top-1/2 flex flex-col ${GAP_CLASS}`}
        style={{ transform: `translate(-50%, -50%) rotate(${WALL_ROTATION_DEG}deg)` }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex ${GAP_CLASS}`}>
            {row.map((product, i) =>
              product ? (
                <MosaicCard key={`${product.id}-${i}`} product={product} onSelectProduct={onSelectProduct} />
              ) : (
                <MosaicCardSkeleton key={`skeleton-${i}`} />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-background/45 dark:bg-background/60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background/70 to-transparent" />
    </div>
  )
}

import { Heart, Star } from 'lucide-react'
import type { DataCommerceProduct } from '../types/commerceTypes'

interface Props {
  product: DataCommerceProduct
  onClick?: (product: DataCommerceProduct) => void
}

const BADGE_LABELS: Record<string, string> = {
  BEST_SELLER: 'Best Seller',
  POPULER: 'Populer',
}

export default function CommerceProductCard({ product, onClick }: Readonly<Props>) {
  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

  const badgeLabel = product.badge ? (BADGE_LABELS[product.badge] ?? product.badge) : null
  const hasDiscount = product.originalPrice !== null && product.originalPrice > product.price

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(product)}
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left ${onClick ? 'cursor-pointer transition-colors hover:border-primary/40' : ''}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {badgeLabel !== null && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-rem-70 font-quera font-semibold text-primary-foreground">
            {badgeLabel}
          </span>
        )}
        <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-rem-85 font-medium text-foreground">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-rem-90 font-semibold text-foreground">{formatRupiah(product.price)}</span>
          {hasDiscount && (
            <span className="text-rem-75 text-muted-foreground line-through">
              {formatRupiah(product.originalPrice as number)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-rem-75 text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </div>
  )
}

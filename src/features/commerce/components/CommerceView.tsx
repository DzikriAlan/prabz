'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader2, SlidersHorizontal, ArrowUp } from 'lucide-react'
import { useCommerceControllers } from '@/features/commerce/controllers/commerceControllers'
import { useCommerceStates } from '@/features/commerce/states/commerceStates'
import type { CommerceGenderFilter, CommerceToneFilter, DataCommerceProduct, DataCommerceTurn } from '@/features/commerce/types/commerceTypes'
import CommerceResultTurn from './CommerceResultTurn'
import CommerceProductCard from './CommerceProductCard'
import CommerceResultSkeleton from './CommerceResultSkeleton'
import CommerceFilterSheet from './CommerceFilterSheet'
import CommerceCheckoutModal from './CommerceCheckoutModal'
import CommerceMosaicWall from './CommerceMosaicWall'
import CommerceUpgradeTitle from './CommerceUpgradeTitle'

interface CommerceViewProps {
  readonly conversationId?: string
  readonly sellerUsername?: string
}

const SEARCH_PLACEHOLDERS = ['Cari konser Hindia...', 'Cari celana baggy...', 'Cari kelas jago coding...']
const SEARCH_PLACEHOLDER_INTERVAL_MS = 2500

export default function CommerceView({ conversationId, sellerUsername }: CommerceViewProps) {
  const router = useRouter()
  const { commerceProducts, setCommerceProducts } = useCommerceStates()
  const {
    storeCommerceSearchTurn,
    fetchCommerceSessionDetail,
    fetchCommerceSellerProfile,
    fetchCommerceSellerProducts,
    fetchCommerceProductsWall,
  } = useCommerceControllers({ conversationId, sellerUsername, enableProductsWall: !conversationId && !sellerUsername })

  const [input, setInput] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isInputBarVisible, setIsInputBarVisible] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [genderFilter, setGenderFilter] = useState<CommerceGenderFilter>('ALL')
  const [toneFilter, setToneFilter] = useState<CommerceToneFilter>('ALL')
  const [inputBarHeight, setInputBarHeight] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<DataCommerceProduct | null>(null)
  const sessionIdRef = useRef<string>(conversationId || crypto.randomUUID())
  const inputRef = useRef<HTMLInputElement>(null)
  const inputBarContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTopRef = useRef(0)

  const currentTurn = commerceProducts.data
  const isSearching = commerceProducts.status === 'loading'
  const isSessionLoading = fetchCommerceSessionDetail.isLoading
  const isEmptyConversation = !currentTurn && !isSessionLoading

  const seller = fetchCommerceSellerProfile.data ?? null
  const isSellerLoading = fetchCommerceSellerProfile.isLoading
  const sellerNotFound = !!sellerUsername && !isSellerLoading && (fetchCommerceSellerProfile.isError || !seller)

  const sellerProducts = fetchCommerceSellerProducts.data ?? []
  const isSellerProductsLoading = fetchCommerceSellerProducts.isLoading

  const saveCommerceSearch = (text: string) => {
    if (!text.trim() || isSearching) return
    const isFirstMessage = !conversationId
    storeCommerceSearchTurn.mutate(
      { sessionId: sessionIdRef.current, message: text, sellerUsername },
      {
        onSuccess: () => {
          if (isFirstMessage) {
            const path = sellerUsername
              ? `/commerce/${sellerUsername}/${sessionIdRef.current}`
              : `/commerce/${sessionIdRef.current}`
            void router.push(path)
          }
        },
      },
    )
    setInput('')
  }

  const syncInput = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const saveOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    saveCommerceSearch(input)
  }

  const handleResultsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const lastScrollTop = lastScrollTopRef.current
    if (scrollTop <= 0 || scrollTop < lastScrollTop) {
      setIsInputBarVisible(true)
    } else if (scrollTop > lastScrollTop) {
      setIsInputBarVisible(false)
    }
    lastScrollTopRef.current = scrollTop
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length)
    }, SEARCH_PLACEHOLDER_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setGenderFilter('ALL')
    setToneFilter('ALL')
  }, [currentTurn?.id])

  useEffect(() => {
    if (currentTurn) setInput(currentTurn.query)
  }, [currentTurn?.id, currentTurn?.query])

  useEffect(() => {
    const el = inputBarContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setInputBarHeight(el.getBoundingClientRect().height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [isEmptyConversation])

  useEffect(() => {
    if (!conversationId) {
      setCommerceProducts({ status: 'idle', statusTitle: '', statusSubtitle: '', data: null })
      sessionIdRef.current = crypto.randomUUID()
    }
  }, [conversationId, setCommerceProducts])

  useEffect(() => {
    if (!conversationId) return
    if (fetchCommerceSessionDetail.isError) {
      const err = fetchCommerceSessionDetail.error instanceof Error ? fetchCommerceSessionDetail.error.message : 'Gagal memuat riwayat'
      setCommerceProducts({ status: 'error', statusTitle: 'Error', statusSubtitle: err, data: null })
      return
    }
    const history = fetchCommerceSessionDetail.data as DataCommerceTurn[] | undefined
    if (!history) return
    const data = history[history.length - 1] ?? null
    setCommerceProducts({ status: 'success', statusTitle: 'Selesai', data })
  }, [conversationId, fetchCommerceSessionDetail.data, fetchCommerceSessionDetail.isError, fetchCommerceSessionDetail.error, setCommerceProducts])

  const glowBackground = (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 dark:hidden"
        style={{
          width: '1100px',
          height: '420px',
          background: 'radial-gradient(ellipse at center, rgba(251, 113, 133, 0.45) 0%, rgba(244, 63, 94, 0.22) 40%, transparent 70%)',
          filter: 'blur(52px)',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 hidden dark:block"
        style={{
          width: '1100px',
          height: '420px',
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.30) 0%, rgba(185, 28, 28, 0.14) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </>
  )

  const renderInputBar = (variant: 'default' | 'floating' = 'default') => {
    const isFloating = variant === 'floating'
    return (
      <div
        className={
          isFloating
            ? 'flex items-center gap-3 rounded-full border border-border bg-background/85 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-md'
            : 'flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-lg shadow-black/10 dark:shadow-black/40'
        }
      >
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          disabled={isEmptyConversation}
          aria-label="Buka filter"
          className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={syncInput}
          onKeyDown={saveOnEnter}
          placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
          disabled={isSearching}
          className="flex-1 appearance-none bg-transparent text-rem-90 text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => saveCommerceSearch(input)}
          disabled={!input.trim() || isSearching}
          aria-label="Cari produk"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </div>
    )
  }
  const inputBar = renderInputBar('default')

  if (isSessionLoading || isSellerLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sellerNotFound) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Toko &quot;{sellerUsername}&quot; tidak ditemukan.
      </div>
    )
  }

  if (isEmptyConversation && sellerUsername) {
    const productCount = sellerProducts.length
    const totalReviews = sellerProducts.reduce((sum, product) => sum + product.reviewCount, 0)
    const avgRating = productCount > 0 ? sellerProducts.reduce((sum, product) => sum + product.rating, 0) / productCount : 0

    return (
      <div className="relative flex h-full flex-col bg-card md:bg-background">
        {glowBackground}
        <div className="relative flex-1 overflow-y-auto px-4 py-6 pb-28" onScroll={handleResultsScroll}>
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {seller?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={seller.avatarUrl} alt={seller.name} className="h-full w-full object-cover" />
                  ) : (
                    (seller?.name ?? sellerUsername).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-rem-100 font-semibold text-foreground">{seller?.name ?? sellerUsername}</h1>
                  <p className="text-rem-85 text-muted-foreground">@{seller?.username ?? sellerUsername}</p>
                </div>
              </div>
              {!isSellerProductsLoading && productCount > 0 && (
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

            <p className="text-rem-85 text-muted-foreground">
              Produk dari <span className="font-medium text-foreground">{seller?.name ?? sellerUsername}</span>
            </p>

            {isSellerProductsLoading ? (
              <CommerceResultSkeleton />
            ) : sellerProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {sellerProducts.map((product) => (
                  <CommerceProductCard key={product.id} product={product} onClick={setSelectedProduct} />
                ))}
              </div>
            ) : (
              <p className="text-center text-rem-85 text-muted-foreground">Belum ada produk.</p>
            )}
          </div>
        </div>
        <div
          ref={inputBarContainerRef}
          className={`absolute inset-x-0 bottom-0 bg-card px-4 py-4 transition-transform duration-300 ease-in-out md:bg-background ${
            isInputBarVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto max-w-2xl">{inputBar}</div>
        </div>
        <CommerceCheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    )
  }

  if (isEmptyConversation) {
    const wallProducts = fetchCommerceProductsWall.data?.products ?? []

    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-background">
        <CommerceMosaicWall products={wallProducts} isLoading={fetchCommerceProductsWall.isLoading} onSelectProduct={setSelectedProduct} />
        <div className="relative z-10 mt-auto px-4 pb-6">
          <div className="mx-auto max-w-2xl">
            <CommerceUpgradeTitle />
            {renderInputBar('floating')}
          </div>
        </div>
        <CommerceCheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-card md:bg-background">
      {glowBackground}
      <div className="relative flex-1 overflow-y-auto px-4 py-6 pb-28" onScroll={handleResultsScroll}>
        <div className="mx-auto max-w-5xl">
          {isSearching ? (
            <CommerceResultSkeleton />
          ) : (
            currentTurn && (
              <CommerceResultTurn
                turn={currentTurn}
                genderFilter={genderFilter}
                toneFilter={toneFilter}
                onSelectProduct={setSelectedProduct}
              />
            )
          )}
        </div>
      </div>
      <div
        ref={inputBarContainerRef}
        className={`absolute inset-x-0 bottom-0 bg-card px-4 py-4 transition-transform duration-300 ease-in-out md:bg-background ${
          isInputBarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-2xl">{inputBar}</div>
      </div>
      <CommerceFilterSheet
        open={isFilterOpen}
        bottomOffset={inputBarHeight}
        genderFilter={genderFilter}
        toneFilter={toneFilter}
        onClose={() => setIsFilterOpen(false)}
        onSelectGender={setGenderFilter}
        onSelectTone={setToneFilter}
      />
      <CommerceCheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}

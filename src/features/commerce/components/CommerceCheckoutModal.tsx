'use client'

import { useEffect, useState } from 'react'
import { Loader2, Minus, Plus, Star, X, CheckCircle2, ZoomIn } from 'lucide-react'
import Stepper from '@/shared/components/Stepper'
import { useOrdersControllers } from '@/features/orders/controllers/ordersControllers'
import type { DataOrder, DataOrderPaymentMethod } from '@/features/orders/types/ordersTypes'
import type { DataCommerceProduct } from '../types/commerceTypes'
import CommerceImageZoomModal from './CommerceImageZoomModal'

const SHIPPING_STEPS = ['Detail', 'Alamat', 'Pembayaran']
const CONTACT_ONLY_STEPS = ['Detail', 'Kontak', 'Pembayaran']

const ALPHA_SIZE_OPTIONS = ['S', 'M', 'L', 'XL']
const PANTS_SIZE_OPTIONS = ['28', '30', '32', '34', '36', '38']
const SHOE_SIZE_OPTIONS = ['39', '40', '41', '42', '43', '44']
const NO_SIZE_CATEGORIES = new Set(['Bucket Hat'])
const NUMERIC_WAIST_CATEGORIES = new Set(['Cargo Pants', 'Baggy Jeans'])
const SHOE_CATEGORIES = new Set(['Sepatu'])

const getSizeOptions = (category: string): string[] => {
  if (NO_SIZE_CATEGORIES.has(category)) return []
  if (SHOE_CATEGORIES.has(category)) return SHOE_SIZE_OPTIONS
  if (NUMERIC_WAIST_CATEGORIES.has(category)) return PANTS_SIZE_OPTIONS
  return ALPHA_SIZE_OPTIONS
}

interface AttendeeContact {
  name: string
  phone: string
}

const PAYMENT_METHOD_LABELS: Record<DataOrderPaymentMethod, string> = {
  TRANSFER_BANK: 'Transfer Bank',
  E_WALLET: 'E-Wallet',
  COD: 'Bayar di Tempat (COD)',
}

// Placeholder reviews for demo/testing — there is no reviews backend yet.
interface DummyReview {
  name: string
  daysAgo: number
  rating: number
  comment: string
  images?: string[]
}

const DUMMY_REVIEW_POOL: DummyReview[] = [
  { name: 'Siti A.', daysAgo: 2, rating: 5, comment: 'Bahannya adem dan jahitannya rapi, sesuai foto.', images: ['https://picsum.photos/seed/review-1/200/200'] },
  { name: 'Budi R.', daysAgo: 5, rating: 4, comment: 'Pengiriman cepat, ukuran pas untuk anak saya.' },
  {
    name: 'Dewi K.',
    daysAgo: 9,
    rating: 5,
    comment: 'Warnanya cantik, anak saya suka banget!',
    images: ['https://picsum.photos/seed/review-3a/200/200', 'https://picsum.photos/seed/review-3b/200/200'],
  },
  { name: 'Ahmad F.', daysAgo: 14, rating: 4, comment: 'Kualitas bagus untuk harga segini, recommended.' },
  { name: 'Nadia P.', daysAgo: 20, rating: 5, comment: 'Sudah kedua kalinya beli di sini, selalu puas.', images: ['https://picsum.photos/seed/review-5/200/200'] },
  { name: 'Rina S.', daysAgo: 25, rating: 5, comment: 'Sangat puas, akan repeat order lagi.' },
  { name: 'Fajar T.', daysAgo: 30, rating: 4, comment: 'Bagus, tapi pengiriman agak lama.' },
  {
    name: 'Melati W.',
    daysAgo: 35,
    rating: 5,
    comment: 'Sesuai ekspektasi, anak saya senang pakainya.',
    images: ['https://picsum.photos/seed/review-8/200/200'],
  },
  { name: 'Hendra J.', daysAgo: 40, rating: 4, comment: 'Ukurannya pas, bahan tidak panas.' },
  { name: 'Putri L.', daysAgo: 45, rating: 5, comment: 'Recommended banget, kualitas premium!' },
]

const pickDummyReviews = (productId: string) => {
  let hash = 0
  for (let i = 0; i < productId.length; i += 1) hash = (hash * 31 + productId.codePointAt(i)!) >>> 0
  const start = hash % DUMMY_REVIEW_POOL.length
  return Array.from({ length: DUMMY_REVIEW_POOL.length }, (_, i) => DUMMY_REVIEW_POOL[(start + i) % DUMMY_REVIEW_POOL.length])
}

interface Props {
  product: DataCommerceProduct | null
  onClose: () => void
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function CommerceCheckoutModal({ product, onClose }: Readonly<Props>) {
  const { createOrder } = useOrdersControllers()

  const [step, setStep] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState('')
  const [email, setEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [additionalContacts, setAdditionalContacts] = useState<AttendeeContact[]>([])
  const [paymentMethod, setPaymentMethod] = useState<DataOrderPaymentMethod>('TRANSFER_BANK')
  const [order, setOrder] = useState<DataOrder | null>(null)
  const [error, setError] = useState('')
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    if (!product) return
    setStep(0)
    setQuantity(1)
    setSize('')
    setEmail('')
    setRecipientName('')
    setPhoneNumber('')
    setAddress('')
    setCity('')
    setPostalCode('')
    setAdditionalContacts([])
    setPaymentMethod('TRANSFER_BANK')
    setOrder(null)
    setError('')
    setIsImageZoomOpen(false)
    setShowAllReviews(false)
  }, [product])

  const isMultiContact = product?.productType === 'CONCERT_TICKET'

  useEffect(() => {
    if (!isMultiContact) return
    const needed = Math.max(quantity - 1, 0)
    setAdditionalContacts((prev) => {
      if (prev.length === needed) return prev
      if (prev.length > needed) return prev.slice(0, needed)
      return [...prev, ...Array.from({ length: needed - prev.length }, () => ({ name: '', phone: '' }))]
    })
  }, [quantity, isMultiContact])

  if (!product) return null

  const needsShipping = product.productType === 'FASHION'
  const showQuantity = product.productType !== 'EDUCATION'
  const sizeOptions = product.productType === 'FASHION' ? getSizeOptions(product.category) : []
  const showSize = sizeOptions.length > 0
  const STEPS = needsShipping ? SHIPPING_STEPS : CONTACT_ONLY_STEPS

  const updateAdditionalContact = (index: number, patch: Partial<AttendeeContact>) => {
    setAdditionalContacts((prev) => prev.map((contact, i) => (i === index ? { ...contact, ...patch } : contact)))
  }

  const isDetailValid = !showSize || size !== ''
  const isAddressValid = needsShipping
    ? Boolean(recipientName.trim() && phoneNumber.trim() && address.trim() && city.trim() && postalCode.trim())
    : Boolean(
        recipientName.trim() &&
          phoneNumber.trim() &&
          email.trim() &&
          additionalContacts.every((contact) => contact.name.trim() && contact.phone.trim()),
      )
  const isSubmitting = createOrder.isPending
  const totalPrice = product.price * quantity

  const goNext = () => {
    if (step === 0 && !isDetailValid) return
    if (step === 1 && !isAddressValid) return
    if (step < STEPS.length - 1) setStep((prev) => prev + 1)
  }

  const goPrev = () => setStep((prev) => Math.max(prev - 1, 0))

  const handleCheckout = () => {
    setError('')
    createOrder.mutate(
      {
        productId: product.id,
        quantity,
        size: showSize && size ? size : undefined,
        email: email.trim() || undefined,
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(needsShipping ? { address: address.trim(), city: city.trim(), postalCode: postalCode.trim() } : {}),
        attendees:
          additionalContacts.length > 0
            ? additionalContacts.map((contact) => ({ name: contact.name.trim(), phone: contact.phone.trim() }))
            : undefined,
        paymentMethod,
      },
      {
        onSuccess: (data) => setOrder(data),
        onError: () => setError('Gagal membuat pesanan. Coba lagi.'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Tutup modal" className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-card shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <h2 className="min-w-0 truncate text-rem-100 font-semibold text-foreground">
            {order ? (order.status === 'PENDING' && order.paymentUrl ? 'Lanjutkan Pembayaran' : 'Pesanan Berhasil') : product.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6">
          {order ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary" />
              <p className="text-rem-100 font-semibold text-foreground">
                {order.status === 'PENDING' && order.paymentUrl ? 'Selesaikan pembayaran' : 'Pembayaran berhasil'}
              </p>
              <p className="break-words text-rem-85 text-muted-foreground">
                Pesanan <span className="font-medium text-foreground">#{order.id.slice(-8)}</span> untuk {order.product.name}{' '}
                {order.status === 'PENDING' && order.paymentUrl ? 'menunggu pembayaran.' : 'sudah dikonfirmasi.'}
              </p>
              <div className="mt-2 w-full space-y-1.5 rounded-xl border border-border bg-muted/30 p-4 text-left text-rem-85">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="text-foreground">{order.quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode pembayaran</span>
                  <span className="text-foreground">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatRupiah(order.totalPrice)}</span>
                </div>
              </div>
              {order.status === 'PENDING' && order.paymentUrl && (
                <a
                  href={order.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full rounded-xl bg-primary px-5 py-2.5 text-center text-rem-90 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Bayar Sekarang
                </a>
              )}
            </div>
          ) : (
            <>
              <Stepper steps={STEPS} currentStep={step} />

              <div className="mt-6">
                {step === 0 && (() => {
                  const reviews = pickDummyReviews(product.id)
                  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3)

                  return (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsImageZoomOpen(true)}
                          aria-label="Lihat foto produk"
                          className="group relative h-24 w-20 shrink-0 overflow-hidden rounded-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-opacity group-hover:opacity-80">
                            <ZoomIn className="h-3 w-3" />
                          </span>
                        </button>
                        <div className="min-w-0 space-y-1">
                          <p className="line-clamp-2 text-rem-90 font-medium text-foreground">{product.name}</p>
                          <p className="text-rem-95 font-semibold text-foreground">{formatRupiah(product.price)}</p>
                          <div className="flex items-center gap-1.5 text-rem-80 text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                            <span>({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      {showSize && (
                        <div className="space-y-2 rounded-xl border border-border px-4 py-3">
                          <span className="text-rem-90 text-foreground">Ukuran</span>
                          <div className="flex flex-wrap gap-2">
                            {sizeOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setSize(option)}
                                className={`flex h-9 w-12 items-center justify-center rounded-lg border text-rem-85 font-medium transition-colors ${
                                  size === option
                                    ? 'border-primary bg-primary/10 text-foreground'
                                    : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {showQuantity && (
                        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                          <span className="text-rem-90 text-foreground">Jumlah</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                              disabled={quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-rem-90 font-medium text-foreground">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-rem-90">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold text-foreground">{formatRupiah(totalPrice)}</span>
                      </div>

                      {product.description && (
                        <div className="space-y-2 border-t border-border pt-4">
                          <p className="text-rem-90 font-semibold text-foreground">Deskripsi Produk</p>
                          <p className="whitespace-pre-line break-words text-rem-85 text-muted-foreground">{product.description}</p>
                        </div>
                      )}

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="text-rem-85 font-medium text-foreground">Tentang Penjual · {product.sellerName}</p>
                        {product.sellerDescription && (
                          <p className="mt-1 break-words text-rem-80 text-muted-foreground">{product.sellerDescription}</p>
                        )}
                      </div>

                      <div className="space-y-3 border-t border-border pt-4">
                        <p className="text-rem-90 font-semibold text-foreground">Ulasan Pembeli ({reviews.length})</p>
                        {visibleReviews.map((review, index) => (
                          <div key={index} className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate text-rem-85 font-medium text-foreground">{review.name}</span>
                              <span className="shrink-0 text-rem-75 text-muted-foreground">{review.daysAgo} hari lalu</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  className={`h-3 w-3 ${starIndex < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                                />
                              ))}
                            </div>
                            <p className="break-words text-rem-85 text-muted-foreground">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 pt-1">
                                {review.images.map((imageUrl) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={imageUrl}
                                    src={imageUrl}
                                    alt="Foto ulasan pembeli"
                                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {reviews.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setShowAllReviews((prev) => !prev)}
                            className="w-full rounded-xl border border-border py-2 text-rem-85 font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showAllReviews ? 'Sembunyikan ulasan' : `Lihat semua ${reviews.length} ulasan`}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {step === 1 && (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={needsShipping ? 'Email (opsional)' : 'Email (untuk kirim e-tiket/akses)'}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={additionalContacts.length > 0 ? 'Nama penerima (Tiket 1)' : 'Nama penerima'}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={additionalContacts.length > 0 ? 'Nomor telepon (Tiket 1)' : 'Nomor telepon'}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />

                    {isMultiContact && additionalContacts.length > 0 && (
                      <div className="space-y-3 border-t border-border pt-3">
                        <p className="text-rem-85 font-medium text-foreground">Titip beli? Isi kontak penerima tiket lainnya</p>
                        {additionalContacts.map((contact, index) => (
                          <div key={index} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row">
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => updateAdditionalContact(index, { name: e.target.value })}
                              placeholder={`Nama penerima (Tiket ${index + 2})`}
                              className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-rem-85 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                            />
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => updateAdditionalContact(index, { phone: e.target.value })}
                              placeholder={`Nomor telepon (Tiket ${index + 2})`}
                              className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-rem-85 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {needsShipping && (
                      <>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Alamat lengkap"
                          rows={3}
                          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                        />
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Kota"
                            className="w-full min-w-0 rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                          />
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="Kode pos"
                            className="w-full min-w-0 rounded-xl border border-border bg-background px-4 py-2.5 text-rem-90 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {(Object.keys(PAYMENT_METHOD_LABELS) as DataOrderPaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-rem-90 transition-colors ${
                            paymentMethod === method ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span className="min-w-0 truncate">{PAYMENT_METHOD_LABELS[method]}</span>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                              paymentMethod === method ? 'border-primary' : 'border-border'
                            }`}
                          >
                            {paymentMethod === method && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5 rounded-xl border border-border bg-muted/30 p-4 text-rem-85">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 truncate text-muted-foreground">{product.name} x{quantity}</span>
                        <span className="shrink-0 text-foreground">{formatRupiah(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">{formatRupiah(totalPrice)}</span>
                      </div>
                    </div>

                    {error && <p className="text-rem-80 text-destructive">{error}</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {order ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary px-5 py-2.5 text-rem-90 font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:ml-auto sm:w-auto"
            >
              Selesai
            </button>
          ) : (
            <>
              <span className="order-2 text-center text-rem-85 text-muted-foreground sm:order-1 sm:text-left">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="order-1 flex gap-2 sm:order-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={step === 0}
                  className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-rem-90 font-medium text-muted-foreground transition-opacity disabled:opacity-40 sm:flex-none"
                >
                  Previous
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={(step === 0 && !isDetailValid) || (step === 1 && !isAddressValid)}
                    className="flex-1 rounded-xl bg-primary px-5 py-2.5 text-rem-90 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:flex-none"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-rem-90 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:flex-none"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Bayar Sekarang
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isImageZoomOpen && (
        <CommerceImageZoomModal imageUrl={product.imageUrl} alt={product.name} onClose={() => setIsImageZoomOpen(false)} />
      )}
    </div>
  )
}

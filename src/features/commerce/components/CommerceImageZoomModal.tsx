'use client'

import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { Minus, Plus, X } from 'lucide-react'

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const WHEEL_SENSITIVITY = 0.0015

interface Props {
  imageUrl: string
  alt: string
  onClose: () => void
}

const clampScale = (scale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

export default function CommerceImageZoomModal({ imageUrl, alt, onClose }: Readonly<Props>) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null)
  const pinchState = useRef<{ distance: number; scale: number } | null>(null)
  const activePointers = useRef(new Map<number, { x: number; y: number }>())
  const lastTapRef = useRef(0)

  const applyZoom = (nextScale: number) => {
    const clamped = clampScale(nextScale)
    setScale(clamped)
    if (clamped === MIN_SCALE) setPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => applyZoom(scale + 0.75)
  const zoomOut = () => applyZoom(scale - 0.75)

  const toggleDoubleTapZoom = () => {
    if (scale > MIN_SCALE) {
      applyZoom(MIN_SCALE)
    } else {
      applyZoom(DOUBLE_TAP_SCALE)
    }
  }

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    applyZoom(scale - e.deltaY * WHEEL_SENSITIVITY * scale)
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size === 2) {
      const [a, b] = Array.from(activePointers.current.values())
      pinchState.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale }
      dragState.current = null
      return
    }

    if (scale > MIN_SCALE) {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      dragState.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y }
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!activePointers.current.has(e.pointerId)) return
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size === 2 && pinchState.current) {
      const [a, b] = Array.from(activePointers.current.values())
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const ratio = distance / pinchState.current.distance
      applyZoom(pinchState.current.scale * ratio)
      return
    }

    if (dragState.current && dragState.current.pointerId === e.pointerId) {
      setPosition({
        x: dragState.current.originX + (e.clientX - dragState.current.startX),
        y: dragState.current.originY + (e.clientY - dragState.current.startY),
      })
    }
  }

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size < 2) pinchState.current = null
    if (dragState.current?.pointerId === e.pointerId) dragState.current = null
  }

  const handleClick = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) toggleDoubleTapZoom()
    lastTapRef.current = now
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button type="button" aria-label="Tutup zoom foto" className="absolute inset-0 cursor-default bg-black/80" onClick={onClose} />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className="relative h-full w-full touch-none select-none overflow-hidden"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerLeave={endPointer}
        onPointerCancel={endPointer}
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className={`absolute left-1/2 top-1/2 max-h-full max-w-full object-contain transition-transform duration-100 ease-out ${
            scale > MIN_SCALE ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
          style={{ transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-2 py-1.5">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Perkecil"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-rem-80 text-white">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          aria-label="Perbesar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

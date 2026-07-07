import { X } from 'lucide-react'
import type { CommerceGenderFilter, CommerceToneFilter } from '../types/commerceTypes'

interface Props {
  open: boolean
  bottomOffset: number
  genderFilter: CommerceGenderFilter
  toneFilter: CommerceToneFilter
  onClose: () => void
  onSelectGender: (filter: CommerceGenderFilter) => void
  onSelectTone: (filter: CommerceToneFilter) => void
}

const GENDER_CHIPS: Array<{ value: CommerceGenderFilter; label: string }> = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PEREMPUAN', label: 'Perempuan' },
  { value: 'LAKI_LAKI', label: 'Laki-laki' },
]

const TONE_CHIPS: Array<{ value: CommerceToneFilter; label: string }> = [
  { value: 'ALL', label: 'Semua Warna' },
  { value: 'PASTEL', label: 'Pastel' },
  { value: 'EARTH_TONE', label: 'Earth Tone' },
  { value: 'SARIMBIT', label: 'Sarimbit' },
]

export default function CommerceFilterSheet({
  open,
  bottomOffset,
  genderFilter,
  toneFilter,
  onClose,
  onSelectGender,
  onSelectTone,
}: Readonly<Props>) {
  const chipClassFor = (isActive: boolean) =>
    isActive
      ? 'shrink-0 rounded-full bg-foreground px-3 py-1.5 text-rem-80 font-medium text-background'
      : 'shrink-0 rounded-full bg-muted px-3 py-1.5 text-rem-80 font-medium text-muted-foreground hover:bg-muted/70'

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      {/* Same inset-x-0 + px-4 + inner mx-auto max-w-2xl recipe as the input bar container, so this lines up with it exactly regardless of sidebar width. */}
      <div
        style={{ bottom: bottomOffset + 80 }}
        className={`absolute inset-x-0 z-50 px-4 ${open ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`mx-auto max-w-2xl rounded-2xl border border-border bg-card px-4 pb-5 pt-4 shadow-2xl transition-[transform,opacity] duration-300 ease-in-out ${
            open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-rem-95 font-semibold text-foreground">Filter</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup filter"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-rem-80 font-medium text-muted-foreground">Kategori</span>
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {GENDER_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => onSelectGender(chip.value)}
                    className={chipClassFor(genderFilter === chip.value)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-rem-80 font-medium text-muted-foreground">Warna</span>
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {TONE_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => onSelectTone(chip.value)}
                    className={chipClassFor(toneFilter === chip.value)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'

const WORDS = ['knolwedge', 'experience', 'lifestyle']
const WORD_INTERVAL_MS = 2200
const LONGEST_WORD_LENGTH = Math.max(...WORDS.map((word) => word.length))

export default function CommerceUpgradeTitle() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length)
    }, WORD_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <h2 className="mb-3 text-left text-rem-160 font-semibold tracking-tight text-foreground drop-shadow-sm sm:text-rem-200">
      Upgrade your{' '}
      {/* fixed-width slot sized to the longest word so only the word itself animates — "Upgrade your" never shifts */}
      <span className="relative inline-block text-left align-bottom" style={{ minWidth: `${LONGEST_WORD_LENGTH}ch` }}>
        <span key={index} className="inline-block animate-word-blast text-primary">
          {WORDS[index]}
        </span>
      </span>
    </h2>
  )
}

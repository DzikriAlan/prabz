import type { ReactNode } from 'react'

interface Props {
  title?: string
  noPadding?: boolean
  hideTitleMobile?: boolean
  headerRight?: ReactNode
  children: ReactNode
}

export default function Layout({ title, noPadding, headerRight, children }: Readonly<Props>) {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {title && (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:h-16 md:px-6">
          <h1 className="text-rem-100 font-semibold md:text-rem-110">{title}</h1>
          {headerRight}
        </header>
      )}
      <main className={`flex-1 ${noPadding ? 'min-h-0 overflow-hidden' : 'overflow-y-auto p-4'}`}>{children}</main>
    </div>
  )
}

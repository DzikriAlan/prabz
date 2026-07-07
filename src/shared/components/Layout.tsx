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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {title && (
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-rem-100 font-semibold">{title}</h1>
          {headerRight}
        </header>
      )}
      <main className={noPadding ? 'min-h-0 flex-1 overflow-hidden' : 'flex-1 p-4'}>{children}</main>
    </div>
  )
}

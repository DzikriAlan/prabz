import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Loader2 } from 'lucide-react'
import Layout from '@/shared/components/Layout'
import CommerceView from '@/features/commerce/components/CommerceView'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CommerceCatchAllPage: NextPage = () => {
  const router = useRouter()
  const { slug } = router.query

  if (!router.isReady) {
    return (
      <>
        <Head>
          <title>Commerce — prabz</title>
        </Head>
        <Layout noPadding>
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Layout>
      </>
    )
  }

  const parts = Array.isArray(slug) ? slug : []

  // /commerce/{sessionId} — legacy unscoped session (sessionId is always a UUID)
  // /commerce/{username} — seller storefront landing page
  // /commerce/{username}/{sessionId} — seller-scoped session
  let conversationId: string | undefined
  let sellerUsername: string | undefined

  if (parts.length === 1) {
    if (UUID_REGEX.test(parts[0])) {
      conversationId = parts[0]
    } else {
      sellerUsername = parts[0]
    }
  } else if (parts.length === 2) {
    ;[sellerUsername, conversationId] = parts
  }

  return (
    <>
      <Head>
        <title>Commerce — prabz</title>
      </Head>
      <Layout noPadding>
        {parts.length > 2 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">Halaman tidak ditemukan.</div>
        ) : (
          <CommerceView conversationId={conversationId} sellerUsername={sellerUsername} />
        )}
      </Layout>
    </>
  )
}

export default CommerceCatchAllPage

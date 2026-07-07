import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '@/shared/components/Layout'
import CommerceView from '@/features/commerce/components/CommerceView'

const CommercePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Commerce — prabz</title>
      </Head>
      <Layout noPadding>
        <CommerceView />
      </Layout>
    </>
  )
}

export default CommercePage

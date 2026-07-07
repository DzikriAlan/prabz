import type { GetServerSideProps, NextPage } from 'next'

const CommerceIndexRedirect: NextPage = () => null

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: '/', permanent: false } }
}

export default CommerceIndexRedirect

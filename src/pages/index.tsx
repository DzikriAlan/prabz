import type { NextPage } from "next";
import Head from "next/head";
import Layout from "@/shared/components/Layout";
import CommerceView from "@/features/commerce/components/CommerceView";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>prabz</title>
        <meta name="description" content="prabz" />
      </Head>
      <Layout noPadding>
        <CommerceView />
      </Layout>
    </>
  );
};

export default Home;

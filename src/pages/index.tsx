import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>prabz</title>
        <meta name="description" content="prabz" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">prabz</h1>
        <Link href="/commerce" className="text-primary underline">
          Buka Commerce
        </Link>
      </main>
    </>
  );
};

export default Home;

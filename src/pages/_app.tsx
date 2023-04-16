import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_NAME}</title>
        <meta name="description" content="Created by github.com/lonelil" />
        <link rel="icon" href={process.env.NEXT_PUBLIC_LOGO} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-white gap-4">
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);

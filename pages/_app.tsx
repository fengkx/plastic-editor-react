import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import { Provider } from "jotai";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Head>
        <title>Plastic editor react</title>
        <link rel="icon" href="/favicon.ic" />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
export default MyApp;

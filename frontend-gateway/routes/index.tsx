import { Head } from "$fresh/runtime.ts";
import { LandingPage } from "../islands/landing/index.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Muse | Digital Intelligence Gateway</title>
        <meta name="description" content="Capture raw thought, contemplate patterns, and synthesize your digital soul with Muse." />
      </Head>
      <LandingPage />
    </>
  );
}

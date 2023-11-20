import { type AppType } from "next/dist/shared/lib/utils";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "~/components/header/ThemeProvider";
import NextNProgress from "nextjs-progressbar";

import "~/styles/globals.css";
import { Toaster } from "~/components/ui/toaster";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RecoilRoot>
        <NextNProgress options={{ showSpinner: false }} />
        <Component {...pageProps} />
        <Toaster />
      </RecoilRoot>
    </ThemeProvider>
  );
};

export default MyApp;

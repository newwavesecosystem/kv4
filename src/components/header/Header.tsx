import Head from "next/head";
import React from "react";
import { useRecoilValue } from "recoil";
import {
  getRGBColor,
  getDynamicSecondaryColor,
  getContrastColor,
} from "~/lib/utils";
import { currentColorTheme } from "~/recoil/atom";

function Header() {
  const currentColor = useRecoilValue(currentColorTheme);

  const primaryColor = getRGBColor(currentColor.background, "primary");
  const secondaryColor = getRGBColor(
    getDynamicSecondaryColor(currentColor.background),
    "secondary",
  );
  const a11yColor = getRGBColor(
    getContrastColor(currentColor.background),
    "a11y",
  );
  return (
    <Head>
      <title>Konn3ct</title>
      <meta name="description" content="Konn3ct" />
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <style>:root {`{${primaryColor} ${a11yColor} ${secondaryColor}}`}</style>
    </Head>
  );
}

export default Header;

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
      <title>Conference</title>
      <meta name="description" content="Conference" />
      <link rel="icon" href="/logo_1gov.png" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/logo_1gov.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/logo_1gov.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/logo_1gov.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <style>:root {`{${primaryColor} ${a11yColor} ${secondaryColor}}`}</style>
    </Head>
  );
}

export default Header;

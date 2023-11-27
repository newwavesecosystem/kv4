import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const hexToRGB = (hex: string) => {
  // convert hex to rgb
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export const RGBToHex = (rgb: { r: number; g: number; b: number }) => {
  return `#${((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b)
    .toString(16)
    .slice(1)}`;
};

export const getContrastColor = (hexColor: string) => {
  // Convert hex to RGB
  const rgb = hexToRGB(hexColor);

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Choose black or white text based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

export const getRGBColor = (hex: string, type: string) => {
  // rgb values
  const rgb = hexToRGB(hex);

  return `--color-${type}: ${rgb.r} ${rgb.g} ${rgb.b};`;
};

export const getDynamicSecondaryColor = (primaryColorHex: string) => {
  const primaryRGB = hexToRGB(primaryColorHex);
  const secondaryRGB = {
    r: 255 - primaryRGB.r,
    g: 255 - primaryRGB.g,
    b: 255 - primaryRGB.b,
  };
  const secondaryColor = RGBToHex(secondaryRGB);
  return secondaryColor;
};

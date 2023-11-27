import { useRecoilValue } from "recoil";
import { currentColorTheme } from "~/recoil/atom";
import { getContrastColor, getRGBColor } from "./utils";

function useTextColor() {
  const currentColor = useRecoilValue(currentColorTheme);
  const a11yColor = getRGBColor(
    getContrastColor(currentColor.background),
    "a11y",
  );
  return a11yColor;
}

export default useTextColor;

import { useEffect, useState } from "react";

const breakPoinnts = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const getCurrentScreenSize = (width: number) => {
  if (width < breakPoinnts.sm)
    return {
      id: 1,
      name: "sm",
    };
  if (width < breakPoinnts.md)
    return {
      id: 2,
      name: "md",
    };
  if (width < breakPoinnts.lg)
    return {
      id: 3,
      name: "lg",
    };
  return {
    id: 4,
    name: "xl",
  };
};

function useScreenSize() {
  const isClient = typeof window === "object";
  const [screenSize, setScreenSize] = useState(
    isClient
      ? getCurrentScreenSize(window.innerWidth)
      : {
          id: 4,
          name: "xl",
        },
  );
  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => {
      setScreenSize(getCurrentScreenSize(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isClient]);

  return screenSize;
}

export default useScreenSize;

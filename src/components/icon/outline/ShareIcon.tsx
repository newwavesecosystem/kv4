import { useTheme } from "next-themes";
import { FC, SVGProps } from "react";

const ShareIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  const { theme } = useTheme();
  const fillColor = "white";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={fillColor}
      height={24}
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.8667 7.19994H13C12.4342 7.19994 11.8916 7.42471 11.4915 7.82478C11.0914 8.22486 10.8667 8.76748 10.8667 9.33328V11.9999M18.8667 7.19994L15.6667 10.4M18.8667 7.19994L15.6667 4M16.7333 13.6001V18.9334C16.7333 19.2163 16.621 19.4876 16.4209 19.6877C16.2209 19.8877 15.9496 20.0001 15.6667 20.0001H6.06667C5.78377 20.0001 5.51246 19.8877 5.31242 19.6877C5.11238 19.4876 5 19.2163 5 18.9334V10.4001C5 10.1172 5.11238 9.84588 5.31242 9.64585C5.51246 9.44581 5.78377 9.33343 6.06667 9.33343H7.66667"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShareIcon;

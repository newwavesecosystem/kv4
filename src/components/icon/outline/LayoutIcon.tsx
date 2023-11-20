import { useTheme } from "next-themes";
import { FC, SVGProps } from "react";

const LayoutIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  const { theme } = useTheme();
  const fillColor = "white";
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fillColor}
      height={24}
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.4 5.6C5.95817 5.6 5.6 5.95817 5.6 6.4V8.80003H9.59999H18.4V6.4C18.4 5.95817 18.0418 5.6 17.6 5.6H6.4ZM8.79999 10.4H5.6V17.6C5.6 18.0418 5.95817 18.4 6.4 18.4H8.79999V10.4ZM10.4 18.4V10.4H18.4V17.6C18.4 18.0418 18.0418 18.4 17.6 18.4H10.4ZM9.60769 20H17.6C18.9255 20 20 18.9255 20 17.6V9.60003V6.4C20 5.07452 18.9255 4 17.6 4H6.4C5.07452 4 4 5.07452 4 6.4V9.60003V17.6C4 18.9255 5.07452 20 6.4 20H9.5923C9.59486 20 9.59742 20 9.59999 20C9.60256 20 9.60512 20 9.60769 20Z"
      />
    </svg>
  );
};

export default LayoutIcon;

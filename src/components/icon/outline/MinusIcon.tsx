import { FC, SVGProps } from "react";

const MinusIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      height={24}
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.87188 12.777C4.26147 12.777 3.74951 12.2749 3.74951 11.6546C3.74951 11.0343 4.26147 10.5322 4.87188 10.5322H19.128C19.7384 10.5322 20.2504 11.0343 20.2504 11.6546C20.2504 12.2749 19.7384 12.777 19.128 12.777H4.87188Z"
        className="fill-a11y"
      />
    </svg>
  );
};

export default MinusIcon;

import { FC, SVGProps } from "react";

const PauseIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      height={24}
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.77778 5C7.34822 5 7 5.34822 7 5.77778V18.2222C7 18.6518 7.34822 19 7.77778 19H10.8889C11.3184 19 11.6667 18.6518 11.6667 18.2222V5.77778C11.6667 5.34822 11.3184 5 10.8889 5H7.77778ZM8.55556 17.4444V6.55556H10.1111V17.4444H8.55556ZM14 5C13.5704 5 13.2222 5.34822 13.2222 5.77778V18.2222C13.2222 18.6518 13.5704 19 14 19H17.1111C17.5407 19 17.8889 18.6518 17.8889 18.2222V5.77778C17.8889 5.34822 17.5407 5 17.1111 5H14ZM14.7778 17.4444V6.55556H16.3333V17.4444H14.7778Z"
        className="fill-a11y"
      />
    </svg>
  );
};

export default PauseIcon;

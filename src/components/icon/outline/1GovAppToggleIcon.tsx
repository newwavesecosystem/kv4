import { FC, SVGProps } from "react";

const OneGovAppToggleIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  return (
      <svg
          viewBox="0 0 28 29"
          className="fill-[#ACB5BD] h-6 w-6"
          height={24}
          width={24}
          xmlns="http://www.w3.org/2000/svg"
          {...props}
      >
        <path
            d="M9 0.5H3C1.34315 0.5 0 1.84315 0 3.5V9.5C0 11.1569 1.34315 12.5 3 12.5H9C10.6569 12.5 12 11.1569 12 9.5V3.5C12 1.84315 10.6569 0.5 9 0.5Z"/>
        <path
            d="M9 16.5H3C1.34315 16.5 0 17.8431 0 19.5V25.5C0 27.1569 1.34315 28.5 3 28.5H9C10.6569 28.5 12 27.1569 12 25.5V19.5C12 17.8431 10.6569 16.5 9 16.5Z"/>
        <path
            d="M25 0.5H19C17.3431 0.5 16 1.84315 16 3.5V9.5C16 11.1569 17.3431 12.5 19 12.5H25C26.6569 12.5 28 11.1569 28 9.5V3.5C28 1.84315 26.6569 0.5 25 0.5Z"/>
        <path
            d="M25 16.5H19C17.3431 16.5 16 17.8431 16 19.5V25.5C16 27.1569 17.3431 28.5 19 28.5H25C26.6569 28.5 28 27.1569 28 25.5V19.5C28 17.8431 26.6569 16.5 25 16.5Z"/>
      </svg>
  );
};

export default OneGovAppToggleIcon;

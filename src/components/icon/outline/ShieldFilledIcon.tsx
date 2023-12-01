import { FC, SVGProps } from "react";

const ShieldFilledIcon: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      height={24}
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.2146 0.780088C12.0774 0.739989 11.9315 0.73997 11.7942 0.780034L2.78988 3.40786C2.46994 3.50123 2.25 3.79453 2.25 4.12782V9.51435C2.25 15.5029 6.08268 20.8193 11.7643 22.7118C11.9182 22.7631 12.0845 22.7631 12.2384 22.7118C17.9185 20.8192 21.75 15.5039 21.75 9.51684V4.12782C21.75 3.7946 21.5302 3.50134 21.2103 3.40791L12.2146 0.780088Z"
        className="fill-a11y"
      />
    </svg>
  );
};

export default ShieldFilledIcon;

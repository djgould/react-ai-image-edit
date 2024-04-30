import { ComponentProps } from "react";
import { classNames } from "./utils/classnames";

export interface ButtonProps extends ComponentProps<"button"> {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
}

export function Button({
  children,
  className,
  selected,
  ...restProps
}: ButtonProps) {
  const classes = classNames(
    "w-12 h-12 bg-gray-100 rounded p-4",
    selected && "bg-blue-100",
    className,
  );
  return (
    <button {...restProps} className={classes}>
      {children}
    </button>
  );
}

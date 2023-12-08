import { ButtonHTMLAttributes } from "react";
import { cn } from "../helpers";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "positive";
}) => {
  return (
    <button
      type={type}
      className={cn(
        "uppercase p-2 rounded font-black w-full h-10 border tracking-wide",
        props.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        variant === "primary"
          ? "bg-primary-400 border-primary-600 dark:border-primary-300 text-white"
          : // ? "bg-blue-500 text-white"
          variant === "secondary"
          ? "dark:border-neutral-500 bg-neutral-200 dark:bg-neutral-700"
          : variant === "positive"
          ? "bg-green-400 text-green-900 border-green-600 dark:border-green-500 dark:bg-green-700 dark:text-green-200"
          : ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

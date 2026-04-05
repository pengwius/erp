import React from "react";

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const primaryBase =
  "px-6 py-3 rounded-2xl bg-primary bg-opacity-90 text-primary-content font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-none border-none hover:bg-primary hover:cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2";

const ghostBase =
  "px-6 py-3 rounded-2xl bg-primary/10 text-primary font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-none border-none hover:bg-primary/20 hover:cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2";

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  loading = false,
  loadingText,
  icon,
  iconPosition = "left",
  ...rest
}: PrimaryButtonProps) {
  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      <span>{children}</span>
      {icon && iconPosition === "right" && icon}
    </>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${primaryBase} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm" />
          <span>{loadingText ?? children}</span>
        </span>
      ) : (
        content
      )}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${ghostBase} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

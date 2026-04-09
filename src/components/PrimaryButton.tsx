import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type PrimaryButtonProps = {
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
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText ?? children}</span>
        </span>
      ) : (
        content
      )}
    </Button>
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
    <Button
      variant="ghost"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}

export function SoftPrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <Button
      variant="secondary"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}

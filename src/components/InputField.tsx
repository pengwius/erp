import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  info?: string;
  type?: React.HTMLInputTypeAttribute;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  inputClassName = "",
  info,
  type,
  ...rest
}) => {
  const inputType = type ?? "text";

  return (
    <div className={`space-y-2 w-full ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="flex items-center gap-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {info && (
          <span
            className="text-[10px] text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center bg-muted border border-border cursor-help"
            title={info}
            aria-label={`Info: ${info}`}
          >
            ?
          </span>
        )}
      </div>

      <Input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClassName}
        {...rest}
      />
    </div>
  );
};

export default InputField;

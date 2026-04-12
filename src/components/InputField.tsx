import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

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
  showOptional?: boolean;
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
  showOptional = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const inputType = type ?? "text";

  return (
    <div className={`space-y-2 w-full ${className}`}>
      <div className="flex items-start sm:items-center gap-2">
        <Label className="flex flex-wrap items-center gap-1 leading-snug">
          <span>
            {label} {required && <span className="text-destructive">*</span>}
          </span>
          {!required && showOptional && (
            <span className="text-muted-foreground font-normal text-xs whitespace-normal inline-block mt-0.5 sm:mt-0">
              ({t("common.optional")})
            </span>
          )}
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

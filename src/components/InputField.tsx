import React from "react";

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  ...rest
}) => (
  <label className={`form-control w-full ${className}`}>
    <div className="label pb-1.5">
      <span className="label-text font-medium text-base-content/80">
        {label} {required && <span className="text-error">*</span>}
      </span>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="input w-full bg-base-200/50 border-transparent focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-none"
      {...rest}
    />
  </label>
);

export default InputField;

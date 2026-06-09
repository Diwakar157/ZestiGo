import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { classNames } from "@/utils/format";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={classNames(
              "h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40",
              !!icon && "pl-10",
              error && "border-destructive focus:ring-destructive/30",
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);
InputField.displayName = "InputField";

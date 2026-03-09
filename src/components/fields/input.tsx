import React, { useId, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Define the props interface for TypeScript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  variant?: "default" | "outline" | "filled";
  className?: string;
  type?: string;
  error?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  type?: string;
  variant?: "default" | "outline" | "filled";
  className?: string;
  error?: string;
}

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps | TextareaProps
>(
  (
    { label, type = "text", className = "", variant = "default", ...props },
    ref,
  ) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Base styles for inputs
    const baseStyles =
      "w-full px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200";

    // Variant styles
    const variantStyles = {
      default:
        "border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500",
      outline:
        "border border-gray-300 dark:border-slate-700 rounded-md bg-transparent focus:ring-blue-500",
      filled:
        "border-0 rounded-md bg-gray-100 dark:bg-slate-700 focus:ring-blue-500",
    };

    // Extract error from props (needs to be typed in the component signature or cast)
    const error = (props as any).error as string | undefined;
    // Remove error from props passed to DOM
    const { error: _unusedError, ...domProps } = props as any;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-black dark:text-white"
          >
            {label}
          </label>
        )}
        {type === "textarea" ? (
          <textarea
            className={`${baseStyles} ${variantStyles[variant]} resize-y min-h-[80px] ${
              error ? "border-red-500 focus:ring-red-500" : ""
            } ${className}`}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...(domProps as TextareaProps)}
            id={id}
          />
        ) : (
          <div className="relative">
            <input
              type={showPassword && type === "password" ? "text" : type}
              className={`${baseStyles} ${variantStyles[variant]} ${
                error ? "border-red-500 focus:ring-red-500" : ""
              } ${className}`}
              ref={ref as React.Ref<HTMLInputElement>}
              {...(domProps as InputProps)}
              id={id}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            )}
          </div>
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

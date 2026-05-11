import React, { useId, useState, forwardRef } from "react";

/* ---------------------------------------------------
   TYPE DEFINITIONS
--------------------------------------------------- */

// This is the type react-hook-form expects when calling onChange
export interface ToggleChangeEvent {
  target: {
    name?: string;
    value: boolean;
  };
}

// Props for the Toggle component
// Props for the Toggle component
export interface ToggleProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: React.ReactNode;
  className?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>; // RHF-compatible
}

/* ---------------------------------------------------
   COMPONENT
--------------------------------------------------- */

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, className = "", name, onChange, ...props }, ref) => {
    const id = useId();

    return (
      <div
        className={`flex flex-row items-center justify-between gap-4 w-full max-w-[280px] group cursor-pointer ${className}`}
      >
        {/* LABEL */}
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all text-black opacity-80 group-hover:opacity-100 peer-checked:opacity-100"
          >
            {label}
          </label>
        )}

        {/* TOGGLE */}
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={id}
            name={name}
            className="peer w-5 h-5 rounded-md border-2 border-black/10 checked:bg-[#6bbd45] checked:border-black transition-all appearance-none cursor-pointer"
            onChange={onChange}
            ref={ref}
            {...props}
          />
          <svg
            className="absolute w-3 h-3 text-black pointer-events-none left-1 opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
    );
  },
);

export default Toggle;

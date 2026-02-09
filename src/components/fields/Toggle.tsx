 

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
export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
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
    const [checked, setChecked] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      setChecked(newValue);
      onChange?.(e);
    };

    return (
      <div className="flex flex-row items-center w-full">
        {/* LABEL */}
        {label && (
          <label
            htmlFor={id}
            className={`block mb-1 w-fit min-w-28 font-normal text-sm text-gray-700 ${
              checked ? "font-semibold" : ""
            }`}
          >
            {label}
          </label>
        )}

        {/* TOGGLE */}
        <input
          type="checkbox"
          id={id}
          name={name}
          onChange={handleChange}
          ref={ref}
          {...props}
        />

        {/* SELECTED TEXT */}
        {checked && <span className="font-bold text-green-500">Selected</span>}
      </div>
    );
  }
);

export default Toggle;

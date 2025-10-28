
import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${className} text-center md:px-5 px-3 md:py-1 py-0 font-semibold bg-linear-to-r from-emerald-200 to-teal-500 hover:bg-teal-700 transform hover:scale-105 transition-transform duration-200 text-white md:text-md hover:font-bold text-sm rounded-xl`}

        {...props}
      >
        {children}
    </button>
  )
}

export default Button
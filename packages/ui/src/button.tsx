"use client";

import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  type:"submit" | "button"
}

export const Button = ({ children, className, appName,type }: ButtonProps) => {
  return (
    <button
      type={type}
      className={className}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};

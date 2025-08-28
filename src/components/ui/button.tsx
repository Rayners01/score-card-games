'use client';
import { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition ${className}`}
    />
  );
}

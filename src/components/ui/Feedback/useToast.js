import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

/**
 * useToast — access the toast() / dismiss() functions from anywhere
 * inside a <ToastProvider>.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

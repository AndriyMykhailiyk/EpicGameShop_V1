"use client";

import { useState, useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  duration?: number;
}

export function Toast({ message, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return <div className={styles.toast}>{message}</div>;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>(
    []
  );

  useEffect(() => {
    // Listen for custom events
    const handleAddToast = (event: CustomEvent) => {
      const id = Date.now().toString();
      const message = event.detail.message;
      setToasts((prev) => [...prev, { id, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("showToast" as any, handleAddToast);
    return () => window.removeEventListener("showToast" as any, handleAddToast);
  }, []);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function showToast(message: string) {
  const event = new CustomEvent("showToast", { detail: { message } });
  window.dispatchEvent(event);
}

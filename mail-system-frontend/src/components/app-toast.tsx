"use client";

import { toast as sonnerToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

/** Mount once in Providers */
export function AppToaster() {
  return <Toaster position="top-center" richColors closeButton />;
}

type ToastVariant = "default" | "success" | "error" | "info" | "warning";

/**
 * Show a toast — pass only the message you want to display.
 *
 * @example toast("حدث خطأ، يرجى المحاولة لاحقاً")
 * @example toast("تم الحفظ بنجاح", "success")
 */
export function toast(message: string, variant: ToastVariant = "default") {
  switch (variant) {
    case "success":
      return sonnerToast.success(message);
    case "error":
      return sonnerToast.error(message);
    case "info":
      return sonnerToast.info(message);
    case "warning":
      return sonnerToast.warning(message);
    default:
      return sonnerToast(message);
  }
}

toast.success = (message: string) => toast(message, "success");
toast.error = (message: string) => toast(message, "error");
toast.info = (message: string) => toast(message, "info");
toast.warning = (message: string) => toast(message, "warning");

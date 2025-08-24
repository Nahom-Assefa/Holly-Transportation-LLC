import { COMPANY_INFO } from "@shared/constants";

interface HandlePhoneClickOptions {
  toast?: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  fallbackTimeoutMs?: number;
}

export const handlePhoneClick = (options?: HandlePhoneClickOptions): void => {
  const phoneNumber = COMPANY_INFO.PHONE;
  const cleanNumber = COMPANY_INFO.PHONE_CLEAN;
  const FALLBACK_TIMEOUT = options?.fallbackTimeoutMs ?? 15000; // 15s

  const showFallbackToast = () => {
    if (options?.toast) {
      options.toast(`If there was a problem making the call please manually dial the phone number: ${phoneNumber}`, "warning");
    }
    navigator.clipboard.writeText(cleanNumber).catch(() => {
      // fail silently if clipboard not allowed
    });
  };

  // Start fallback timer
  const fallbackTimer = setTimeout(showFallbackToast, FALLBACK_TIMEOUT);

  // Cancel fallback if user leaves page / interacts
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  try {
    // Attempt the call
    window.location.href = `tel:${cleanNumber}`;
  } catch (error) {
    console.error("tel: protocol failed:", error);
    clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    showFallbackToast();
  }
};

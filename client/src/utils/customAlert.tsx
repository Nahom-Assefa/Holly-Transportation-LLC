import { useToast as useOriginalToast } from "@/hooks/use-toast";

type AlertType = "success" | "info" | "warning" | "error";

export const useCustomAlert = () => {
  const { toast } = useOriginalToast();

  // Adapter: matches handlePhoneClick expected signature
  const customAlert = (message: string, type: AlertType = "info") => {
    const getVariant = (type: AlertType) => {
      switch (type) {
        case "error": return "destructive";
        case "warning": return "warning";
        case "success": return "success";
        default: return "default";
      }
    };

    const getTitle = (type: AlertType) => {
      switch (type) {
        case "error": return "Error";
        case "warning": return "Warning";
        case "success": return "Success";
        default: return "Info";
      }
    };

    toast({
      title: getTitle(type),
      description: message,
      variant: getVariant(type),
    });
  };

  return customAlert;
};
/**
 * Company Constants
 * 
 * @description Centralized company information to avoid hardcoding values
 * throughout the application. Single source of truth for contact details.
 */

export const COMPANY_INFO = {
  // Contact Information
  PHONE: "(612) 597-4248",
  PHONE_CLEAN: "+16125974248",
  EMAIL: "hollytransport04@gmail.com",
  
  // Company Details
  NAME: "Holly Transportation LLC",
  WEBSITE: "https://hollytransportation.com",
  
  // Address
  ADDRESS: {
    STREET: "123 Main Street",
    CITY: "Minneapolis",
    STATE: "MN",
    ZIP: "55401"
  },
  
  // Business Hours
  HOURS: "6AM to 6PM",
  
  // Service Area
  SERVICE_AREA: "Minneapolis-St. Paul Metro Area"
} as const;

// Type for the constants
export type CompanyInfo = typeof COMPANY_INFO;

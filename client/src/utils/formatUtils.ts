/**
 * Utility functions for formatting data
 */

/**
 * Formats service type enum values to user-friendly labels
 * @param type - Service type enum value
 * @returns Formatted service type string
 */
export const formatServiceType = (type: string | null): string => {
  if (!type) return 'Unknown';
  
  switch (type) {
    case 'one_way':
      return 'One-way';
    case 'round_trip':
      return 'Round-trip';
    case 'wait_and_return':
      return 'Wait & Return';
    default:
      return type;
  }
};

/**
 * Formats mobility assistance enum values to user-friendly labels
 * @param type - Mobility assistance enum value
 * @returns Formatted mobility assistance string
 */
export const formatMobilityAssistance = (type: string | null): string => {
  if (!type) return 'Unknown';
  
  switch (type) {
    case 'independent':
      return 'Independent walking';
    case 'walker':
      return 'Walker assistance';
    case 'other':
      return 'Other';
    default:
      return type;
  }
};

/**
 * Function to format status display text
 * @param status - Status enum value
 * @returns Formatted status string
 */
export const formatStatus = (status: string | null): string => {
  if (!status) return 'Unknown';
  
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Denied';
    default:
      return status;
  }
};

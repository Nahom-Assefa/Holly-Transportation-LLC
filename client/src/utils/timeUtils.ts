/**
 * Utility functions for time formatting
 */

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param time - Time string in 24-hour format (e.g., "14:30")
 * @returns Formatted time string in 12-hour format (e.g., "2:30 PM")
 */
export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return time; // fallback to original if parsing fails
  }
};

/**
 * Formats a date string to a readable format
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // fallback to original if parsing fails
  }
};

/**
 * DateTime formatting composable
 * Provides reusable datetime formatting and parsing functions
 */

export const useDateTime = () => {
  /**
   * Format Date object to datetime-local input format
   * @param {Date} value - The Date object to format
   * @returns {string} Formatted datetime string (e.g., "2024-02-04T14:30")
   */
  const formatDateTimeLocal = (value) => {
    if (!value || !(value instanceof Date)) return "";
    if (isNaN(value.getTime())) return "";

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Parse datetime-local input string back to Date object
   * @param {string} value - The formatted datetime string
   * @returns {Date|null} Parsed Date object or null
   */
  const parseDateTime = (value) => {
    if (!value) return null;
    const [date, time] = value.split("T");
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");

    const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
    return dateObj;
  };

  return {
    formatDateTimeLocal,
    parseDateTime,
  };
};

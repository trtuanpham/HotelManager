/**
 * DateTime formatting composable
 * Provides reusable datetime formatting and parsing functions
 */

export const useDateTime = () => {
  /**
   * Format Date object to datetime-local input format
   * @param {Date} value - The Date object to format
   * @returns {string} Formatted datetime string (e.g., "02/12/2026, 14:30")
   */
  const formatDateTimeLocal = (value) => {
    if (typeof value === "string") {
      value = new Date(value);
    }

    if (!value || !(value instanceof Date) || isNaN(value.getTime())) {
      return "";
    }

    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  /**
   * Parse datetime-local input string back to Date object
   * @param {string} value - The formatted datetime string (e.g., "02/12/2026, 14:30")
   * @returns {Date|null} Parsed Date object or null
   */
  const parseDateTime = (value) => {
    if (!value) return null;

    try {
      const [datePart, timePart] = value.split(", ");
      const [day, month, year] = datePart.split("/").map((part) => parseInt(part, 10));
      const [hours, minutes] = timePart.split(":").map((part) => parseInt(part, 10));

      const dateObj = new Date(year, month - 1, day, hours, minutes, 0);

      if (isNaN(dateObj.getTime())) {
        return null;
      }

      return dateObj;
    } catch (error) {
      console.error("Error parsing datetime:", error);
      return null;
    }
  };

  return {
    formatDateTimeLocal,
    parseDateTime,
  };
};

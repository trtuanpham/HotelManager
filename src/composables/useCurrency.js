/**
 * Currency formatting composable
 * Provides reusable currency formatting and parsing functions
 */

export const useCurrency = () => {
  /**
   * Format number to currency string with comma separators
   * @param {number} value - The number to format
   * @returns {string} Formatted currency string (e.g., "1,000,000")
   */
  const formatCurrency = (value) => {
    if (!value || value === 0) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /**
   * Parse currency string back to number
   * @param {string} value - The formatted currency string
   * @returns {number} Parsed number
   */
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseInt(value.replace(/,/g, ""), 10) || 0;
  };

  return {
    formatCurrency,
    parseCurrency,
  };
};

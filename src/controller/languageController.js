/**
 * LanguageController - Centralized language/i18n management
 * Provides safe access to nested language keys with fallback support
 */
class LanguageController {
  constructor(langData = null) {
    this.langData = langData;
  }

  /**
   * Set language data
   * @param {Object} langData - Language configuration object
   */
  setLanguage(langData) {
    this.langData = langData;
  }

  /**
   * Get language value by dot-notation key
   * @param {string} key - Dot-notation key (e.g., "createBooking.quickDay")
   * @param {string} placeholder - Optional placeholder value (e.g., "1", "2")
   * @returns {string} - Translated value or the key if not found
   *
   * @example
   * // If langData = { createBooking: { quickDay: "Add {day} day" } }
   * languageController.get("createBooking.quickDay", "1") // Returns "Add 1 day"
   * languageController.get("createBooking.missing") // Returns "createBooking.missing" (fallback)
   */
  get(key, placeholder = null) {
    if (!key) return "";

    // Navigate through nested object using dot notation
    const keys = key.split(".");
    let value = this.langData;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key as fallback
        return key;
      }
    }

    // If value is not a string, return the key as fallback
    if (typeof value !== "string") {
      return key;
    }

    return value;
  }

  /**
   * Batch get multiple keys
   * @param {Array<string>} keys - Array of dot-notation keys
   * @returns {Object} - Object with same keys mapping to translated values
   */
  getMultiple(keys) {
    const result = {};
    for (const key of keys) {
      result[key] = this.get(key);
    }
    return result;
  }

  /**
   * Check if key exists in language data
   * @param {string} key - Dot-notation key
   * @returns {boolean}
   */
  has(key) {
    if (!key) return false;

    const keys = key.split(".");
    let value = this.langData;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return true;
  }
}

// Create singleton instance
export const languageController = new LanguageController();

// Export class for creating additional instances if needed
export default LanguageController;

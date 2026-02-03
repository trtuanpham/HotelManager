import { DEFAULT_CHECK_IN_HOUR, DEFAULT_CHECK_IN_MINUTE, DEFAULT_CHECK_OUT_HOUR, DEFAULT_CHECK_OUT_MINUTE } from "../data/constants";

/**
 * Calculate number of hours with rounding rules
 * Rule: If remaining time > 30 minutes, count as 1 additional hour
 * @param {Date} checkIn - Check-in date/time
 * @param {Date} checkOut - Check-out date/time
 * @returns {number} Number of hours (rounded)
 */
export const calculateBookingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const timeDiff = checkOut - checkIn;
  const totalHours = timeDiff / (1000 * 60 * 60);

  // Round to nearest hour: > 30 minutes rounds up, <= 30 minutes rounds down
  return Math.round(totalHours);
};

/**
 * Calculate number of days (nights) between check-in and check-out
 * Rule: If check-out time is after 13:00 (1 PM), count as 1 additional day
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {number} Number of days (full 24-hour periods + partial days after 13:00)
 */
export const calculateBookingDays = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const timeDiff = checkOut - checkIn;

  // Calculate full 24-hour periods
  const fullDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  console.log("Full days:", fullDays);
  // Get remaining time after full days
  const totalHours = calculateBookingHours(checkIn, checkOut);
  if (fullDays <= 0) {
    console.log("Total hours for exact days:", totalHours);
    if (totalHours >= 4 && totalHours < 12) {
      return 1;
    }
  }

  // Get checkout hour
  const checkOutMinute = checkOut.getMinutes();
  const checkOutHour = checkOutMinute < 30 ? checkOut.getHours() : checkOut.getHours() + 1;
  console.log("Check-out time:", checkOutHour + ":" + checkOutMinute);

  // If there's remaining time and checkout is after 13:00, add 1 day
  if (checkOutHour >= 13 && totalHours > 4) {
    return fullDays + 1;
  }

  // If no remaining time (exactly N full days), return those days, minimum 1
  return fullDays;
};

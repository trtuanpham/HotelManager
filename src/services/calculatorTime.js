import { DEFAULT_CHECK_IN_HOUR, DEFAULT_CHECK_IN_MINUTE, DEFAULT_CHECK_OUT_HOUR, DEFAULT_CHECK_OUT_MINUTE } from "../data/constants";

/**
 * Calculate number of hours with rounding rules
 * < 30 minutes: no charge, >= 30 minutes: charge as 1 additional hour
 * @param {Date} checkIn - Check-in date/time
 * @param {Date} checkOut - Check-out date/time
 * @returns {number} Number of hours (rounded)
 */
export const calculateBookingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const timeDiff = checkOut - checkIn;
  console.log("Time difference in ms:", checkIn, checkOut, timeDiff);
  const totalHours = timeDiff / (1000 * 60 * 60);

  // Round hours according to rules
  const roundedHours = Math.ceil(totalHours);
  return roundedHours;
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

  // Get remaining time after full days
  const remainingMs = timeDiff % (1000 * 60 * 60 * 24);

  // Get checkout hour
  const checkOutHour = checkOut.getHours();

  // If there's remaining time and checkout is after 13:00, add 1 day
  if (remainingMs > 0 && checkOutHour >= 13) {
    return fullDays + 1;
  }

  // If there's remaining time but checkout is before 13:00, just return full days
  if (remainingMs > 0) {
    return fullDays;
  }

  // If no remaining time (exactly N full days), return those days, minimum 1
  return fullDays > 0 ? fullDays : 1;
};

/**
 * Get default check-in time for today
 * @returns {Date} Check-in Date object with default time
 */
export const getDefaultCheckInTime = () => {
  const checkInDate = new Date();
  checkInDate.setHours(DEFAULT_CHECK_IN_HOUR, DEFAULT_CHECK_IN_MINUTE, 0, 0);
  return checkInDate;
};

/**
 * Get default check-out time for next day
 * @returns {Date} Check-out Date object (next day at default time)
 */
export const getDefaultCheckOutTime = () => {
  const checkOutDate = new Date();
  checkOutDate.setDate(checkOutDate.getDate() + 1);
  checkOutDate.setHours(DEFAULT_CHECK_OUT_HOUR, DEFAULT_CHECK_OUT_MINUTE, 0, 0);
  return checkOutDate;
};

/**
 * Calculate total price based on duration and rate
 * @param {number} duration - Number of hours or nights
 * @param {number} ratePerUnit - Price per hour or per night
 * @returns {number} Total price
 */
export const calculateTotalPrice = (duration, ratePerUnit) => {
  if (!duration || !ratePerUnit) return 0;
  return duration * ratePerUnit;
};

export const ROOM_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
  CLEANING: "Cleaning",
};

export const ROOM_TYPES = {
  SINGLE: "Single",
  DOUBLE: "Double",
  SUITE: "Suite",
};

export const BOOKING_STATUS = {
  PENDING: "Pending",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
};

export const BOOKING_TYPES = {
  HOURLY: "hourly",
  DAILY: "daily",
};

export const NATIONALITIES = [
  { code: "VN", name: "Việt Nam" },
  { code: "CN", name: "Trung Quốc" },
  { code: "TH", name: "Thái Lan" },
  { code: "KR", name: "Hàn Quốc" },
  { code: "JP", name: "Nhật Bản" },
  { code: "US", name: "Mỹ" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Úc" },
  { code: "OTHER", name: "Khác" },
];

// Booking defaults
export const DEFAULT_CHECK_IN_HOUR = 12;
export const DEFAULT_CHECK_IN_MINUTE = 0;
export const DEFAULT_CHECK_OUT_HOUR = 12;
export const DEFAULT_CHECK_OUT_MINUTE = 0;

// Default avatar SVG
export const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%239ca3af'/%3E%3Ccircle cx='100' cy='60' r='36' fill='%23ffffff'/%3E%3Cpath d='M30 170 Q100 110 170 170 Z' fill='%23ffffff'/%3E%3C/svg%3E";

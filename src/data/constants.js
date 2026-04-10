export const ROOM_STATUS = {
  AVAILABLE: "Available",
  BOOKING: "Booking",
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

// Booking Event Types and Icons
export const BOOKING_EVENT_TYPES = {
  BOOKING_CREATED: "booking_created",
  BOOKING_COMPLETED: "booking_completed",
  CHECKIN: "checkin",
  CHECKOUT: "checkout",
  PAYMENT: "payment",
  SERVICE_USED: "service_used",
};

export const BOOKING_EVENT_ICONS = {
  booking_created: "icon-add.svg",
  booking_completed: "icon-add.svg",
  checkin: "icon-checkin.svg",
  checkout: "icon-checkout.svg",
  payment: "icon-payment.svg",
  service_used: "icon-service-used.svg",
};

// Booking Event Marker Colors (background and border)
export const BOOKING_EVENT_COLORS = {
  booking_created: "#667eea",
  booking_completed: "#059669",
  checkin: "#f59e0b",
  checkout: "#ef4444",
  payment: "#22c55e",
  service_used: "#a855f7",
};

export const ROOMS_STATUS_COLORS = {
  Available: "#667eea",
  Booking: "#10b981",
  Maintenance: "#ef4444",
  Cleaning: "#f59e0b",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  TRANSFER: "transfer",
  CARD: "card",
};

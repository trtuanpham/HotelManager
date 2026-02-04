import { hotelStore } from "../stores/hotelStore";

// Giả lập API delay
const API_DELAY = 500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Add prepayment
export const addPrepayment = async (prepaymentData) => {
  await delay(API_DELAY);

  try {
    const newPrepayment = hotelStore.addPrepayment(prepaymentData);
    return {
      success: true,
      data: newPrepayment,
      message: "Thêm trả tiền trước thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Thêm trả tiền trước thất bại: " + error.message,
    };
  }
};

// Get prepayments by booking ID
export const getPrepaymentsByBookingId = async (bookingId) => {
  await delay(API_DELAY);

  try {
    const prepayments = hotelStore.getPrepaymentsByBookingId(bookingId);
    return {
      success: true,
      data: prepayments,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lấy danh sách trả tiền trước thất bại: " + error.message,
    };
  }
};

// Get total prepaid by booking ID
export const getTotalPrepaidByBookingId = async (bookingId) => {
  await delay(API_DELAY);

  try {
    const total = hotelStore.getTotalPrepaidByBookingId(bookingId);
    return {
      success: true,
      data: total,
    };
  } catch (error) {
    return {
      success: false,
      message: "Tính tổng trả tiền trước thất bại: " + error.message,
    };
  }
};

// Get prepayment by ID
export const getPrepaymentById = async (prepaymentId) => {
  await delay(API_DELAY);

  try {
    const prepayment = hotelStore.prepayments.find((p) => p.id === prepaymentId);
    if (!prepayment) {
      return {
        success: false,
        message: "Không tìm thấy trả tiền trước",
      };
    }
    return {
      success: true,
      data: prepayment,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lấy thông tin trả tiền trước thất bại: " + error.message,
    };
  }
};

// Update prepayment
export const updatePrepayment = async (prepaymentId, updates) => {
  await delay(API_DELAY);

  try {
    hotelStore.updatePrepayment(prepaymentId, updates);
    const updatedPrepayment = hotelStore.prepayments.find((p) => p.id === prepaymentId);
    return {
      success: true,
      data: updatedPrepayment,
      message: "Cập nhật trả tiền trước thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Cập nhật trả tiền trước thất bại: " + error.message,
    };
  }
};

// Delete prepayment
export const deletePrepayment = async (prepaymentId) => {
  await delay(API_DELAY);

  try {
    hotelStore.deletePrepayment(prepaymentId);
    return {
      success: true,
      message: "Xóa trả tiền trước thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Xóa trả tiền trước thất bại: " + error.message,
    };
  }
};

// Get all prepayments
export const getAllPrepayments = async () => {
  await delay(API_DELAY);

  try {
    return {
      success: true,
      data: hotelStore.prepayments,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lấy danh sách trả tiền trước thất bại: " + error.message,
    };
  }
};

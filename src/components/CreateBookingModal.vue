<template>
  <CreateGuestModal ref="createGuestModalRef" />
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ lang.booking?.createNew || "Tạo đặt phòng mới" }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div
        class="modal-body"
        @click="
          (e) => {
            if (!e.target.closest('.guest-search-box')) showGuestDropdown = false;
          }
        "
      >
        <div class="form-group room-display">
          <label
            >{{ lang.dashboard?.room }}: <strong>{{ formData.roomNumber }}</strong></label
          >
        </div>

        <div v-if="selectedRoom" class="room-info-box">
          <h4>{{ lang.createBooking?.roomInfo }}:</h4>
          <div class="room-info-item">
            <span class="label">{{ lang.createBooking?.roomType }}:</span>
            <span class="value">{{ selectedRoom.type }}</span>
          </div>
          <div class="room-info-item">
            <span class="label">{{ lang.createBooking?.hourlyPrice }}:</span>
            <span class="value">{{ selectedRoom.priceHourly?.toLocaleString("vi-VN") }} VND/giờ</span>
          </div>
          <div class="room-info-item">
            <span class="label">{{ lang.createBooking?.dailyPrice }}:</span>
            <span class="value">{{ selectedRoom.priceDaily?.toLocaleString("vi-VN") }} VND/đêm</span>
          </div>
        </div>

        <div v-else-if="isLoadingRoom" class="room-info-box">
          <div class="dropdown-empty">Đang tải thông tin phòng...</div>
        </div>

        <div class="form-group">
          <div class="guest-header">
            <label>{{ lang.dashboard?.guest }}<span class="required">*</span></label>
            <button type="button" class="btn-new-guest" @click="openCreateGuestModal">+ Tạo mới</button>
          </div>
          <div class="guest-search-box">
            <input
              v-model="guestSearchQuery"
              type="text"
              class="input-field"
              placeholder="Tìm kiếm khách hàng..."
              @input="showGuestDropdown = true"
              @focus="showGuestDropdown = true"
              @blur="() => setTimeout(() => (showGuestDropdown = false), 200)"
              @keydown.esc="showGuestDropdown = false"
            />
            <div v-show="showGuestDropdown" class="guest-dropdown">
              <div v-if="isSearching" class="dropdown-empty">Đang tìm kiếm...</div>
              <div v-else-if="filteredGuests.length === 0" class="dropdown-empty">Không tìm thấy khách hàng</div>
              <div v-for="guest in filteredGuests" :key="guest.id" class="dropdown-item" @click="selectGuest(guest)">
                <div class="dropdown-guest-info">
                  <div class="guest-name">{{ guest.name }}</div>
                  <small class="guest-citizen-id">ID: {{ guest.citizenId }}</small>
                </div>
              </div>
            </div>
            <div v-if="selectedGuestName" class="guest-selected">✓ {{ selectedGuestName }}</div>
          </div>

          <div v-if="selectedGuestName" class="guest-info-details">
            <div class="info-row">
              <div class="info-col">
                <small class="label">Email:</small>
                <small class="value">{{ selectedGuestEmail || "---" }}</small>
              </div>
              <div class="info-col">
                <small class="label">Quốc tịch:</small>
                <small class="value">{{ selectedGuestNationality || "---" }}</small>
              </div>
            </div>
            <div class="info-row">
              <div class="info-col">
                <small class="label">Số điện thoại:</small>
                <small class="value">{{ selectedGuestPhone || "---" }}</small>
              </div>
              <div class="info-col">
                <small class="label">ID công dân:</small>
                <small class="value">{{ selectedGuestCitizenId || "---" }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ lang.createBooking?.checkIn }}<span class="required">*</span></label>
            <input :value="formatDateTimeLocal(formData.checkIn)" @input="(e) => (formData.checkIn = parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
          </div>

          <div class="form-group">
            <label>{{ lang.createBooking?.checkOut }}<span class="required">*</span></label>
            <input :value="formatDateTimeLocal(formData.checkOut)" @input="(e) => (formData.checkOut = parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
          </div>
        </div>

        <div class="quick-duration-buttons">
          <button @click="setQuickDuration(1, 'hour')" class="quick-btn quick-btn-hour">{{ lang.createBooking?.quickHour.replace("{hour}", "1") }}</button>
          <button @click="setQuickDuration(2, 'hour')" class="quick-btn quick-btn-hour">{{ lang.createBooking?.quickHour.replace("{hour}", "2") }}</button>
          <button @click="setQuickDuration(3, 'hour')" class="quick-btn quick-btn-hour">{{ lang.createBooking?.quickHour.replace("{hour}", "3") }}</button>
          <button @click="setQuickDuration(1, 'day')" class="quick-btn quick-btn-day">{{ lang.createBooking?.quickDay.replace("{day}", "1") }}</button>
          <button @click="setQuickDuration(2, 'day')" class="quick-btn quick-btn-day">{{ lang.createBooking?.quickDay.replace("{day}", "2") }}</button>
          <button @click="setQuickDuration(3, 'day')" class="quick-btn quick-btn-day">{{ lang.createBooking?.quickDay.replace("{day}", "3") }}</button>
        </div>

        <div class="form-group">
          <label>{{ lang.createBooking?.bookingType }}<span class="required">*</span></label>
          <select v-model="formData.bookingType" class="input-field">
            <option :value="BOOKING_TYPES.HOURLY">{{ lang.createBooking?.hourly }}</option>
            <option :value="BOOKING_TYPES.DAILY">{{ lang.createBooking?.daily }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ lang.createBooking?.pricePerUnit }} (VND/{{ formData.bookingType === "hourly" ? "giờ" : "đêm" }})</label>
          <input
            :value="formData.pricePerUnit ? formData.pricePerUnit.toLocaleString('vi-VN') : ''"
            @input="(e) => (formData.pricePerUnit = parseInt(e.target.value.replace(/\D/g, '')) || 0)"
            type="text"
            class="input-field"
          />
          <small v-if="formData.bookingType === BOOKING_TYPES.HOURLY && numberOfHours > 0" class="price-info"
            >{{ numberOfHours }} giờ × {{ formData.pricePerUnit?.toLocaleString("vi-VN") }} VND/giờ</small
          >
          <small v-else-if="formData.bookingType === BOOKING_TYPES.DAILY && numberOfNights > 0" class="price-info"
            >{{ numberOfNights }} đêm × {{ formData.pricePerUnit?.toLocaleString("vi-VN") }} VND/đêm</small
          >
        </div>

        <div class="form-group">
          <label>{{ lang.createBooking?.totalPrice }} (VND)</label>
          <input :value="calculatedTotalPrice ? calculatedTotalPrice.toLocaleString('vi-VN') : ''" type="text" class="input-field" disabled />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.confirmDialog?.cancel }}</button>
        <button class="btn btn-primary" @click="submitBooking">{{ lang.createBooking?.createButton }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import { DEFAULT_CHECK_IN_HOUR, DEFAULT_CHECK_IN_MINUTE, DEFAULT_CHECK_OUT_HOUR, DEFAULT_CHECK_OUT_MINUTE, BOOKING_TYPES } from "../data/constants";
import { getDefaultCheckInTime, getDefaultCheckOutTime, calculateBookingHours, calculateBookingDays, calculateTotalPrice } from "../services/calculatorTime";
import { searchGuests, getTopGuests } from "../services/guestService";
import { getRoomByNumber } from "../services/roomService";
import CreateGuestModal from "./CreateGuestModal.vue";

const isVisible = ref(false);
const guestSearchQuery = ref("");
const showGuestDropdown = ref(false);
const filteredGuests = ref([]);
const isSearching = ref(false);
const selectedGuestName = ref("");
const selectedGuestPhone = ref("");
const selectedGuestCitizenId = ref("");
const selectedGuestEmail = ref("");
const selectedGuestNationality = ref("");
const createGuestModalRef = ref(null);
const selectedRoom = ref(null);
const isLoadingRoom = ref(false);
const formData = ref({
  roomNumber: "",
  guestId: "",
  checkIn: null,
  checkOut: null,
  pricePerUnit: 0,
  totalPrice: 0,
  bookingType: BOOKING_TYPES.DAILY,
});

const availableGuests = computed(() => store.guests);

// Watch room number change and fetch room data
watch(
  () => formData.value.roomNumber,
  async (newRoomNumber) => {
    if (!newRoomNumber) {
      selectedRoom.value = null;
      return;
    }

    isLoadingRoom.value = true;
    try {
      const room = await getRoomByNumber(newRoomNumber);
      selectedRoom.value = room;
    } catch (error) {
      console.error("Error loading room:", error);
      selectedRoom.value = null;
    } finally {
      isLoadingRoom.value = false;
    }
  },
);

// watch checkin and checkout to update total price
watch([() => formData.value.checkIn, () => formData.value.checkOut], ([newCheckIn, newCheckOut]) => {
  // if >4 hours, switch to daily book
  const hoursDiff = calculateBookingHours(newCheckIn, newCheckOut);
  if (hoursDiff >= 4 && formData.value.bookingType === BOOKING_TYPES.HOURLY) {
    formData.value.bookingType = BOOKING_TYPES.DAILY;
    if (selectedRoom.value) {
      formData.value.pricePerUnit = selectedRoom.value.priceDaily;
    }
  }

  console.log("Check-in or Check-out changed:", newCheckIn, newCheckOut);

  console.log("Recalculating total price...", numberOfHours.value, numberOfNights.value, calculatedTotalPrice);
});

// Watch booking type change and update price accordingly
watch(
  () => formData.value.bookingType,
  (newType) => {
    if (selectedRoom.value) {
      if (newType === BOOKING_TYPES.HOURLY) {
        formData.value.pricePerUnit = selectedRoom.value.priceHourly;
      } else {
        formData.value.pricePerUnit = selectedRoom.value.priceDaily;
      }
    }
    console.log("Booking type changed to:", newType, "Updated pricePerUnit to:", formData.value.pricePerUnit);
  },
);

const roomPricePerNight = computed(() => {
  const room = store.rooms.find((r) => r.number === formData.value.roomNumber);
  return room?.price || 0;
});

// Watch guest search query and call searchGuests service
watch(guestSearchQuery, async (newQuery) => {
  if (!showGuestDropdown.value) return;

  isSearching.value = true;
  try {
    const results = await searchGuests(newQuery);
    filteredGuests.value = results;
  } catch (error) {
    console.error("Error searching guests:", error);
    filteredGuests.value = [];
  } finally {
    isSearching.value = false;
  }
});

// Load top 10 guests when dropdown opens
watch(showGuestDropdown, async (isOpen) => {
  if (isOpen && filteredGuests.value.length === 0 && !guestSearchQuery.value.trim()) {
    isSearching.value = true;
    try {
      const results = await searchGuests("", 10);
      filteredGuests.value = results;
    } catch (error) {
      console.error("Error loading guests:", error);
      filteredGuests.value = [];
    } finally {
      isSearching.value = false;
    }
  }
});

const numberOfNights = computed(() => {
  return calculateBookingDays(formData.value.checkIn, formData.value.checkOut);
});

const numberOfHours = computed(() => {
  return calculateBookingHours(formData.value.checkIn, formData.value.checkOut);
});

const calculatedTotalPrice = computed(() => {
  if (formData.value.bookingType === BOOKING_TYPES.HOURLY) {
    return calculateTotalPrice(numberOfHours.value, formData.value.pricePerUnit);
  } else {
    return calculateTotalPrice(numberOfNights.value, formData.value.pricePerUnit);
  }
});

const openModal = (roomNumber) => {
  const room = store.rooms.find((r) => r.number === roomNumber);

  const checkInDate = new Date();

  // add 1 day for default check-out
  const checkOutDate = new Date();
  checkOutDate.setDate(checkInDate.getDate() + 1);
  checkOutDate.setHours(DEFAULT_CHECK_IN_HOUR, DEFAULT_CHECK_IN_MINUTE, 0, 0);

  formData.value = {
    roomNumber,
    guestId: "",
    checkIn: checkInDate,
    checkOut: checkOutDate,
    pricePerUnit: room?.priceDaily || 0,
    totalPrice: 0,
    bookingType: BOOKING_TYPES.DAILY,
  };
  guestSearchQuery.value = "";
  showGuestDropdown.value = false;
  filteredGuests.value = [];
  selectedGuestName.value = "";
  selectedGuestPhone.value = "";
  selectedGuestCitizenId.value = "";
  selectedGuestEmail.value = "";
  selectedGuestNationality.value = "";
  isVisible.value = true;

  // Load top 10 guests by default
  loadDefaultGuests();
};

const loadDefaultGuests = async () => {
  isSearching.value = true;
  try {
    const results = await getTopGuests();
    filteredGuests.value = results;
  } catch (error) {
    console.error("Error loading default guests:", error);
    filteredGuests.value = [];
  } finally {
    isSearching.value = false;
  }
};

const closeModal = () => {
  isVisible.value = false;
  formData.value = {
    roomNumber: "",
    guestId: "",
    checkIn: null,
    checkOut: null,
    pricePerUnit: 0,
    totalPrice: 0,
    bookingType: BOOKING_TYPES.DAILY,
  };
  guestSearchQuery.value = "";
  showGuestDropdown.value = false;
  filteredGuests.value = [];
  selectedGuestName.value = "";
  selectedGuestPhone.value = "";
  selectedGuestCitizenId.value = "";
  selectedGuestEmail.value = "";
  selectedGuestNationality.value = "";
};

const selectGuest = (guest) => {
  formData.value.guestId = guest.id;
  selectedGuestName.value = guest.name;
  selectedGuestPhone.value = guest.phone || "";
  selectedGuestCitizenId.value = guest.citizenId || "";
  selectedGuestEmail.value = guest.email || "";
  selectedGuestNationality.value = guest.nationality || "";
  guestSearchQuery.value = guest.name;
  showGuestDropdown.value = false;
};

const openCreateGuestModal = () => {
  if (createGuestModalRef.value) {
    createGuestModalRef.value.openModal(guestSearchQuery.value);
  }
};

const submitBooking = () => {
  const minimumDuration = formData.value.bookingType === BOOKING_TYPES.HOURLY ? numberOfHours.value : numberOfNights.value;
  if (!formData.value.guestId || !formData.value.checkIn || !formData.value.checkOut || minimumDuration <= 0 || !formData.value.pricePerUnit) {
    alert(lang.createBooking?.warning || "Vui lòng điền đầy đủ thông tin");
    return;
  }

  // Convert Date objects to ISO datetime strings
  const checkInStr = formData.value.checkIn.toISOString();
  const checkOutStr = formData.value.checkOut.toISOString();

  store.addBooking({
    guestId: formData.value.guestId,
    roomNumber: formData.value.roomNumber,
    checkIn: checkInStr,
    checkOut: checkOutStr,
    bookingType: formData.value.bookingType,
    pricePerUnit: formData.value.pricePerUnit,
    totalPrice: calculatedTotalPrice.value,
  });

  closeModal();
};

/**
 * Format Date to datetime-local format (YYYY-MM-DDTHH:mm)
 * @param {Date} value - Value to format
 * @returns {string} Formatted datetime-local string
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
 * Parse datetime-local string to Date object
 * @param {string} value - datetime-local string (YYYY-MM-DDTHH:mm)
 * @returns {Date} Parsed Date object
 */
const parseDateTime = (value) => {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");

  const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
  return dateObj;
};

/**
 * Set quick duration for checkout
 * @param {number} value - Duration value
 * @param {string} unit - Duration unit ('hour' or 'day')
 */
const setQuickDuration = (value, unit) => {
  // checkIn is already a Date object
  const checkOutDate = new Date(formData.value.checkIn);

  if (unit === "hour") {
    checkOutDate.setHours(checkOutDate.getHours() + value);
    formData.value.bookingType = BOOKING_TYPES.HOURLY;
  } else if (unit === "day") {
    checkOutDate.setDate(checkOutDate.getDate() + value);
    formData.value.bookingType = BOOKING_TYPES.DAILY;
  }

  // Store as Date object
  formData.value.checkOut = checkOutDate;
};

defineExpose({
  openModal,
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.room-display label {
  margin-bottom: 0;
  font-size: 16px;
}

.room-display strong {
  color: #667eea;
  font-size: 18px;
}

.required {
  color: #ef4444;
}

.input-field,
.input-disabled {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #1988ff;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #ffffff;
  color: #000000;
}

select.input-field {
  background: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
  appearance: none;
  cursor: pointer;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-disabled {
  background: #e8ecf9;
  cursor: not-allowed;
  color: #6b7280;
}

.price-info {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

.room-info-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.room-info-box h4 {
  margin: 0 0 14px 0;
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.room-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
}

.room-info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.room-info-item .label {
  color: #6b7280;
  font-weight: 500;
}

.room-info-item .value {
  color: #667eea;
  font-weight: 600;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.quick-duration-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.quick-btn {
  padding: 6px 12px;
  border: 1px solid #667eea;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 70px;
}

.quick-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.quick-btn-hour {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.quick-btn-hour:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 160, 255, 0.3);
}

.quick-btn-day {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.quick-btn-day:hover {
  background: #10b981;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.guest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.guest-header label {
  margin: 0;
}

.btn-new-guest {
  padding: 4px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new-guest:hover {
  background: #059669;
  transform: translateY(-1px);
}

.guest-search-box {
  position: relative;
}

.guest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #1988ff;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: -1px;
}

.dropdown-empty {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.15s;
  font-size: 13px;
  color: #374151;
  background: white;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #667eea;
  color: white;
  font-weight: 500;
}

.guest-selected {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
}

.guest-info-details {
  margin-top: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guest-info-details .label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guest-info-details .value {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.dropdown-guest-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-guest-info .guest-name {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.dropdown-guest-info .guest-citizen-id {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}
</style>

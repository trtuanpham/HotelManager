<template>
  <ModalBase :is-visible="isVisible" modal-id="booking-details-modal" title="Chi tiết đặt phòng" @close="closeModal">
    <div class="modal-body">
      <div v-if="booking" class="booking-details">
        <!-- Room Info Section -->
        <RoomInfoSection :booking-id="booking.id" />

        <!-- Check-in/Check-out Section -->
        <div class="details-section">
          <h4 class="section-title">Thời gian lưu trú</h4>
          <TimeDurationPicker :time-data="editTimeData" :booking-type="booking.bookingType" @update:time-data="handleTimeDataUpdate" />
        </div>

        <!-- Pricing Section -->
        <div class="details-section">
          <h4 class="section-title">Thông tin giá</h4>
          <div class="pricing-grid">
            <div class="pricing-item">
              <span class="label">Thời gian lưu trú:</span>
              <span class="value">{{ editStayDuration }}</span>
            </div>
            <div class="pricing-item">
              <span class="label">Giá trên đơn vị (VND)<span class="required">*</span></span>
              <div class="price-value-container">
                <div v-if="!isEditingPrice" class="price-display">
                  <span class="value">{{ editPriceData.pricePerUnit?.toLocaleString("vi-VN") || "---" }} VND</span>
                  <button class="edit-price-btn" @click="startEditPrice">Sửa</button>
                </div>
                <div v-else class="price-edit-mode">
                  <input
                    :value="tempPricePerUnit ? tempPricePerUnit.toLocaleString('vi-VN') : ''"
                    @input="(e) => (tempPricePerUnit = parseInt(e.target.value.replace(/\D/g, '')) || 0)"
                    type="text"
                    class="input-field price-input-single"
                    placeholder="0"
                  />
                  <button class="btn-save-price" @click="savePriceChanges">Lưu</button>
                  <button class="btn-cancel-price" @click="cancelEditPrice">Hủy</button>
                </div>
              </div>
            </div>
            <div class="pricing-item">
              <span class="label">Thành tiền:</span>
              <span class="value total-price">{{ editCalculatedTotalPrice?.toLocaleString("vi-VN") || "---" }} VND</span>
            </div>
          </div>
        </div>

        <!-- Prepayment Section -->
        <div class="details-section">
          <div class="prepayment-header-section">
            <h4 class="section-title">Thông tin trả tiền trước</h4>
            <button class="add-btn" @click="submitPrepayment">+ Thêm trả tiền</button>
          </div>

          <div class="prepayment-summary">
            <div class="summary-item">
              <span class="summary-label">Tổng tiền trả trước:</span>
              <span class="summary-value">{{ totalPrepaid?.toLocaleString("vi-VN") || "0" }} VND</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Còn lại:</span>
              <span class="summary-value remaining">{{ (booking.totalPrice - totalPrepaid)?.toLocaleString("vi-VN") || "0" }} VND</span>
            </div>
          </div>

          <div v-if="bookingPrepayments.length > 0" class="prepayment-list">
            <div class="prepayment-list-header">Danh sách trả tiền trước</div>
            <div class="prepayment-items">
              <div v-for="prepayment in bookingPrepayments" :key="prepayment.id" class="prepayment-item">
                <div class="prepayment-date">{{ formatPrepaymentDate(prepayment.paymentDate) }}</div>
                <div class="prepayment-info">
                  <div class="prepayment-description">{{ prepayment.description }}</div>
                  <div class="prepayment-method">{{ prepayment.paymentMethod }}</div>
                </div>
                <div class="prepayment-amount">{{ prepayment.amount?.toLocaleString("vi-VN") || "0" }} VND</div>
                <div :class="`prepayment-status status-${prepayment.status?.toLowerCase()}`">{{ prepayment.status }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-message">Chưa có trả tiền trước</div>
        </div>

        <!-- Guest Info Section -->
        <div class="details-section">
          <div class="accompanied-header">
            <h4 class="section-title">Thông tin khách hàng</h4>
            <div class="guest-search-box">
              <input
                v-model="guestSearchQuery"
                type="text"
                class="guest-search-input"
                placeholder="Thêm khách..."
                @input="handleGuestSearchInput(guestSearchQuery)"
                @focus="handleGuestSearchFocus"
                @blur="handleGuestSearchBlur"
                @keydown.esc="showGuestDropdown = false"
              />
              <div v-show="showGuestDropdown" class="guest-dropdown">
                <div v-if="filteredGuests.length === 0" class="dropdown-empty">Không tìm thấy khách hàng</div>
                <div v-for="guest in filteredGuests" :key="guest.id" class="dropdown-item" @click="addGuest(guest)">
                  <div class="dropdown-guest-info">
                    <div class="guest-name">{{ guest.name }}</div>
                    <small class="guest-citizen-id">ID: {{ guest.citizenId }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="guests-grid">
            <!-- Main Guest Card -->
            <div v-if="mainGuest" class="guest-card main-guest">
              <div class="guest-badge">khách chính</div>
              <div class="guest-card-avatar">
                <img :src="mainGuestAvatarUrl" alt="Guest" class="guest-card-img" />
              </div>
              <div class="guest-card-info">
                <div class="guest-card-name">{{ mainGuestName }}</div>
                <small class="guest-card-detail">ID: {{ mainGuest?.citizenId || "---" }}</small>
                <!-- <small class="guest-card-detail">{{ mainGuest?.phone || "---" }}</small>
                  <small class="guest-card-detail">{{ mainGuest?.email || "---" }}</small> -->
              </div>
            </div>

            <!-- Accompanying Guest Cards -->
            <div v-for="guest in accompaniedGuests" :key="guest.id" class="guest-card">
              <div class="guest-card-avatar">
                <img :src="getGuestAvatar(guest)" alt="Guest" class="guest-card-img" />
              </div>
              <div class="guest-card-info">
                <div class="guest-card-name">{{ guest.name }}</div>
                <small class="guest-card-detail">ID: {{ guest.citizenId || "---" }}</small>
                <!-- <small class="guest-card-detail">{{ guest.phone || "---" }}</small> -->
              </div>
              <button type="button" class="remove-btn" @click="removeGuest(guest.id)">×</button>
            </div>
          </div>

          <div v-if="accompaniedGuests.length === 0" class="empty-message">Chưa có khách đi cùng</div>
        </div>

        <!-- Status Section -->
        <div class="details-section">
          <h4 class="section-title">Trạng thái</h4>
          <div class="status-display">
            <span :class="`status-badge ${booking.status?.toLowerCase()}`">{{ booking.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="closeModal">Đóng</button>
      </div>
    </template>
  </ModalBase>

  <AddPrepaymentModal ref="addPrepaymentModal" />
</template>

<script setup>
import { ref, computed } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { DEFAULT_AVATAR_SVG } from "../data/constants";
import { addAccompanyingGuest, removeAccompanyingGuest } from "../services/bookingService";
import ModalBase from "./ModalBase.vue";
import AddPrepaymentModal from "./AddPrepaymentModal.vue";
import TimeDurationPicker from "./TimeDurationPicker.vue";
import RoomInfoSection from "./RoomInfoSection.vue";

const isVisible = ref(false);
const booking = ref(null);
const guestSearchQuery = ref("");
const showGuestDropdown = ref(false);
const filteredGuests = ref([]);
const editTimeData = ref({
  checkIn: null,
  checkOut: null,
});
const editPriceData = ref({
  pricePerUnit: 0,
});
const isEditingPrice = ref(false);
const tempPricePerUnit = ref(0);
const addPrepaymentModal = ref(null);

const mainGuest = computed(() => {
  if (!booking.value) return null;
  return store.guests.find((g) => g.id === booking.value.guestId);
});

const mainGuestName = computed(() => mainGuest.value?.name || "---");

const mainGuestAvatarUrl = computed(() => {
  return mainGuest.value?.imageUrl || DEFAULT_AVATAR_SVG;
});

const selectedRoom = computed(() => {
  if (!booking.value) return null;
  return store.rooms.find((r) => r.number === booking.value.roomNumber);
});

const accompaniedGuests = computed(() => {
  if (!booking.value || !booking.value.accompaniedGuestIds) return [];
  return booking.value.accompaniedGuestIds.map((guestId) => store.guests.find((g) => g.id === guestId)).filter((guest) => guest !== undefined);
});

const availableGuests = computed(() => {
  return store.guests.filter((g) => g.id !== booking.value?.guestId && !booking.value?.accompaniedGuestIds.includes(g.id));
});

const bookingPrepayments = computed(() => {
  if (!booking.value) return [];
  return store.getPrepaymentsByBookingId(booking.value.id);
});

const totalPrepaid = computed(() => {
  if (!booking.value) return 0;
  return store.getTotalPrepaidByBookingId(booking.value.id);
});

const stayDuration = computed(() => {
  if (!booking.value) return "---";
  const checkIn = new Date(booking.value.checkIn);
  const checkOut = new Date(booking.value.checkOut);
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} ngày ${remainingHours} giờ`;
  } else {
    return `${diffHours} giờ`;
  }
});

const editStayDuration = computed(() => {
  if (!editTimeData.value.checkIn || !editTimeData.value.checkOut) return "---";
  const checkIn = new Date(editTimeData.value.checkIn);
  const checkOut = new Date(editTimeData.value.checkOut);
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} ngày ${remainingHours} giờ`;
  } else {
    return `${diffHours} giờ`;
  }
});

const calculateStayUnits = () => {
  if (!editTimeData.value.checkIn || !editTimeData.value.checkOut) return 0;
  const checkIn = new Date(editTimeData.value.checkIn);
  const checkOut = new Date(editTimeData.value.checkOut);
  const diffMs = checkOut - checkIn;

  if (booking.value?.bookingType === "hourly") {
    return Math.ceil(diffMs / (1000 * 60 * 60));
  } else {
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
};

const editCalculatedTotalPrice = computed(() => {
  const units = calculateStayUnits();
  return units * (editPriceData.value.pricePerUnit || 0);
});

const openModal = (bookingData) => {
  booking.value = bookingData;
  editTimeData.value = {
    checkIn: new Date(bookingData.checkIn),
    checkOut: new Date(bookingData.checkOut),
  };
  editPriceData.value = {
    pricePerUnit: bookingData.pricePerUnit || 0,
  };
  isVisible.value = true;
  guestSearchQuery.value = "";
  showGuestDropdown.value = false;
  filteredGuests.value = [];
};

const closeModal = () => {
  isVisible.value = false;
  booking.value = null;
  saveTimeChanges();
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrepaymentDate = (dateStr) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGuestAvatar = (guest) => {
  return guest?.imageUrl || DEFAULT_AVATAR_SVG;
};

const handleGuestSearchInput = (query) => {
  if (!query) {
    filteredGuests.value = availableGuests.value;
  } else {
    filteredGuests.value = availableGuests.value.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()) || g.citizenId.includes(query));
  }
};

const handleGuestSearchFocus = () => {
  showGuestDropdown.value = true;
  handleGuestSearchInput(guestSearchQuery.value);
};

const handleGuestSearchBlur = () => {
  setTimeout(() => {
    showGuestDropdown.value = false;
  }, 200);
};

const addGuest = (guest) => {
  if (!booking.value) return;
  const result = addAccompanyingGuest(booking.value.id, guest.id);
  if (result.success) {
    guestSearchQuery.value = "";
    showGuestDropdown.value = false;
    filteredGuests.value = [];
  } else {
    alert(result.error);
  }
};

const removeGuest = (guestId) => {
  if (!booking.value) return;
  const result = removeAccompanyingGuest(booking.value.id, guestId);
  if (!result.success) {
    alert(result.error);
  }
};

const startEditTime = () => {
  editTimeData.value = {
    checkIn: new Date(booking.value.checkIn),
    checkOut: new Date(booking.value.checkOut),
  };
};

const cancelEditTime = () => {
  editTimeData.value = { checkIn: null, checkOut: null };
};

const saveTimeChanges = () => {
  if (!booking.value || !editTimeData.value.checkIn || !editTimeData.value.checkOut) {
    return;
  }

  const checkInStr = editTimeData.value.checkIn.toISOString();
  const checkOutStr = editTimeData.value.checkOut.toISOString();

  booking.value.checkIn = checkInStr;
  booking.value.checkOut = checkOutStr;
  booking.value.pricePerUnit = editPriceData.value.pricePerUnit;
  booking.value.totalPrice = editCalculatedTotalPrice.value;
};

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

const parseDateTime = (value) => {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");

  const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
  return dateObj;
};

const setEditQuickDuration = (value, unit) => {
  const checkOutDate = new Date(editTimeData.value.checkIn);

  if (unit === "hour") {
    checkOutDate.setHours(checkOutDate.getHours() + value);
  } else if (unit === "day") {
    checkOutDate.setDate(checkOutDate.getDate() + value);
  }

  editTimeData.value.checkOut = checkOutDate;
};

const handleTimeDataUpdate = (newTimeData) => {
  editTimeData.value = { ...newTimeData };
};

const submitPrepayment = () => {
  if (addPrepaymentModal.value) {
    addPrepaymentModal.value.openModal(booking.value.id);
  }
};

const startEditPrice = () => {
  tempPricePerUnit.value = editPriceData.value.pricePerUnit;
  isEditingPrice.value = true;
};

const savePriceChanges = () => {
  if (tempPricePerUnit.value >= 0) {
    editPriceData.value.pricePerUnit = tempPricePerUnit.value;
    isEditingPrice.value = false;
  }
};

const cancelEditPrice = () => {
  isEditingPrice.value = false;
  tempPricePerUnit.value = 0;
};

const cancelAddPrepayment = () => {
  // Not needed anymore as modal handles its own state
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
.modal-body {
  padding: 20px;
}

.booking-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .booking-details {
    grid-template-columns: repeat(2, 1fr);
  }

  .details-section:nth-child(4),
  .details-section:nth-child(3) {
    grid-column: 1;
  }
}

.details-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-grid.small-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.info-item .value.total-price {
  font-size: 16px;
  color: #667eea;
  font-weight: 700;
}

.accompanied-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.section-title {
  white-space: nowrap;
}

.guest-search-box {
  position: relative;
  flex: 1;
  max-width: 250px;
}

.guest-search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.guest-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.guest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #1988ff;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: -1px;
}

.dropdown-empty {
  padding: 8px 10px;
  text-align: center;
  color: #9ca3af;
  font-size: 11px;
}

.dropdown-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.15s;
  font-size: 12px;
  color: #374151;
  background: white;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #667eea;
  color: white;
}

.dropdown-guest-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-guest-info .guest-name {
  font-size: 12px;
  font-weight: 500;
}

.dropdown-guest-info .guest-citizen-id {
  font-size: 10px;
  opacity: 0.8;
}

.accompanied-guests-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.guests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.guest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
  position: relative;
}

.guest-card.main-guest {
  border: 2px solid #667eea;
  background: #f9fafb;
}

.guest-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #667eea;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.guest-card-avatar {
  display: flex;
  justify-content: center;
}

.guest-card-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
}

.guest-card-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.guest-card-detail {
  font-size: 11px;
  color: #6b7280;
  display: block;
  line-height: 1.4;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.empty-message {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 6px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}

.edit-price-btn {
  padding: 4px 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.edit-price-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.price-display {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.price-edit-mode {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.price-format {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  white-space: nowrap;
}

.price-input-single {
  flex: 1;
  max-width: 180px;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  background: #ffffff;
  color: #000000;
  font-weight: 500;
}

.price-input-single:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.price-edit-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}

.btn-save-price,
.btn-cancel-price {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save-price {
  background: #10b981;
  color: white;
}

.btn-save-price:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-cancel-price {
  background: #ef4444;
  color: white;
}

.btn-cancel-price:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.checkedin {
  background: #bfdbfe;
  color: #1e40af;
}

.status-badge.checked-out {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.edit-time-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 12px;
}

.required {
  color: #ef4444;
}

.input-field {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #ffffff;
  color: #000000;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.price-input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  background: #ffffff;
  color: #000000;
}

.price-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.edit-time-info {
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #667eea;
  font-size: 12px;
  color: #374151;
}

.edit-time-info strong {
  color: #667eea;
  font-weight: 700;
}

.prepayment-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.prepayment-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.add-btn {
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.summary-value {
  font-size: 14px;
  color: #667eea;
  font-weight: 700;
}

.summary-value.remaining {
  color: #ef4444;
}

.prepayment-list {
  margin-top: 12px;
}

.prepayment-list-header {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.prepayment-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.prepayment-item {
  display: grid;
  grid-template-columns: 120px 1fr 120px 100px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
}

.prepayment-date {
  font-weight: 600;
  color: #374151;
}

.prepayment-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prepayment-description {
  font-weight: 500;
  color: #374151;
}

.prepayment-method {
  font-size: 11px;
  color: #6b7280;
}

.prepayment-amount {
  font-weight: 700;
  color: #667eea;
  text-align: right;
}

.prepayment-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.prepayment-status.status-completed {
  background: #dcfce7;
  color: #15803d;
}

.prepayment-status.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.pricing-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.pricing-item .label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-item .value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.pricing-item .value.total-price {
  font-size: 14px;
  color: #667eea;
  font-weight: 700;
}

.price-value-container {
  flex: 1;
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

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: white;
}
</style>

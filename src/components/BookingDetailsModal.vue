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
        <PricingSection :edit-time-data="editTimeData" :edit-price-data="editPriceData" :booking-type="booking.bookingType" @update:editPriceData="editPriceData = $event" />

        <!-- Prepayment Section -->
        <PrepaymentSection :booking="booking" :total-prepaid="totalPrepaid" :booking-prepayments="bookingPrepayments" @submit-prepayment="submitPrepayment" />

        <!-- Guest Info Section -->
        <GuestInfoSection
          :main-guest="mainGuest"
          :main-guest-name="mainGuestName"
          :main-guest-avatar-url="mainGuestAvatarUrl"
          :accompanied-guests="accompaniedGuests"
          :available-guests="availableGuests"
          @add-guest="addGuest"
          @remove-guest="removeGuest"
        />

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
import PricingSection from "./PricingSection.vue";
import PrepaymentSection from "./PrepaymentSection.vue";
import GuestInfoSection from "./GuestInfoSection.vue";

const isVisible = ref(false);
const booking = ref(null);
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

const handleGuestSearchBlur = () => {
  setTimeout(() => {
    showGuestDropdown.value = false;
  }, 200);
};

const addGuest = (guest) => {
  if (!booking.value) return;
  const result = addAccompanyingGuest(booking.value.id, guest.id);
  if (!result.success) {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
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

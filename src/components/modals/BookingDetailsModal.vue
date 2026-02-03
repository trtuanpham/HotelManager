<template>
  <ModalBase :is-visible="isVisible" modal-id="booking-details-modal" :title="lang.get('bookings.detailsTitle')" @close="closeModal">
    <div class="modal-body">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ lang.get("common.loading") }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>⚠️ {{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="booking" class="booking-details">
        <!-- Room Info Section -->
        <RoomInfoSection :booking-id="booking.id" />

        <!-- Check-in/Check-out Section -->
        <div class="details-section">
          <h4 class="section-title">{{ lang.get("booking.stayDuration") }}</h4>
          <TimeDurationPicker :check-in="new Date(booking.checkIn)" :check-out="new Date(booking.checkOut)" :booking-type="booking.bookingType" @update:time="handleTimeUpdate" />
        </div>

        <!-- Pricing Section -->
        <PricingSection :booking="booking" @update:pricePerUnit="handlePriceUpdate" />

        <!-- Prepayment Section -->
        <PrepaymentSection :booking="booking" @submit-prepayment="submitPrepayment" />

        <!-- Guest Info Section -->
        <GuestInfoSection :booking="booking" />

        <!-- Booking Timeline Section -->
        <div class="details-section">
          <h4 class="section-title">{{ lang.get("bookings.timeline") }}</h4>
          <BookingTimelineSection :booking="booking" />
        </div>

        <!-- Status Section -->
        <div class="details-section">
          <h4 class="section-title">{{ lang.get("common.status") }}</h4>
          <div class="status-display">
            <span :class="`status-badge ${booking.status?.toLowerCase()}`">{{ booking.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.close") }}</button>
        <button v-if="!isLoading" class="btn btn-primary" :disabled="!hasChanges" @click="saveChanges">{{ lang.get("common.saveChanges") }}</button>
      </div>
    </template>
  </ModalBase>

  <AddPrepaymentModal ref="addPrepaymentModal" />
</template>

<script setup>
import { ref, computed } from "vue";
import { hotelStore as store } from "../../stores/hotelStore";
import { languageController as lang } from "../../controller/languageController";
import { BOOKING_TYPES } from "../../data/constants";
import { getBookingById, updateBooking } from "../../services/bookingService";
import ModalBase from "./ModalBase.vue";
import AddPrepaymentModal from "./AddPrepaymentModal.vue";
import TimeDurationPicker from "./booking-details/TimeDurationPicker.vue";
import RoomInfoSection from "./booking-details/RoomInfoSection.vue";
import PricingSection from "./booking-details/PricingSection.vue";
import PrepaymentSection from "./booking-details/PrepaymentSection.vue";
import GuestInfoSection from "./booking-details/GuestInfoSection.vue";
import BookingTimelineSection from "./booking-details/BookingTimelineSection.vue";

const isVisible = ref(false);
const isLoading = ref(false);
const error = ref(null);
const booking = ref(null);

const changedData = ref({
  checkIn: false, //
  checkOut: false,
  totalDuration: false,
  pricePerUnit: false,
});

const addPrepaymentModal = ref(null);

const hasChanges = computed(() => {
  if (changedData.value.checkIn) return true;
  if (changedData.value.checkOut) return true;
  if (changedData.value.pricePerUnit) return true;
  if (changedData.value.totalDuration) return true;
  return false;
});

const openModal = async (bookingId) => {
  isVisible.value = true;
  isLoading.value = true;
  error.value = null;

  try {
    const bookingData = await getBookingById(bookingId);
    if (!bookingData) {
      throw new Error(lang.get("bookings.notFound"));
    }

    booking.value = bookingData;
  } catch (err) {
    error.value = err.message || lang.get("bookings.loadError");
    booking.value = null;
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  isVisible.value = false;
  booking.value = null;
  error.value = null;
};

const saveChanges = async () => {
  if (!booking.value) return;

  isLoading.value = true;
  try {
    // Call API to update booking
    await updateBooking(booking.value.id, {
      checkIn: booking.value.checkIn,
      checkOut: booking.value.checkOut,
      pricePerUnit: booking.value.pricePerUnit,
    });

    alert(lang.get("common.saveSuccess"));
  } catch (err) {
    alert(lang.get("common.saveError") + err.message);
  } finally {
    isLoading.value = false;
  }
};

const handleTimeUpdate = (timeData) => {
  if (!timeData || !timeData.checkIn || !timeData.checkOut) {
    console.warn("Invalid time data:", timeData);
    return;
  }

  booking.value.checkIn = timeData.checkIn.toISOString();
  booking.value.checkOut = timeData.checkOut.toISOString();
  console.log("Time updated:", timeData);
  booking.value.bookingType = timeData.bookingType;
  if (timeData.bookingType === BOOKING_TYPES.HOURLY) {
    booking.value.totalHourDuration = timeData.totalHour;
    booking.value.totalDayDuration = 0;
  } else {
    booking.value.totalDayDuration = timeData.totalDay;
    booking.value.totalHourDuration = 0;
  }

  changedData.value.checkIn = true;
  changedData.value.checkOut = true;
  changedData.value.totalDuration = true;
};

const handlePriceUpdate = (pricePerUnit) => {
  booking.value.pricePerUnit = pricePerUnit;
  changedData.value.pricePerUnit = true;
};

const submitPrepayment = () => {
  if (addPrepaymentModal.value) {
    addPrepaymentModal.value.openModal(booking.value.id);
  }
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

.loading-state,
.error-state {
  padding: 40px 20px;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  background: #fee2e2;
  border-radius: 6px;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.booking-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  grid-auto-rows: auto;
  align-content: start;
}

@media (min-width: 768px) {
  .booking-details {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
    justify-items: stretch;
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
  display: inline-block;
  line-height: 1;
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

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: white;
}
</style>

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
          <TimeDurationPicker :check-in="editTimeData.checkIn" :check-out="editTimeData.checkOut" :booking-type="booking.bookingType" @update:time="handleTimeUpdate" />
        </div>

        <!-- Pricing Section -->
        <PricingSection :booking="booking" @update:pricePerUnit="editPriceData.pricePerUnit = $event" />

        <!-- Prepayment Section -->
        <PrepaymentSection :booking="booking" @submit-prepayment="submitPrepayment" />

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
        <button class="btn btn-primary" :disabled="!hasChanges" @click="saveChanges">{{ lang.get("common.saveChanges") }}</button>
      </div>
    </template>
  </ModalBase>

  <AddPrepaymentModal ref="addPrepaymentModal" />
</template>

<script setup>
import { ref, computed } from "vue";
import { hotelStore as store } from "../../stores/hotelStore";
import { languageController as lang } from "../../controller/languageController";
import { DEFAULT_AVATAR_SVG } from "../../data/constants";
import { getBookingById } from "../../services/bookingService";
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
const originalBooking = ref(null);
const editTimeData = ref({
  checkIn: null,
  checkOut: null,
});
const editPriceData = ref({
  pricePerUnit: 0,
});
const addPrepaymentModal = ref(null);

const mainGuest = computed(() => {
  if (!booking.value) return null;
  const mainGuestId = booking.value.guestIds?.[0];
  return store.guests.find((g) => g.id === mainGuestId);
});

const mainGuestName = computed(() => mainGuest.value?.name || "---");

const mainGuestAvatarUrl = computed(() => {
  return mainGuest.value?.imageUrl || DEFAULT_AVATAR_SVG;
});

const accompaniedGuests = computed(() => {
  if (!booking.value || !booking.value.guestIds || booking.value.guestIds.length <= 1) return [];
  const mainGuestId = booking.value.guestIds[0];
  return booking.value.guestIds
    .slice(1)
    .map((guestId) => store.guests.find((g) => g.id === guestId))
    .filter((guest) => guest !== undefined);
});

const availableGuests = computed(() => {
  if (!booking.value) return store.guests;
  return store.guests.filter((g) => !booking.value.guestIds.includes(g.id));
});

const hasChanges = computed(() => {
  if (!booking.value || !originalBooking.value) return false;
  const checkInChanged = editTimeData.value.checkIn.toISOString() !== originalBooking.value.checkIn;
  const checkOutChanged = editTimeData.value.checkOut.toISOString() !== originalBooking.value.checkOut;
  const priceChanged = editPriceData.value.pricePerUnit !== originalBooking.value.pricePerUnit;
  return checkInChanged || checkOutChanged || priceChanged;
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
    originalBooking.value = { ...bookingData };
    editTimeData.value = {
      checkIn: new Date(bookingData.checkIn),
      checkOut: new Date(bookingData.checkOut),
    };
    editPriceData.value = {
      pricePerUnit: bookingData.pricePerUnit || 0,
    };
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
  originalBooking.value = null;
  error.value = null;
};

const saveChanges = () => {
  if (!booking.value) return;

  try {
    const checkInStr = editTimeData.value.checkIn.toISOString();
    const checkOutStr = editTimeData.value.checkOut.toISOString();

    booking.value.checkIn = checkInStr;
    booking.value.checkOut = checkOutStr;
    booking.value.pricePerUnit = editPriceData.value.pricePerUnit;

    // Update the booking in the store
    store.updateBooking(booking.value.id, {
      checkIn: checkInStr,
      checkOut: checkOutStr,
      pricePerUnit: editPriceData.value.pricePerUnit,
    });

    // Update original booking for change detection
    originalBooking.value = { ...booking.value };

    alert(lang.get("common.saveSuccess"));
  } catch (err) {
    alert(lang.get("common.saveError") + err.message);
  }
};

const addGuest = (guest) => {
  if (!booking.value) return;
  if (!booking.value.guestIds.includes(guest.id)) {
    booking.value.guestIds.push(guest.id);
  }
};

const removeGuest = (guestId) => {
  if (!booking.value) return;
  const index = booking.value.guestIds.indexOf(guestId);
  if (index > -1) {
    booking.value.guestIds.splice(index, 1);
  }
};

const handleTimeUpdate = (timeData) => {
  editTimeData.value = {
    checkIn: timeData.checkIn,
    checkOut: timeData.checkOut,
  };
  booking.value.checkIn = timeData.checkIn.toISOString();
  booking.value.checkOut = timeData.checkOut.toISOString();
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

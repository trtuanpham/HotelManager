<template>
  <ModalBase :is-visible="isVisible" modal-id="booking-details-modal" @close="closeModal">
    <template #title>
      <h3>{{ lang.get("bookings.detailsTitle") }}</h3>
    </template>
    <template #content>
      <template v-if="isLoading">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ lang.get("common.loading") }}</p>
        </div>
      </template>

      <template v-else-if="error">
        <div class="error-state">
          <p>⚠️ {{ error }}</p>
        </div>
      </template>

      <template v-else-if="booking">
        <div class="booking-details">
          <!-- Room Info Section -->
          <RoomInfoSection :room-number="booking.roomNumber" />

          <!-- Guest Info Section -->
          <GuestInfoSection :guest-ids="booking.guestIds" @update-guests="handleGuestUpdate" />

          <!-- Check-in/Check-out Section -->
          <div class="details-section">
            <h4 class="section-title">{{ lang.get("booking.stayDuration") }}</h4>
            <TimeDurationPicker :check-in="new Date(booking.checkIn)" :check-out="new Date(booking.checkOut)" :booking-type="booking.bookingType" @update:time="handleTimeUpdate" />
          </div>

          <!-- Pricing Section -->
          <PricingSection :booking="booking" @update:pricePerUnit="handlePriceUpdate" />

          <!-- Prepayment Section -->
          <PrepaymentSection :booking="booking" @submit-prepayment="submitPrepayment" />

          <!-- Status Section -->
          <div class="details-section">
            <h4 class="section-title">{{ lang.get("common.status") }}</h4>
            <div class="status-display">
              <span :class="`status-badge ${booking.status?.toLowerCase()}`">{{ booking.status }}</span>
            </div>
          </div>
        </div>

        <!-- Booking Timeline Section (Full Width) -->
        <div class="details-section">
          <h4 class="section-title">{{ lang.get("bookings.timeline") }}</h4>
          <BookingTimelineSection ref="bookingTimelineSection" :booking="booking" />
        </div>
      </template>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.close") }}</button>
      <button v-if="!isLoading" class="btn btn-primary" :disabled="!hasChanges" @click="saveChanges">{{ lang.get("common.saveChanges") }}</button>
    </template>
  </ModalBase>

  <AddPrepaymentModal ref="addPrepaymentModal" @prepayment-added="handlePrepaymentAdded" />
</template>

<script setup>
import { ref, computed } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { BOOKING_TYPES, BOOKING_EVENT_TYPES, PAYMENT_METHODS } from "../../data/constants";
import { getBookingById, updateBooking } from "../../services/bookingService";
import { addPrepayment } from "../../services/prepaymentService";
import { addBookingEvent } from "../../services/bookingEventService";
import { useCurrency } from "../../composables/useCurrency";
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
const bookingTimelineSection = ref(null);

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

const handleGuestUpdate = (guestIds) => {
  booking.value.guestIds = guestIds;
};

const submitPrepayment = () => {
  if (addPrepaymentModal.value) {
    addPrepaymentModal.value.openModal(booking.value.id);
  }
};

const getPaymentMethodLabel = (method) => {
  const methodLabels = {
    [PAYMENT_METHODS.CASH]: "prepayment.cash",
    [PAYMENT_METHODS.TRANSFER]: "prepayment.transfer",
    [PAYMENT_METHODS.CARD]: "prepayment.card",
  };
  return lang.get(methodLabels[method] || "prepayment.selectMethod");
};

const handlePrepaymentAdded = async (prepaymentData) => {
  try {
    const { formatCurrency } = useCurrency();
    const formattedAmount = formatCurrency(prepaymentData.amount);

    // Call API to add prepayment
    const result = await addPrepayment({
      bookingId: booking.value.id,
      amount: prepaymentData.amount,
      paymentDate: prepaymentData.paymentDate,
      paymentMethod: prepaymentData.paymentMethod,
      description: prepaymentData.description,
    });

    if (result.success) {
      // Calculate total prepaid
      booking.value.totalPrepaid += prepaymentData.amount;

      // Create booking event for prepayment
      let description = "";
      if (prepaymentData.description) {
        description += `${lang.get("bookingEvents.paymentDescription")}: ${prepaymentData.description}<br>`;
      }
      if (prepaymentData.paymentMethod) {
        const methodLabel = getPaymentMethodLabel(prepaymentData.paymentMethod);
        description += `${lang.get("bookingEvents.paymentMethod")}: ${methodLabel}<br>`;
      }
      description += `${lang.get("bookingEvents.paymentAmount")}: ${formattedAmount} VND`;

      const eventDataResult = await addBookingEvent(booking.value.id, {
        type: BOOKING_EVENT_TYPES.PAYMENT,
        title: lang.get("bookingEvents.payment"),
        description: description,
        date: new Date(prepaymentData.paymentDate),
      });

      console.log("Booking event created:", eventDataResult);

      // Add event locally to timeline (for immediate display)
      if (bookingTimelineSection.value) {
        bookingTimelineSection.value.addEventLocal(eventDataResult);
      }

      console.log("Prepayment added successfully:", eventDataResult);
      alert(lang.get("common.saveSuccess"));
    } else {
      alert(lang.get("common.error") + ": " + result.message);
    }
  } catch (error) {
    alert(lang.get("common.error") + ": " + error.message);
  }
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
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

.price-input {
  width: 120px;
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
</style>

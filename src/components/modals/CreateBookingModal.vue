<template>
  <CreateGuestModal ref="createGuestModalRef" />
  <BookingDetailsModal ref="bookingDetailsModalRef" />
  <MessageModal ref="messageModalRef" />
  <ModalBase :is-visible="isVisible" modal-id="booking-modal" max-width="570px" @close="closeModal">
    <template #title>
      <h3>{{ lang.get("booking.createTitle") }}</h3>
    </template>

    <template #content>
      <!-- Loading Indicator -->
      <div v-if="isLoadingRoom" class="loading-container">
        <div class="spinner"></div>
        <p>{{ lang.get("common.loading") }}</p>
      </div>

      <!-- Room Info Section -->
      <RoomInfoSection v-if="!isLoadingRoom" :room-number="booking.roomNumber" :room-data="selectedRoom" />

      <!-- Guest Info Section -->
      <GuestInfoSection v-if="!isLoadingRoom" :guest-ids="booking.guestIds" @update-guests="handleGuestUpdate" />

      <!-- Time Duration Picker Section -->
      <div v-if="!isLoadingRoom" class="details-section">
        <h4 class="section-title">{{ lang.get("booking.stayDuration") }}</h4>
        <TimeDurationPicker :check-in="new Date(booking.checkIn)" :check-out="new Date(booking.checkOut)" :booking-type="booking.bookingType" @update:time="handleTimeUpdate" />
      </div>

      <!-- Pricing Section -->
      <PricingSection v-if="!isLoadingRoom" :booking="booking" @update:pricePerUnit="handlePriceUpdate" />
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="submitBooking" :disabled="isLoadingRoom || isSubmitting">
        <span v-if="isSubmitting" class="btn-loading">
          <span class="spinner-small"></span>
          {{ lang.get("common.booking") }}
        </span>
        <span v-else>{{ lang.get("booking.createButton") }}</span>
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { BOOKING_TYPES, BOOKING_EVENT_TYPES } from "../../data/constants";
import { calculateBookingHours, calculateBookingDays } from "../../services/calculatorTime";
import { getRoomByNumber, updateBookingRoom } from "../../services/roomService";
import { createBooking } from "../../services/bookingService";
import { addBookingEvent } from "../../services/bookingEventService";
import ModalBase from "./ModalBase.vue";
import CreateGuestModal from "./CreateGuestModal.vue";
import BookingDetailsModal from "./BookingDetailsModal.vue";
import MessageModal from "./MessageModal.vue";
import RoomInfoSection from "./booking-details/RoomInfoSection.vue";
import GuestInfoSection from "./booking-details/GuestInfoSection.vue";
import TimeDurationPicker from "./booking-details/TimeDurationPicker.vue";
import PricingSection from "./booking-details/PricingSection.vue";

const isVisible = ref(false);
const isLoadingRoom = ref(false);
const isSubmitting = ref(false);
const selectedRoom = ref(null);
const bookingDetailsModalRef = ref(null);
const messageModalRef = ref(null);
const booking = ref({
  roomNumber: "",
  guestIds: [],
  checkIn: null,
  checkOut: null,
  pricePerUnit: 0,
  totalPrice: 0,
  bookingType: BOOKING_TYPES.DAILY,
  totalHourDuration: 0,
  totalDayDuration: 0,
});

const numberOfNights = computed(() => {
  return calculateBookingDays(booking.value.checkIn, booking.value.checkOut);
});

const numberOfHours = computed(() => {
  return calculateBookingHours(booking.value.checkIn, booking.value.checkOut);
});

const calculatedTotalPrice = computed(() => {
  return booking.value.pricePerUnit * numberOfHours.value;
});

const handleGuestUpdate = (guestIds) => {
  booking.value.guestIds = guestIds;
};

const handleTimeUpdate = (timeData) => {
  booking.value.checkIn = timeData.checkIn;
  booking.value.checkOut = timeData.checkOut;
  booking.value.bookingType = timeData.bookingType;
  booking.value.totalHourDuration = timeData.totalHour;
  booking.value.totalDayDuration = timeData.totalDay;
};

const handlePriceUpdate = (pricePerUnit) => {
  booking.value.pricePerUnit = pricePerUnit;
};

const openModal = async (roomNumber) => {
  isVisible.value = true;
  isLoadingRoom.value = true;

  const room = await getRoomByNumber(roomNumber);
  selectedRoom.value = room;
  isLoadingRoom.value = false;

  const checkInDate = new Date();

  // add 1 day for default check-out
  const checkOutDate = new Date();
  checkOutDate.setDate(checkInDate.getDate() + 1);

  booking.value = {
    roomNumber,
    guestIds: [],
    checkIn: checkInDate,
    checkOut: checkOutDate,
    pricePerUnit: room?.priceDaily || 0,
    totalPrice: 0,
    bookingType: BOOKING_TYPES.DAILY,
    totalHourDuration: calculateBookingHours(checkInDate, checkOutDate),
    totalDayDuration: calculateBookingDays(checkInDate, checkOutDate),
    totalPrepaid: 0,
  };
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  booking.value = {
    roomNumber: "",
    guestIds: [],
    checkIn: null,
    checkOut: null,
    pricePerUnit: 0,
    totalPrice: 0,
    bookingType: BOOKING_TYPES.DAILY,
    totalHourDuration: 0,
    totalDayDuration: 0,
    totalPrepaid: 0,
  };
};

const submitBooking = async () => {
  // Validate guest information
  // if (!booking.value.guestIds || booking.value.guestIds.length === 0) {
  //   messageModalRef.value.show({
  //     title: lang.get("common.warning"),
  //     message: lang.get("booking.selectGuest"),
  //     buttonText: lang.get("common.ok"),
  //   });
  //   return;
  // }

  // Validate check-in date
  if (!booking.value.checkIn) {
    messageModalRef.value.show({
      title: lang.get("common.warning"),
      message: lang.get("booking.selectCheckIn"),
      buttonText: lang.get("common.ok"),
    });
    return;
  }

  // Validate check-out date
  if (!booking.value.checkOut) {
    messageModalRef.value.show({
      title: lang.get("common.warning"),
      message: lang.get("booking.selectCheckOut"),
      buttonText: lang.get("common.ok"),
    });
    return;
  }

  // Validate minimum duration
  const minimumDuration = booking.value.bookingType === BOOKING_TYPES.HOURLY ? numberOfHours.value : numberOfNights.value;
  if (minimumDuration <= 0) {
    messageModalRef.value.show({
      title: lang.get("common.warning"),
      message: lang.get("booking.invalidDuration"),
      buttonText: lang.get("common.ok"),
    });
    return;
  }

  // Validate price per unit
  if (!booking.value.pricePerUnit || booking.value.pricePerUnit <= 0) {
    messageModalRef.value.show({
      title: lang.get("common.warning"),
      message: lang.get("booking.selectPrice"),
      buttonText: lang.get("common.ok"),
    });
    return;
  }

  // Convert Date objects to ISO datetime strings
  const checkInStr = booking.value.checkIn.toISOString();
  const checkOutStr = booking.value.checkOut.toISOString();

  isSubmitting.value = true;
  try {
    // Create booking via API

    console.log("Creating booking with data:", booking.value);

    const newBooking = await createBooking(booking.value);

    // Create booking created event
    await addBookingEvent(newBooking.id, {
      type: BOOKING_EVENT_TYPES.BOOKING_CREATED,
      title: lang.get("bookingEvents.bookingCreated"),
      description: lang.get("bookingEvents.bookingCreatedDescription"),
      date: new Date(),
    });

    // Update room status to occupied via API
    if (selectedRoom.value?.id) {
      await updateBookingRoom(selectedRoom.value.id, newBooking.id);
    }

    // Close modal after successful creation
    closeModal();

    // Open booking details modal
    bookingDetailsModalRef.value.openModal(newBooking.id);
  } catch (error) {
    console.error("Error creating booking:", error);
    messageModalRef.value.show({
      title: lang.get("common.error"),
      message: lang.get("booking.createError"),
      buttonText: lang.get("common.ok"),
    });
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({
  openModal,
});
</script>

<style scoped>
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

.details-section {
  margin-bottom: 18px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:disabled:hover {
  transform: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
</style>

<template>
  <div class="details-section">
    <h4 class="section-title">Thông tin phòng</h4>
    <div v-if="isLoading" class="loading-placeholder">
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    </div>
    <div v-else-if="booking" class="info-grid">
      <div class="info-item">
        <span class="label">Phòng:</span>
        <span class="value">{{ booking.roomNumber }}</span>
      </div>
      <div class="info-item">
        <span class="label">Loại phòng:</span>
        <span class="value">{{ selectedRoom?.type || "---" }}</span>
      </div>
      <div class="info-item">
        <span class="label">Giá theo giờ:</span>
        <span class="value">{{ selectedRoom?.priceHourly?.toLocaleString("vi-VN") || "---" }} VND/giờ</span>
      </div>
      <div class="info-item">
        <span class="label">Giá theo đêm:</span>
        <span class="value">{{ selectedRoom?.priceDaily?.toLocaleString("vi-VN") || "---" }} VND/đêm</span>
      </div>
    </div>
    <div v-else class="error-message">Không tìm thấy thông tin phòng</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { getBookingById } from "../services/bookingService";

const props = defineProps({
  bookingId: {
    type: String,
    required: true,
  },
});

const booking = ref(null);
const isLoading = ref(true);

const selectedRoom = computed(() => {
  if (!booking.value) return null;
  return store.rooms.find((r) => r.number === booking.value.roomNumber);
});

// Fetch booking data on component mount using service
onMounted(async () => {
  try {
    const fetchedBooking = await getBookingById(props.bookingId);
    booking.value = fetchedBooking;
  } catch (error) {
    console.error("Error fetching booking data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.details-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
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
  font-weight: 700;
  line-height: 1.4;
}

.loading-placeholder {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .loading-placeholder {
    grid-template-columns: repeat(2, 1fr);
  }
}

.skeleton-item {
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.error-message {
  padding: 12px;
  text-align: center;
  color: #dc2626;
  font-size: 12px;
  background: #fee2e2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}
</style>

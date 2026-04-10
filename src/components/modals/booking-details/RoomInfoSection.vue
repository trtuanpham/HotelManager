<template>
  <div class="details-section">
    <h4 class="section-title">{{ lang.get("booking.roomInfo") }}</h4>
    <div v-if="isLoading" class="loading-placeholder">
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    </div>
    <div v-else-if="selectedRoom" class="info-grid">
      <div class="info-item">
        <span class="label">{{ lang.get("dashboard.rooms") }}:</span>
        <span class="value">{{ roomNumber }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ lang.get("booking.roomType") }}:</span>
        <span class="value">{{ selectedRoom?.type || "---" }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ lang.get("booking.hourlyPrice") }}:</span>
        <span class="value">{{ selectedRoom?.priceHourly?.toLocaleString("vi-VN") }} VND/giờ</span>
      </div>
      <div class="info-item">
        <span class="label">{{ lang.get("booking.dailyPrice") }}:</span>
        <span class="value">{{ selectedRoom?.priceDaily?.toLocaleString("vi-VN") }} VND/đêm</span>
      </div>
    </div>
    <div v-else class="error-message">{{ lang.get("booking.roomNotFound") }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { languageController as lang } from "../../../controller/languageController";
import { getRoomByNumber } from "../../../services/roomService";

const props = defineProps({
  roomNumber: {
    type: String,
    required: true,
  },
  roomData: {
    type: Object,
    default: null,
  },
});

const selectedRoom = ref(null);
const isLoading = ref(false);

// Load room data when roomNumber or roomData changes
watch(
  () => ({ roomNumber: props.roomNumber, roomData: props.roomData }),
  async ({ roomNumber, roomData }) => {
    // If roomData is provided, use it directly without loading
    if (roomData) {
      selectedRoom.value = roomData;
      return;
    }

    if (!roomNumber) {
      selectedRoom.value = null;
      return;
    }

    isLoading.value = true;
    try {
      const room = await getRoomByNumber(roomNumber);
      selectedRoom.value = room;
    } catch (error) {
      console.error("Error loading room:", error);
      selectedRoom.value = null;
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true },
);
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

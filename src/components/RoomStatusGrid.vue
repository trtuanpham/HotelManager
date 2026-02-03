<template>
  <div class="dashboard-section full">
    <h2>{{ lang.dashboard.roomStatusManagement }}</h2>
    <!-- Loading State -->
    <template v-if="isLoading">
      <div class="room-group">
        <h3 class="group-title">{{ lang.dashboard.group || "Group" }} 1</h3>
        <div class="rooms-grid">
          <div v-for="i in 8" :key="`skeleton-${i}`" class="room-card skeleton-item">
            <div class="skeleton-content">
              <div class="skeleton-number"></div>
              <div class="skeleton-type"></div>
              <div class="skeleton-status"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Content State -->
    <template v-else v-for="(rooms, group) in roomsByGroup" :key="group">
      <div class="room-group">
        <h3 class="group-title">{{ lang.dashboard.group || "Group" }} {{ group }}</h3>
        <div class="rooms-grid">
          <div v-for="room in rooms" :key="room.id" :class="['room-card', room.status.toLowerCase()]" @click="processingRoomId !== room.id && handleRoomCardClick(room)">
            <div v-if="processingRoomId === room.id" class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="room-card-content">
              <div class="room-number">{{ room.number }}</div>
              <div class="room-type">{{ room.type }}</div>
              <div class="room-status-text">{{ MAP_STATUS_LABEL[room.status] }}</div>
              <div v-if="room.bookingId" class="room-booking">Booking: {{ room.bookingId }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <ConfirmDialog ref="confirmDialog" />
    <CreateBookingModal ref="createBookingModal" />
    <BookingDetailsModal ref="bookingDetailsModal" />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { langVN as lang } from "../locales/vi";
import ConfirmDialog from "./modals/ConfirmDialog.vue";
import CreateBookingModal from "./modals/CreateBookingModal.vue";
import BookingDetailsModal from "./modals/BookingDetailsModal.vue";
import { ROOM_STATUS } from "../data/constants";
import { updateRoomStatus } from "../services/roomService";

const props = defineProps({
  rooms: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const MAP_STATUS_LABEL = {
  Available: lang.dashboard.statusAvailable,
  Occupied: lang.dashboard.statusOccupied,
  Maintenance: lang.dashboard.statusMaintenance,
  Cleaning: lang.dashboard.statusCleaning,
};

const confirmDialog = ref(null);
const createBookingModal = ref(null);
const bookingDetailsModal = ref(null);
const processingRoomId = ref(null);

const roomsByGroup = computed(() => {
  const grouped = {};
  props.rooms.forEach((room) => {
    if (!grouped[room.group]) {
      grouped[room.group] = [];
    }
    grouped[room.group].push(room);
  });
  return grouped;
});

const handleRoomCardClick = async (room) => {
  console.log("Room card clicked:", room);
  if (room.status === ROOM_STATUS.CLEANING) {
    const result = await confirmDialog.value.show({
      title: lang.confirmDialog.title,
      message: lang.confirmDialog.roomCleaningConfirm.replace("{roomNumber}", room.number),
      cancelText: lang.confirmDialog.cancel,
      confirmText: lang.confirmDialog.confirmDone,
    });
    if (result) {
      try {
        processingRoomId.value = room.id;
        await updateRoomStatus(room.id, ROOM_STATUS.AVAILABLE);
        console.log("Room marked as available");
      } catch (err) {
        console.error("Failed to update room status:", err);
        alert("Lỗi: " + err.message);
      } finally {
        processingRoomId.value = null;
      }
    }
  } else if (room.status === ROOM_STATUS.AVAILABLE) {
    createBookingModal.value.openModal(room.number);
  } else if (room.status === ROOM_STATUS.OCCUPIED) {
    //
    bookingDetailsModal.value.openModal(room.bookingId);
  }
};
</script>

<style scoped>
.dashboard-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.dashboard-section.full {
  grid-column: 1 / -1;
}

.dashboard-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.room-group {
  /* margin-bottom: 30px; */
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.room-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: relative;
}

.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.room-card.available {
  background: #ffffff;
  border: 2px solid #d1d5db;
  color: #6b7280;
}

.room-card.available:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.room-card.occupied {
  background: #dcfce7;
  border: 2px solid #86efac;
  color: #15803d;
}

.room-card.occupied:hover {
  background: #bbf7d0;
  border-color: #4ade80;
}

.room-card.maintenance {
  background: #fee2e2;
  border: 2px solid #fca5a5;
  color: #991b1b;
}

.room-card.maintenance:hover {
  background: #fecaca;
  border-color: #f87171;
}

.room-card.cleaning {
  background: #fef3c7;
  border: 2px solid #fcd34d;
  color: #92400e;
}

.room-card.cleaning:hover {
  background: #fef08a;
  border-color: #facc15;
}

.room-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.room-number {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.room-type {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 500;
}

.room-status-text {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.room-guest {
  font-size: 11px;
  opacity: 0.75;
  font-style: italic;
  margin-top: 4px;
  border-top: 1px solid currentColor;
  padding-top: 4px;
  opacity: 0.8;
}

.room-booking {
  font-size: 11px;
  opacity: 0.75;
  font-style: italic;
  margin-top: 4px;
  border-top: 1px solid currentColor;
  padding-top: 4px;
  opacity: 0.8;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  z-index: 10;
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

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border: 2px solid #e5e7eb;
  cursor: default;
}

.skeleton-item:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.skeleton-number {
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

.skeleton-type {
  height: 13px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  animation: shimmer 2s infinite;
  animation-delay: 0.1s;
}

.skeleton-status {
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  animation: shimmer 2s infinite;
  animation-delay: 0.2s;
}
</style>

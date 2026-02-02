<template>
  <div class="dashboard-section full">
    <h2>{{ lang.dashboard.roomStatusManagement }}</h2>
    <template v-for="(rooms, group) in roomsByGroup" :key="group">
      <div class="room-group">
        <h3 class="group-title">{{ lang.dashboard.group || "Group" }} {{ group }}</h3>
        <div class="rooms-grid">
          <div v-for="room in rooms" :key="room.id" :class="['room-card', room.status.toLowerCase()]" @click="handleRoomCardClick(room)">
            <div class="room-card-content">
              <div class="room-number">{{ room.number }}</div>
              <div class="room-type">{{ room.type }}</div>
              <div class="room-status-text">{{ MAP_STATUS_LABEL[room.status] }}</div>
              <div v-if="room.guest" class="room-guest">{{ room.guest }}</div>
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
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import ConfirmDialog from "./modals/ConfirmDialog.vue";
import CreateBookingModal from "./modals/CreateBookingModal.vue";
import BookingDetailsModal from "./modals/BookingDetailsModal.vue";
import { ROOM_STATUS } from "../data/constants";

const MAP_STATUS_LABEL = {
  Available: lang.dashboard.statusAvailable,
  Occupied: lang.dashboard.statusOccupied,
  Maintenance: lang.dashboard.statusMaintenance,
  Cleaning: lang.dashboard.statusCleaning,
};

const confirmDialog = ref(null);
const createBookingModal = ref(null);
const bookingDetailsModal = ref(null);

const roomsByGroup = computed(() => {
  const grouped = {};
  store.rooms.forEach((room) => {
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
      store.updateRoom(room.id, { status: ROOM_STATUS.AVAILABLE });
    }
  } else if (room.status === ROOM_STATUS.AVAILABLE) {
    createBookingModal.value.openModal(room.number);
  } else if (room.status === ROOM_STATUS.OCCUPIED) {
    // Find the current booking for this room
    const booking = store.bookings.find((b) => b.roomNumber === room.number);
    console.log("Found booking for room:", booking);
    if (booking) {
      bookingDetailsModal.value.openModal(booking);
    }
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
  margin-bottom: 30px;
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
</style>

<template>
  <div class="dashboard">
    <h1>{{ lang.dashboard.title }}</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ lang.dashboard.totalRooms }}</h3>
        <p class="stat-number">{{ store.rooms.length }}</p>
        <span class="stat-label">{{ lang.dashboard.rooms }}</span>
      </div>

      <div class="stat-card">
        <h3>{{ lang.dashboard.availableRooms }}</h3>
        <p class="stat-number">{{ availableRooms }}</p>
        <span class="stat-label">{{ lang.dashboard.available }}</span>
      </div>

      <div class="stat-card">
        <h3>{{ lang.dashboard.occupiedRooms }}</h3>
        <p class="stat-number">{{ occupiedRooms }}</p>
        <span class="stat-label">{{ lang.dashboard.occupied }}</span>
      </div>

      <div class="stat-card">
        <h3>{{ lang.dashboard.totalGuests }}</h3>
        <p class="stat-number">{{ store.guests.length }}</p>
        <span class="stat-label">{{ lang.dashboard.occupied }}</span>
      </div>
    </div>

    <RoomStatusGrid />

    <!-- <div class="dashboard-grid">
      <div class="dashboard-section">
        <h2>{{ lang.dashboard.roomStatistics }}</h2>
        <div class="room-status">
          <div class="status-item">
            <span class="status-badge available"></span>
            <span>{{ lang.dashboard.empty }}: {{ availableRooms }}</span>
          </div>
          <div class="status-item">
            <span class="status-badge occupied"></span>
            <span>{{ lang.dashboard.booked }}: {{ occupiedRooms }}</span>
          </div>
          <div class="status-item">
            <span class="status-badge maintenance"></span>
            <span>{{ lang.dashboard.maintenance }}: {{ maintenanceRooms }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>{{ lang.dashboard.recentGuests }}</h2>
        <div class="guest-list">
          <div v-for="guest in recentGuests" :key="guest.id" class="guest-item">
            <strong>{{ guest.name }}</strong>
            <small>{{ guest.room || lang.dashboard.noRoom }}</small>
          </div>
        </div>
      </div>
    </div> -->

    <div class="dashboard-section full">
      <h2>{{ lang.dashboard.upcomingBookings }}</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ lang.dashboard.guest }}</th>
            <th>{{ lang.dashboard.room }}</th>
            <th>{{ lang.dashboard.checkIn }}</th>
            <th>{{ lang.dashboard.checkOut }}</th>
            <th>{{ lang.dashboard.totalPrice }}</th>
            <th>{{ lang.dashboard.status }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in upcomingBookings" :key="booking.id" class="booking-row" @click="openBookingDetails(booking)">
            <td>{{ booking.guestName }}</td>
            <td>{{ booking.roomNumber || "-" }}</td>
            <td>{{ formatDate(booking.checkIn) }}</td>
            <td>{{ formatDate(booking.checkOut) }}</td>
            <td class="price">{{ formatPrice(booking.totalPrice) }}</td>
            <td>
              <span :class="`status-badge ${booking.status.toLowerCase()}`">{{ booking.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BookingDetailsModal ref="bookingDetailsModalRef" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import RoomStatusGrid from "../components/RoomStatusGrid.vue";
import BookingDetailsModal from "../components/BookingDetailsModal.vue";
import { getUpcomingBookings } from "../services/bookingService";

const bookingDetailsModalRef = ref(null);

const availableRooms = computed(() => store.rooms.filter((r) => r.status === "Available").length);

const occupiedRooms = computed(() => store.rooms.filter((r) => r.status === "Occupied").length);

const maintenanceRooms = computed(() => store.rooms.filter((r) => r.status === "Maintenance").length);

const recentGuests = computed(() => store.guests.slice(0, 5));

const upcomingBookings = computed(() => getUpcomingBookings());

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const openBookingDetails = (booking) => {
  if (bookingDetailsModalRef.value) {
    bookingDetailsModalRef.value.openModal(booking);
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
  min-height: 100vh;
  background: #f5f7fa;
  margin: -20px -20px 0 -20px;
  padding: 40px 20px;
}

h1 {
  margin: 0 0 30px 0;
  color: #333;
  font-size: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border-left: 6px solid #667eea;
}

.stat-card:nth-child(2) {
  border-left-color: #f093fb;
}

.stat-card:nth-child(3) {
  border-left-color: #4facfe;
}

.stat-card:nth-child(4) {
  border-left-color: #43e97b;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-number {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: #333;
  line-height: 1;
  display: inline-block;
  margin-right: 10px;
}

.stat-label {
  display: inline-block;
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

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

.room-status {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.status-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-badge.available {
  background: #43e97b;
}

.status-badge.occupied {
  background: #ff6b6b;
}

.status-badge.maintenance {
  background: #ffa502;
}

.status-badge.pending {
  background: #ffc107;
}

.status-badge.checkedin {
  background: #4facfe;
}

.guest-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guest-item {
  padding: 10px 12px;
  background: #f9f9f9;
  border-left: 3px solid #667eea;
  border-radius: 4px;
  margin-bottom: 10px;
}

.guest-item strong {
  display: block;
  color: #333;
  margin-bottom: 3px;
}

.guest-item small {
  color: #999;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f5f7fa;
}

.data-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

.data-table tbody tr:hover {
  background: #fafafa;
}

.booking-row {
  cursor: pointer;
  transition: all 0.2s;
}

.booking-row:hover {
  background: #eff6ff;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.price {
  color: #667eea;
  font-weight: 600;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-grid {
    grid-column: 1 / -1;
  }
}
</style>

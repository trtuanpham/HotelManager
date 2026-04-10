<template>
  <div class="upcoming-bookings">
    <h2>{{ lang.get("dashboard.upcomingBookings") }}</h2>

    <div v-if="isLoading" class="loading">
      <p>{{ lang.get("common.loading") }}</p>
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ lang.get("bookings.roomNumber") }}</th>
          <th>{{ lang.get("bookings.checkIn") }}</th>
          <th>{{ lang.get("bookings.checkOut") }}</th>
          <th>{{ lang.get("bookings.totalGuests") }}</th>
          <th>{{ lang.get("bookings.totalPrice") }}</th>
          <th>{{ lang.get("bookings.paidAmount") }}</th>
          <th>{{ lang.get("bookings.status") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in recentBookings" :key="booking.id" class="booking-row" @click="openBookingDetails(booking)">
          <td>{{ booking.roomNumber || "-" }}</td>
          <td>{{ formatDateTimeLocal(booking.checkIn) }}</td>
          <td>{{ formatDateTimeLocal(booking.checkOut) }}</td>
          <td>{{ booking.guestIds.length }}</td>
          <td class="price">{{ formatCurrency(booking.totalPrice) }}</td>
          <td :class="['price', isPaidComplete(booking) ? 'paid-complete' : 'paid-incomplete']">{{ formatCurrency(booking.totalPrepaid) }}</td>
          <td>
            <span :class="`status-badge ${booking.status.toLowerCase().replace(' ', '')}`">{{ booking.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!isLoading && recentBookings.length === 0" class="no-data">
      <p>{{ lang.get("bookings.notFound") }}</p>
    </div>

    <BookingDetailsModal ref="bookingDetailsModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BookingDetailsModal from "./modals/BookingDetailsModal.vue";
import { getAllBookings } from "../services/bookingService";
import { useCurrency } from "../composables/useCurrency";
import { useDateTime } from "../composables/useDateTime";
import { languageController as lang } from "../controller/languageController";

const { formatDateTimeLocal } = useDateTime();
const { formatCurrency } = useCurrency();
const bookingDetailsModalRef = ref(null);
const bookings = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    bookings.value = await getAllBookings();
  } catch (error) {
    console.error("Error loading bookings:", error);
  } finally {
    isLoading.value = false;
  }
});

// Get the 20 most recent bookings
const recentBookings = computed(() => {
  return bookings.value.slice(0, 20);
});

const openBookingDetails = (booking) => {
  if (bookingDetailsModalRef.value) {
    bookingDetailsModalRef.value.openModal(booking.id);
  }
};

const isPaidComplete = (booking) => {
  return booking.totalPrice === (booking.totalPrepaid || 0);
};
</script>

<style scoped>
.upcoming-bookings {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.upcoming-bookings h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
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
  font-size: 14px;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  font-size: 14px;
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

.paid-complete {
  color: #16a34a !important;
}

.paid-incomplete {
  color: #ff6b6b !important;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.checkedin {
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
}

.status-badge.checkedout {
  background: rgba(67, 233, 123, 0.2);
  color: #43e97b;
}
</style>

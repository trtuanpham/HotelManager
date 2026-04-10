<template>
  <div class="bookings-manager">
    <div class="header">
      <h1>{{ lang.get("bookings.title") }}</h1>
    </div>

    <div class="filters">
      <input v-model="searchTerm" type="text" :placeholder="lang.get('bookings.search')" class="search-input" />
      <select v-model="filterStatus" class="filter-select">
        <option value="">{{ lang.get("bookings.allStatus") }}</option>
        <option value="Pending">{{ lang.get("bookings.pending") }}</option>
        <option value="Checked In">{{ lang.get("bookings.checkedIn") }}</option>
        <option value="Checked Out">{{ lang.get("bookings.checkedOut") }}</option>
      </select>
    </div>

    <table class="data-table">
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
        <tr v-for="booking in filteredBookings" :key="booking.id">
          <td>{{ booking.roomNumber }}</td>
          <td>{{ formatDateTimeLocal(new Date(booking.checkIn)) }}</td>
          <td>{{ formatDateTimeLocal(new Date(booking.checkOut)) }}</td>
          <td>{{ booking.guestIds.length }}</td>
          <td class="price">{{ formatCurrency(booking.totalPrice) }}</td>
          <td :class="['price', isPaidComplete(booking) ? 'paid-complete' : 'paid-incomplete']">{{ formatCurrency(booking.totalPrepaid) }}</td>
          <td>
            <span :class="`status-badge ${booking.status.toLowerCase().replace(' ', '')}`">{{ booking.status }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { languageController as lang } from "../controller/languageController";
import { getAllBookings } from "../services/bookingService";
import { useCurrency } from "../composables/useCurrency";
import { useDateTime } from "../composables/useDateTime";

const { formatCurrency } = useCurrency();
const { formatDateTimeLocal } = useDateTime();

const searchTerm = ref("");
const filterStatus = ref("");
const bookings = ref([]);
const isLoading = ref(false);

// Load bookings on component mount
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

const filteredBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const matchesSearch = booking.roomNumber.includes(searchTerm.value);
    const matchesStatus = !filterStatus.value || booking.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const loadBookings = async () => {
  isLoading.value = true;
  try {
    bookings.value = await getAllBookings();
  } catch (error) {
    console.error("Error loading bookings:", error);
  } finally {
    isLoading.value = false;
  }
};

const isPaidComplete = (booking) => {
  return booking.totalPrice === (booking.totalPrepaid || 0);
};
</script>

<style scoped>
.bookings-manager {
  padding: 20px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 32px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input,
.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-table thead {
  background: #f5f7fa;
}

.data-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background: #fafafa;
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

.actions {
  display: flex;
  gap: 8px;
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

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-small {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: background 0.3s ease;
}

.btn-small:hover {
  background: #5568d3;
}

.btn-small.btn-danger {
  background: #ff6b6b;
}

.btn-small.btn-danger:hover {
  background: #ee5a52;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  min-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal input,
.modal select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.modal-buttons button {
  flex: 1;
}
</style>

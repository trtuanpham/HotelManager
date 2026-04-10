<template>
  <div class="rooms-manager">
    <div class="header">
      <h1><i class="material-icons">meeting_room</i> {{ lang.get("rooms.title") }}</h1>
      <button class="btn-primary" @click="openCreateModal"><i class="material-icons">add</i> {{ lang.get("rooms.addRoom") }}</button>
    </div>

    <div class="filters">
      <input v-model="searchTerm" type="text" :placeholder="lang.get('rooms.search')" class="search-input" />
      <select v-model="filterStatus" class="filter-select">
        <option value="">{{ lang.get("rooms.allStatus") }}</option>
        <option value="Available">{{ lang.get("rooms.available") }}</option>
        <option value="Booking">{{ lang.get("rooms.booking") }}</option>
        <option value="Maintenance">{{ lang.get("rooms.maintenance") }}</option>
      </select>
      <select v-model="filterGroup" class="filter-select">
        <option value="">{{ lang.get("rooms.allGroups") }}</option>
        <option v-for="group in allGroups" :key="group" :value="group">
          {{ group }}
        </option>
      </select>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>{{ lang.get("rooms.roomNumber") }}</th>
          <th>{{ lang.get("rooms.type") }}</th>
          <th>{{ lang.get("rooms.group") }}</th>
          <th>{{ lang.get("rooms.status") }}</th>
          <th>{{ lang.get("rooms.priceHourly") }}</th>
          <th>{{ lang.get("rooms.priceDaily") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading" class="loading-row">
          <td colspan="6" class="loading-cell">{{ lang.get("common.loading") }}</td>
        </tr>
        <tr v-else-if="rooms.length === 0" class="empty-row">
          <td colspan="6" class="empty-cell">{{ lang.get("rooms.noRooms") }}</td>
        </tr>
        <tr v-for="room in rooms" v-else :key="room.id" class="room-row" @click="openEditModal(room)">
          <td>{{ room.number }}</td>
          <td>{{ room.type }}</td>
          <td>{{ room.group || "-" }}</td>
          <td>
            <span :class="`status-badge ${room.status.toLowerCase()}`">{{ room.status }}</span>
          </td>
          <td>{{ formatCurrency(room.priceHourly) }}</td>
          <td>{{ formatCurrency(room.priceDaily) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <RoomDetailsModal ref="roomDetailsModalRef" @room-created="onRoomSaved" @room-updated="onRoomSaved" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { languageController as lang } from "../controller/languageController";
import { getAllRooms } from "../services/roomService";
import { hotelStore as store } from "../stores/hotelStore";
import { useCurrency } from "../composables/useCurrency";
import RoomDetailsModal from "../components/modals/RoomDetailsModal.vue";
import "@material-design-icons/font";

const { formatCurrency } = useCurrency();

const searchTerm = ref("");
const filterStatus = ref("");
const filterGroup = ref("");
const isLoading = ref(false);
const allRooms = ref([]);
const allGroups = ref([]);
const roomDetailsModalRef = ref(null);

const rooms = computed(() => {
  let filtered = allRooms.value;

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter((r) => r.status === filterStatus.value);
  }

  // Filter by group
  if (filterGroup.value) {
    filtered = filtered.filter((r) => r.group === filterGroup.value);
  }

  // Filter by search term
  if (searchTerm.value) {
    const searchLower = searchTerm.value.toLowerCase();
    filtered = filtered.filter((r) => r.number.toLowerCase().includes(searchLower));
  }

  return filtered;
});

const loadAllRooms = async () => {
  isLoading.value = true;
  try {
    const result = await getAllRooms("", "");
    allRooms.value = result;

    // Extract unique groups
    const groups = new Set(result.map((r) => r.group).filter((g) => g));
    allGroups.value = Array.from(groups).sort();
  } catch (error) {
    console.error("Error loading rooms:", error);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  roomDetailsModalRef.value?.openModal(null);
};

const openEditModal = (room) => {
  roomDetailsModalRef.value?.openModal(room);
};

const onRoomSaved = () => {
  // Reload all rooms after create/update
  loadAllRooms();
};

onMounted(() => {
  loadAllRooms();
});
</script>

<style scoped>
.rooms-manager {
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.header h1 i {
  font-size: 36px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-end;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input,
.filter-select {
  padding: 12px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s ease;
  font-family: inherit;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  min-width: 180px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231f2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select:hover:not(:disabled) {
  border-color: #667eea;
}

.search-input::placeholder {
  color: #9ca3af;
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

.room-row {
  transition: background 0.15s ease;
  cursor: pointer;
}

.room-row:hover {
  background: #f3f4f6;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.available {
  background: #667eea;
  color: #ffffff;
}

.status-badge.booking {
  background: #10b981;
  color: #ffffff;
}

.status-badge.maintenance {
  background: #ef4444;
  color: #ffffff;
}
.status-badge.cleaning {
  background: #f59e0b;
  color: #ffffff;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-primary {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  background: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-small {
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  justify-content: center;
}

.btn-small i {
  font-size: 16px;
}

.btn-small:hover {
  background: #5568d3;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-small:active {
  transform: translateY(1px);
}

.btn-small.btn-danger {
  background: #ef4444;
}

.btn-small.btn-danger:hover {
  background: #dc2626;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
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
  min-width: 400px;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1f2937;
}

.modal input:focus,
.modal select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #e5e7eb;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-secondary:active {
  transform: translateY(1px);
}

.modal-buttons button {
  flex: 1;
}

.loading-row .loading-cell,
.empty-row .empty-cell {
  text-align: center;
  padding: 40px 15px;
  color: #999;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}
</style>

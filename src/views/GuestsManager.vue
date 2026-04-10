<template>
  <div class="guests-manager">
    <div class="header">
      <h1><i class="material-icons">people</i> {{ lang.get("guests.title") }}</h1>
      <button class="btn-primary" @click="createGuest"><i class="material-icons">add</i> {{ lang.get("guests.addGuest") }}</button>
    </div>

    <div class="search-box">
      <div class="search-wrapper">
        <input v-model="searchTerm" type="text" :placeholder="lang.get('guests.search')" class="search-input" @keyup.enter="handleSearch" />
        <button class="btn-search" @click="handleSearch"><i class="material-icons">search</i> {{ lang.get("common.search") }}</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>{{ lang.get("guests.name") }}</th>
          <th>{{ lang.get("guest.citizenId") }}</th>
          <th>{{ lang.get("guests.email") }}</th>
          <th>{{ lang.get("guests.phone") }}</th>
          <th>{{ lang.get("guests.joinDate") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading" class="loading-row">
          <td colspan="6" class="loading-cell">{{ lang.get("common.loading") }}</td>
        </tr>
        <tr v-else-if="guests.length === 0" class="empty-row">
          <td colspan="6" class="empty-cell">{{ lang.get("guests.noGuests") }}</td>
        </tr>
        <tr v-for="guest in guests" v-else :key="guest.id" class="guest-row" @click="editGuest(guest)">
          <td class="avatar-cell">
            <AvatarSection :guest-data="{ imageUrl: guest.avatar, name: guest.name }" />
          </td>
          <td>{{ guest.name }}</td>
          <td>{{ guest.citizenId }}</td>
          <td>{{ guest.email }}</td>
          <td>{{ guest.phone }}</td>
          <td>{{ formatDate(guest.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <div class="pagination-info">{{ paginationText }}</div>
      <div class="pagination-controls">
        <button class="btn-pagination" @click="handlePrevPage" :disabled="!hasPrevPage || isLoading"><i class="material-icons">chevron_left</i> {{ lang.get("common.previous") }}</button>
        <button class="btn-pagination" @click="handleNextPage" :disabled="!hasNextPage || isLoading">{{ lang.get("common.next") }} <i class="material-icons">chevron_right</i></button>
      </div>
    </div>

    <GuestDetailsModal ref="guestDetailsModalRef" />
    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { languageController as lang } from "../controller/languageController";
import { getGuestsPaginated } from "../services/guestService";
import GuestDetailsModal from "../components/modals/GuestDetailsModal.vue";
import ConfirmDialog from "../components/modals/ConfirmDialog.vue";
import AvatarSection from "../components/modals/AvatarSection.vue";
import "@material-design-icons/font";

const guestDetailsModalRef = ref(null);
const confirmDialogRef = ref(null);
const searchTerm = ref("");
const guests = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = ref(0);
const hasNextPage = ref(false);
const hasPrevPage = ref(false);
const isLoading = ref(false);

const loadGuests = async () => {
  isLoading.value = true;
  try {
    const result = await getGuestsPaginated({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchTerm.value,
    });
    guests.value = result.data;
    total.value = result.total;
    totalPages.value = result.totalPages;
    hasNextPage.value = result.hasNextPage;
    hasPrevPage.value = result.hasPrevPage;
  } catch (error) {
    console.error("Error loading guests:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on search
  loadGuests();
};

const handleNextPage = () => {
  if (hasNextPage.value) {
    currentPage.value += 1;
    loadGuests();
  }
};

const handlePrevPage = () => {
  if (hasPrevPage.value) {
    currentPage.value -= 1;
    loadGuests();
  }
};

onMounted(() => {
  loadGuests();
});

const deleteGuest = async (id) => {
  const result = await confirmDialogRef.value.show({
    title: lang.get("guests.deleteConfirm"),
    message: "Bạn có chắc chắn muốn xóa khách hàng này?",
    confirmText: lang.get("common.delete"),
    cancelText: lang.get("common.cancel"),
  });
  if (result) {
    loadGuests(); // Refresh the list
  }
};

const editGuest = (guest) => {
  guestDetailsModalRef.value.openModal(guest);
};

const createGuest = () => {
  guestDetailsModalRef.value.openModal();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const paginationText = computed(() => {
  const start = guests.value.length > 0 ? (currentPage.value - 1) * pageSize.value + 1 : 0;
  const end = Math.min(currentPage.value * pageSize.value, total.value);
  return `${lang.get("common.showing")} ${start} - ${end} ${lang.get("common.of")} ${total.value} ${lang.get("guests.title")}`;
});
</script>

<style scoped>
.guests-manager {
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

.search-box {
  margin-bottom: 20px;
}

.search-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 500px;
  padding: 12px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.btn-search {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-search i {
  font-size: 20px;
}

.btn-search:hover {
  background: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-search:active {
  transform: translateY(1px);
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

.guest-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.guest-row:hover {
  background: #f3f4f6;
}

.actions {
  display: flex;
  gap: 8px;
}

.avatar-cell {
  text-align: center;
  padding: 8px 15px;
  width: 80px;
}

.avatar-cell :deep(.avatar-view) {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin: 0 auto;
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
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
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
  background: #ff6b6b;
}

.btn-small.btn-danger:hover {
  background: #ee5a52;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.btn-pagination {
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-pagination i {
  font-size: 20px;
}

.btn-pagination:hover:not(:disabled) {
  background: #5568d3;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-pagination:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-pagination:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  min-width: 80px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

.loading-row .loading-cell {
  text-align: center;
  padding: 30px;
  color: #999;
}

.empty-row .empty-cell {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>

<template>
  <div class="guests-manager">
    <div class="header">
      <h1>👥 Quản lý khách hàng</h1>
      <button class="btn-primary" @click="createGuestModalRef.openModal()">+ Thêm khách</button>
    </div>

    <div class="search-box">
      <input v-model="searchTerm" type="text" placeholder="Tìm kiếm khách hàng..." class="search-input" />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Tên khách</th>
          <th>Số căn cước</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Ngày tham gia</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="guest in filteredGuests" :key="guest.id">
          <td class="avatar-cell">
            <img v-if="guest.avatar" :src="guest.avatar" :alt="guest.name" class="avatar-img" />
            <div v-else class="avatar-placeholder">{{ getInitials(guest.name) }}</div>
          </td>
          <td>{{ guest.name }}</td>
          <td>{{ guest.citizenId }}</td>
          <td>{{ guest.email }}</td>
          <td>{{ guest.phone }}</td>
          <td>{{ formatDate(guest.createdAt) }}</td>
          <td class="actions">
            <button class="btn-small" @click="editGuest(guest)">✏️ Sửa</button>
            <button class="btn-small btn-danger" @click="deleteGuest(guest.id)">🗑️ Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <CreateGuestModal ref="createGuestModalRef" />
    <GuestDetailsModal ref="guestDetailsModalRef" />
    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import CreateGuestModal from "../components/modals/CreateGuestModal.vue";
import GuestDetailsModal from "../components/modals/GuestDetailsModal.vue";
import ConfirmDialog from "../components/modals/ConfirmDialog.vue";

const createGuestModalRef = ref(null);
const guestDetailsModalRef = ref(null);
const confirmDialogRef = ref(null);
const searchTerm = ref("");

const filteredGuests = computed(() => {
  return store.guests.filter(
    (guest) => guest.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || guest.email.toLowerCase().includes(searchTerm.value.toLowerCase()) || guest.phone.includes(searchTerm.value),
  );
});

const deleteGuest = async (id) => {
  const result = await confirmDialogRef.value.show({
    title: "Xóa khách hàng",
    message: "Bạn có chắc chắn muốn xóa khách hàng này?",
    confirmText: "Xóa",
    cancelText: "Hủy",
  });
  if (result) {
    store.deleteGuest(id);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
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
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
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

.actions {
  display: flex;
  gap: 8px;
}

.avatar-cell {
  text-align: center;
  padding: 8px 15px;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin: 0 auto;
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

.modal input {
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

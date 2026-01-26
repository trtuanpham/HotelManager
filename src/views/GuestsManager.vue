<template>
  <div class="guests-manager">
    <div class="header">
      <h1>👥 Quản lý khách hàng</h1>
      <button class="btn-primary" @click="showAddForm = true">+ Thêm khách</button>
    </div>

    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h2>Thêm khách hàng mới</h2>
        <form @submit.prevent="addGuest">
          <input v-model="newGuest.name" placeholder="Tên khách hàng" required />
          <input v-model="newGuest.email" type="email" placeholder="Email" required />
          <input v-model="newGuest.phone" placeholder="Số điện thoại" required />
          <input v-model="newGuest.room" placeholder="Số phòng (tùy chọn)" />
          <input v-model="newGuest.checkIn" type="date" required />
          <input v-model="newGuest.checkOut" type="date" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">Thêm</button>
            <button type="button" class="btn-secondary" @click="showAddForm = false">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <div class="search-box">
      <input 
        v-model="searchTerm" 
        type="text" 
        placeholder="Tìm kiếm khách hàng..."
        class="search-input"
      />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Tên khách</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Phòng</th>
          <th>Ngày nhận</th>
          <th>Ngày trả</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="guest in filteredGuests" :key="guest.id">
          <td>{{ guest.name }}</td>
          <td>{{ guest.email }}</td>
          <td>{{ guest.phone }}</td>
          <td>{{ guest.room || '-' }}</td>
          <td>{{ formatDate(guest.checkIn) }}</td>
          <td>{{ formatDate(guest.checkOut) }}</td>
          <td class="actions">
            <button class="btn-small" @click="editGuest(guest)">✏️ Sửa</button>
            <button class="btn-small btn-danger" @click="deleteGuest(guest.id)">🗑️ Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editingGuest" class="modal-overlay">
      <div class="modal">
        <h2>Chỉnh sửa khách hàng</h2>
        <form @submit.prevent="updateGuest">
          <input v-model="editingGuest.name" placeholder="Tên khách hàng" required />
          <input v-model="editingGuest.email" type="email" placeholder="Email" required />
          <input v-model="editingGuest.phone" placeholder="Số điện thoại" required />
          <input v-model="editingGuest.room" placeholder="Số phòng (tùy chọn)" />
          <input v-model="editingGuest.checkIn" type="date" required />
          <input v-model="editingGuest.checkOut" type="date" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">Cập nhật</button>
            <button type="button" class="btn-secondary" @click="editingGuest = null">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { hotelStore as store } from '../stores/hotelStore'
import { langVN as lang } from '../locales/vi'

const showAddForm = ref(false)
const editingGuest = ref(null)
const searchTerm = ref('')
const newGuest = ref({
  name: '',
  email: '',
  phone: '',
  room: '',
  checkIn: '',
  checkOut: ''
})

const filteredGuests = computed(() => {
  return store.guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    guest.phone.includes(searchTerm.value)
  )
})

const addGuest = () => {
  store.addGuest(newGuest.value)
  newGuest.value = {
    name: '',
    email: '',
    phone: '',
    room: '',
    checkIn: '',
    checkOut: ''
  }
  showAddForm.value = false
}

const deleteGuest = (id) => {
  if (confirm(lang.guests.deleteConfirm)) {
    store.deleteGuest(id)
  }
}

const editGuest = (guest) => {
  editingGuest.value = { ...guest }
}

const updateGuest = () => {
  store.updateGuest(editingGuest.value.id, editingGuest.value)
  editingGuest.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}
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

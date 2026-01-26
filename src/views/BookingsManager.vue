<template>
  <div class="bookings-manager">
    <div class="header">
      <h1>📋 Quản lý đặt phòng</h1>
      <button class="btn-primary" @click="showAddForm = true">+ Thêm đặt phòng</button>
    </div>

    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h2>Thêm đặt phòng mới</h2>
        <form @submit.prevent="addBooking">
          <input v-model="newBooking.guestName" placeholder="Tên khách hàng" required />
          <input v-model="newBooking.roomNumber" placeholder="Số phòng" required />
          <input v-model="newBooking.checkIn" type="date" required />
          <input v-model="newBooking.checkOut" type="date" required />
          <input v-model.number="newBooking.totalPrice" type="number" placeholder="Tổng giá" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">Thêm</button>
            <button type="button" class="btn-secondary" @click="showAddForm = false">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <div class="filters">
      <input 
        v-model="searchTerm" 
        type="text" 
        placeholder="Tìm kiếm đặt phòng..."
        class="search-input"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="Pending">Chưa xác nhận</option>
        <option value="Checked In">Đã nhận phòng</option>
        <option value="Checked Out">Đã trả phòng</option>
      </select>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Khách hàng</th>
          <th>Phòng</th>
          <th>Ngày nhận</th>
          <th>Ngày trả</th>
          <th>Tổng giá</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in filteredBookings" :key="booking.id">
          <td>{{ booking.guestName }}</td>
          <td>{{ booking.roomNumber }}</td>
          <td>{{ formatDate(booking.checkIn) }}</td>
          <td>{{ formatDate(booking.checkOut) }}</td>
          <td class="price">{{ formatPrice(booking.totalPrice) }}</td>
          <td><span :class="`status-badge ${booking.status.toLowerCase().replace(' ', '')}`">{{ booking.status }}</span></td>
          <td class="actions">
            <button class="btn-small" @click="editBooking(booking)">✏️ Sửa</button>
            <button class="btn-small btn-danger" @click="deleteBooking(booking.id)">🗑️ Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editingBooking" class="modal-overlay">
      <div class="modal">
        <h2>Chỉnh sửa đặt phòng</h2>
        <form @submit.prevent="updateBooking">
          <input v-model="editingBooking.guestName" placeholder="Tên khách hàng" required />
          <input v-model="editingBooking.roomNumber" placeholder="Số phòng" required />
          <input v-model="editingBooking.checkIn" type="date" required />
          <input v-model="editingBooking.checkOut" type="date" required />
          <input v-model.number="editingBooking.totalPrice" type="number" placeholder="Tổng giá" required />
          <select v-model="editingBooking.status" required>
            <option value="Pending">Chưa xác nhận</option>
            <option value="Checked In">Đã nhận phòng</option>
            <option value="Checked Out">Đã trả phòng</option>
          </select>
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">Cập nhật</button>
            <button type="button" class="btn-secondary" @click="editingBooking = null">Hủy</button>
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
const editingBooking = ref(null)
const searchTerm = ref('')
const filterStatus = ref('')
const newBooking = ref({
  guestName: '',
  roomNumber: '',
  checkIn: '',
  checkOut: '',
  totalPrice: 0
})

const filteredBookings = computed(() => {
  return store.bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         booking.roomNumber.includes(searchTerm.value)
    const matchesStatus = !filterStatus.value || booking.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const addBooking = () => {
  store.addBooking(newBooking.value)
  newBooking.value = {
    guestName: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    totalPrice: 0
  }
  showAddForm.value = false
}

const deleteBooking = (id) => {
  if (confirm(lang.bookings.deleteConfirm)) {
    store.deleteBooking(id)
  }
}

const editBooking = (booking) => {
  editingBooking.value = { ...booking }
}

const updateBooking = () => {
  store.updateBooking(editingBooking.value.id, editingBooking.value)
  editingBooking.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}
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

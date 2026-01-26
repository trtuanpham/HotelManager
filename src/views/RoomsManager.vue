<template>
  <div class="rooms-manager">
    <div class="header">
      <h1>{{ lang.rooms.title }}</h1>
      <button class="btn-primary" @click="showAddForm = true">{{ lang.rooms.addRoom }}</button>
    </div>

    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h2>{{ lang.rooms.addRoomTitle }}</h2>
        <form @submit.prevent="addRoom">
          <input v-model="newRoom.number" :placeholder="lang.rooms.roomNumber" required />
          <select v-model="newRoom.type" required>
            <option value="">{{ lang.rooms.selectRoomType }}</option>
            <option value="Single">{{ lang.rooms.single }}</option>
            <option value="Double">{{ lang.rooms.double }}</option>
            <option value="Suite">{{ lang.rooms.suite }}</option>
          </select>
          <input v-model.number="newRoom.price" type="number" :placeholder="lang.rooms.price" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">{{ lang.rooms.add }}</button>
            <button type="button" class="btn-secondary" @click="showAddForm = false">{{ lang.rooms.cancel }}</button>
          </div>
        </form>
      </div>
    </div>

    <div class="filters">
      <input 
        v-model="searchTerm" 
        type="text" 
        :placeholder="lang.rooms.search"
        class="search-input"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="">{{ lang.rooms.allStatus }}</option>
        <option value="Available">{{ lang.rooms.available }}</option>
        <option value="Occupied">{{ lang.rooms.occupied }}</option>
        <option value="Maintenance">{{ lang.rooms.maintenance }}</option>
      </select>
    </div>

    <div class="rooms-grid">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <div class="room-header">
          <h3>{{ lang.rooms.room }} {{ room.number }}</h3>
          <span :class="`status-badge ${room.status.toLowerCase()}`">{{ room.status }}</span>
        </div>
        <div class="room-details">
          <p><strong>{{ lang.rooms.type }}:</strong> {{ room.type }}</p>
          <p><strong>{{ lang.rooms.price }}:</strong> {{ formatPrice(room.price) }}{{ lang.rooms.perNight }}</p>
          <p v-if="room.guest"><strong>{{ lang.rooms.guest }}:</strong> {{ room.guest }}</p>
        </div>
        <div class="room-actions">
          <button class="btn-small" @click="editRoom(room)">{{ lang.rooms.edit }}</button>
          <button class="btn-small btn-danger" @click="deleteRoom(room.id)">{{ lang.rooms.delete }}</button>
        </div>
      </div>
    </div>

    <div v-if="editingRoom" class="modal-overlay">
      <div class="modal">
        <h2>{{ lang.rooms.editRoomTitle }}</h2>
        <form @submit.prevent="updateRoom">
          <input v-model="editingRoom.number" :placeholder="lang.rooms.roomNumber" required />
          <select v-model="editingRoom.type" required>
            <option value="Single">{{ lang.rooms.single }}</option>
            <option value="Double">{{ lang.rooms.double }}</option>
            <option value="Suite">{{ lang.rooms.suite }}</option>
          </select>
          <select v-model="editingRoom.status" required>
            <option value="Available">{{ lang.rooms.available }}</option>
            <option value="Occupied">{{ lang.rooms.occupied }}</option>
            <option value="Maintenance">{{ lang.rooms.maintenance }}</option>
          </select>
          <input v-model.number="editingRoom.price" type="number" :placeholder="lang.rooms.price" required />
          <input v-model="editingRoom.guest" :placeholder="lang.rooms.guest" />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">{{ lang.rooms.update }}</button>
            <button type="button" class="btn-secondary" @click="editingRoom = null">{{ lang.rooms.cancel }}</button>
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
const editingRoom = ref(null)
const searchTerm = ref('')
const filterStatus = ref('')
const newRoom = ref({
  number: '',
  type: 'Double',
  price: 0
})

const filteredRooms = computed(() => {
  return store.rooms.filter(room => {
    const matchesSearch = room.number.includes(searchTerm.value)
    const matchesStatus = !filterStatus.value || room.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const addRoom = () => {
  store.addRoom(newRoom.value)
  newRoom.value = { number: '', type: 'Double', price: 0 }
  showAddForm.value = false
}

const deleteRoom = (id) => {
  if (confirm(lang.rooms.deleteConfirm)) {
    store.deleteRoom(id)
  }
}

const editRoom = (room) => {
  editingRoom.value = { ...room }
}

const updateRoom = () => {
  store.updateRoom(editingRoom.value.id, editingRoom.value)
  editingRoom.value = null
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
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
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
  min-width: 200px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.room-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-header h3 {
  margin: 0;
  font-size: 18px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.available {
  background: rgba(67, 233, 123, 0.2);
  color: #43e97b;
}

.status-badge.occupied {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.status-badge.maintenance {
  background: rgba(255, 165, 2, 0.2);
  color: #ffa502;
}

.room-details {
  padding: 15px;
}

.room-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.room-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.btn-small {
  flex: 1;
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

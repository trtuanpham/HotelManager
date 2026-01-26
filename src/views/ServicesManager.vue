<template>
  <div class="services-manager">
    <div class="header">
      <h1>🎯 Quản lý dịch vụ</h1>
      <button class="btn-primary" @click="showAddForm = true">+ Thêm dịch vụ</button>
    </div>

    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h2>Thêm dịch vụ mới</h2>
        <form @submit.prevent="addService">
          <input v-model="newService.name" placeholder="Tên dịch vụ" required />
          <textarea v-model="newService.description" placeholder="Mô tả dịch vụ" rows="3"></textarea>
          <input v-model.number="newService.price" type="number" placeholder="Giá dịch vụ" required />
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
        placeholder="Tìm kiếm dịch vụ..."
        class="search-input"
      />
    </div>

    <div class="services-grid">
      <div v-for="service in filteredServices" :key="service.id" class="service-card">
        <div class="service-header">
          <h3>{{ service.name }}</h3>
        </div>
        <p class="service-description">{{ service.description }}</p>
        <div class="service-footer">
          <span class="price">{{ formatPrice(service.price) }}</span>
          <div class="actions">
            <button class="btn-small" @click="editService(service)">✏️ Sửa</button>
            <button class="btn-small btn-danger" @click="deleteService(service.id)">🗑️ Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingService" class="modal-overlay">
      <div class="modal">
        <h2>Chỉnh sửa dịch vụ</h2>
        <form @submit.prevent="updateService">
          <input v-model="editingService.name" placeholder="Tên dịch vụ" required />
          <textarea v-model="editingService.description" placeholder="Mô tả dịch vụ" rows="3"></textarea>
          <input v-model.number="editingService.price" type="number" placeholder="Giá dịch vụ" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">Cập nhật</button>
            <button type="button" class="btn-secondary" @click="editingService = null">Hủy</button>
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
const editingService = ref(null)
const searchTerm = ref('')
const newService = ref({
  name: '',
  description: '',
  price: 0
})

const filteredServices = computed(() => {
  return store.services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const addService = () => {
  store.addService(newService.value)
  newService.value = {
    name: '',
    description: '',
    price: 0
  }
  showAddForm.value = false
}

const deleteService = (id) => {
  if (confirm(lang.services.deleteConfirm)) {
    store.deleteService(id)
  }
}

const editService = (service) => {
  editingService.value = { ...service }
}

const updateService = () => {
  store.updateService(editingService.value.id, editingService.value)
  editingService.value = null
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
.services-manager {
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
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.service-header {
  border-bottom: 2px solid #667eea;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.service-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.service-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 auto 0;
  padding: 0 0 15px 0;
  border-bottom: 1px solid #e0e0e0;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
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

.modal input,
.modal textarea {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
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

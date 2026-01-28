<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ lang.guest?.createNew || "Tạo khách hàng mới" }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>{{ lang.guest?.name }}<span class="required">*</span></label>
          <input v-model="formData.name" type="text" class="input-field" placeholder="Họ và tên" />
        </div>

        <div class="form-group">
          <label>{{ lang.guest?.email }}</label>
          <input v-model="formData.email" type="email" class="input-field" placeholder="Email" />
        </div>

        <div class="form-group">
          <label>{{ lang.guest?.phone }}</label>
          <input v-model="formData.phone" type="text" class="input-field" placeholder="Số điện thoại" />
        </div>

        <div class="form-group">
          <label>{{ lang.guest?.citizenId }}</label>
          <input v-model="formData.citizenId" type="text" class="input-field" placeholder="ID công dân" />
        </div>

        <div class="form-group">
          <label>{{ lang.guest?.nationality }}</label>
          <select v-model="formData.nationality" class="input-field">
            <option value="">-- Chọn quốc tịch --</option>
            <option value="Việt Nam">Việt Nam</option>
            <option value="Trung Quốc">Trung Quốc</option>
            <option value="Thái Lan">Thái Lan</option>
            <option value="Hàn Quốc">Hàn Quốc</option>
            <option value="Nhật Bản">Nhật Bản</option>
            <option value="Mỹ">Mỹ</option>
            <option value="Canada">Canada</option>
            <option value="Úc">Úc</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.confirmDialog?.cancel || "Hủy" }}</button>
        <button class="btn btn-primary" @click="submitGuest">{{ lang.guest?.create || "Thêm khách hàng" }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import "../style/common.css";

const isVisible = ref(false);
const formData = ref({
  name: "",
  email: "",
  phone: "",
  citizenId: "",
  nationality: "",
});

const openModal = (guestName = "") => {
  formData.value = {
    name: guestName,
    email: "",
    phone: "",
    citizenId: "",
    nationality: "",
  };
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  formData.value = {
    name: "",
    email: "",
    phone: "",
    citizenId: "",
    nationality: "",
  };
};

const submitGuest = () => {
  if (!formData.value.name.trim()) {
    alert(lang.guest?.nameRequired || "Vui lòng nhập tên khách hàng");
    return;
  }

  const newGuest = {
    id: Math.max(...store.guests.map((g) => g.id), 0) + 1,
    name: formData.value.name,
    email: formData.value.email,
    phone: formData.value.phone,
    citizenId: formData.value.citizenId,
    nationality: formData.value.nationality,
  };

  store.addGuest(newGuest);
  closeModal();
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>

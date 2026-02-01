<template>
  <ModalBase :is-visible="isVisible" modal-id="guest-modal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ lang.guest?.createNew || "Tạo khách hàng mới" }}</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="guest-form-wrapper">
          <!-- Avatar Editor Component -->
          <AvatarEditor :avatar="formData.avatar" @update:avatar="(newAvatar) => (formData.avatar = newAvatar)" />

          <!-- Right: Form Fields -->
          <div class="guest-form-section">
            <div class="form-group">
              <label>{{ lang.guest?.citizenId }}</label>
              <input v-model="formData.citizenId" type="text" class="input-field" :placeholder="lang.guest?.citizenId" />
            </div>

            <div class="form-group">
              <label>{{ lang.guest?.name }}<span class="required">*</span></label>
              <input v-model="formData.name" type="text" class="input-field" :placeholder="lang.guest?.name" />
            </div>

            <div class="form-group">
              <label>{{ lang.guest?.email }}</label>
              <input v-model="formData.email" type="email" class="input-field" :placeholder="lang.guest?.email" />
            </div>

            <div class="form-group">
              <label>{{ lang.guest?.phone }}</label>
              <input v-model="formData.phone" type="text" class="input-field" :placeholder="lang.guest?.phone" />
            </div>

            <div class="form-group">
              <label>{{ lang.guest?.nationality }}</label>
              <select v-model="formData.nationality" class="input-field">
                <option value="">-- Chọn quốc tịch --</option>
                <option v-for="nat in NATIONALITIES" :key="nat.code" :value="nat.name">
                  {{ nat.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.confirmDialog?.cancel || "Hủy" }}</button>
        <button class="btn btn-primary" @click="submitGuest">{{ lang.guest?.create || "Thêm khách hàng" }}</button>
      </div>
    </div>
  </ModalBase>
</template>

<script setup>
import { ref } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import { langVN as lang } from "../locales/vi";
import { NATIONALITIES } from "../data/constants";
import ModalBase from "./ModalBase.vue";
import AvatarEditor from "./AvatarEditor.vue";
import "../style/common.css";

const isVisible = ref(false);
const formData = ref({
  name: "",
  email: "",
  phone: "",
  citizenId: "",
  nationality: "",
  avatar: "",
});

const openModal = (guestName = "") => {
  formData.value = {
    name: guestName,
    email: "",
    phone: "",
    citizenId: "",
    nationality: "",
    avatar: "",
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
    avatar: "",
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
    avatar: formData.value.avatar,
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
.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 550px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

/* PC: Larger modal for avatar display */
@media (min-width: 768px) {
  .modal-container {
    max-width: 800px;
  }
}

.guest-form-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: flex-start;
}

/* PC: 2 columns layout */
@media (min-width: 768px) {
  .guest-form-wrapper {
    grid-template-columns: 350px 1fr;
  }
}

.guest-avatar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.avatar-label {
  align-self: flex-start;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.guest-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

<template>
  <ModalBase :is-visible="isVisible" modal-id="guest-modal" title="Tạo khách hàng mới" max-width="800px" @close="closeModal">
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

    <template #footer>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.confirmDialog?.cancel || "Hủy" }}</button>
        <button class="btn btn-primary" @click="submitGuest">{{ lang.guest?.create || "Thêm khách hàng" }}</button>
      </div>
    </template>
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
.modal-body {
  padding: 20px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #1988ff;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #ffffff;
  color: #000000;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: white;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>

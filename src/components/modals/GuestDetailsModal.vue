<template>
  <ModalBase :is-visible="isVisible" modal-id="guest-details-modal" max-width="800px" @close="closeModal">
    <template #title>
      <h3>{{ lang.get("guest.editGuestTitle") || "Chi tiết khách hàng" }}</h3>
    </template>

    <template #content>
      <div class="guest-form-wrapper">
        <!-- Photo Editor Component -->
        <PhotoEditor
          :avatar="formData.avatar"
          :canvas-width="250"
          :canvas-height="250"
          @update:avatar="
            (newAvatar) => {
              console.log('[GuestDetailsModal] PhotoEditor emitted:', newAvatar.substring(0, 50) + '...');
              formData.avatar = newAvatar;
              console.log('[GuestDetailsModal] avatar updated:', formData.avatar.substring(0, 50) + '...');
            }
          "
        />
        <!-- Right: Form Fields -->
        <div class="guest-form-section">
          <div class="form-group">
            <label>{{ lang.get("guest.citizenId") }}:<span class="required">*</span></label>
            <input v-model="formData.citizenId" type="text" class="input-field" :placeholder="lang.get('guest.citizenId')" />
          </div>

          <div class="form-group">
            <label>{{ lang.get("guest.name") }}:<span class="required">*</span></label>
            <input v-model="formData.name" type="text" class="input-field" :placeholder="lang.get('guest.name')" />
          </div>

          <div class="form-group">
            <label>{{ lang.get("guest.email") }}:</label>
            <input v-model="formData.email" type="email" class="input-field" :placeholder="lang.get('guest.email')" />
          </div>

          <div class="form-group">
            <label>{{ lang.get("guest.phone") }}:</label>
            <input v-model="formData.phone" type="text" class="input-field" :placeholder="lang.get('guest.phone')" />
          </div>

          <div class="form-group">
            <label>{{ lang.get("guest.nationality") }}:</label>
            <select v-model="formData.nationality" class="input-field">
              <option value="">-- Chọn quốc tịch --</option>
              <option v-for="nat in NATIONALITIES" :key="nat.code" :value="nat.name">
                {{ nat.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="submitGuest" :disabled="isSubmitting">
        {{ isSubmitting ? "Đang lưu..." : lang.get("guests.update") }}
      </button>
    </template>
  </ModalBase>

  <MessageModal ref="messageModalRef" />
</template>

<script setup>
import { ref } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { NATIONALITIES } from "../../data/constants";
import { updateGuest } from "../../services/guestService";
import ModalBase from "./ModalBase.vue";
import PhotoEditor from "./PhotoEditor.vue";
import MessageModal from "./MessageModal.vue";
import "../../style/common.css";

const isVisible = ref(false);
const isSubmitting = ref(false);
const messageModalRef = ref(null);
const currentGuestId = ref(null);

const formData = ref({
  name: "",
  email: "",
  phone: "",
  citizenId: "",
  nationality: "",
  avatar: "",
});

const openModal = (guest) => {
  if (!guest) return;

  currentGuestId.value = guest.id;
  formData.value = {
    name: guest.name || "",
    email: guest.email || "",
    phone: guest.phone || "",
    citizenId: guest.citizenId || "",
    nationality: guest.nationality || "",
    avatar: guest.avatar || "",
  };
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  currentGuestId.value = null;
  formData.value = {
    name: "",
    email: "",
    phone: "",
    citizenId: "",
    nationality: "",
    avatar: "",
  };
};

const submitGuest = async () => {
  if (!formData.value.name.trim()) {
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: lang.get("guest.nameRequired"),
      buttonText: lang.get("common.close"),
    });
    return;
  }

  if (!formData.value.citizenId.trim()) {
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: lang.get("guest.citizenIdRequired"),
      buttonText: lang.get("common.close"),
    });
    return;
  }

  if (formData.value.citizenId.trim().length < 5) {
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: lang.get("guest.citizenIdMinLength"),
      buttonText: lang.get("common.close"),
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const updatedGuestData = {
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      citizenId: formData.value.citizenId,
      nationality: formData.value.nationality,
      avatar: formData.value.avatar,
    };

    // Call API to update guest
    const updatedGuest = await updateGuest(currentGuestId.value, updatedGuestData);

    console.log("[GuestDetailsModal] Guest updated successfully:", updatedGuest);
    await messageModalRef.value.show({
      title: lang.get("common.success"),
      message: lang.get("guests.updateSuccess") || "Cập nhật khách hàng thành công",
      buttonText: lang.get("common.close"),
    });
    closeModal();
  } catch (error) {
    console.error("[GuestDetailsModal] Error updating guest:", error);
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: lang.get("guests.updateError") || "Lỗi khi cập nhật khách hàng: " + error.message,
      buttonText: lang.get("common.close"),
    });
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
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

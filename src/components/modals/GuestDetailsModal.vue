<template>
  <ModalBase :is-visible="isVisible" modal-id="guest-details-modal" max-width="800px" @close="closeModal">
    <template #title>
      <h3>{{ isCreateMode ? lang.get("guest.create") || "Tạo khách hàng" : lang.get("guest.editGuestTitle") || "Chi tiết khách hàng" }}</h3>
    </template>

    <template #content>
      <div class="guest-form-wrapper">
        <!-- Form Fields -->
        <div class="form-content">
          <div class="form-group">
            <!-- Photo Editor / Avatar Display -->
            <label>{{ lang.get("guest.citizenIdCard") }}</label>
            <div class="avatar-container">
              <PhotoEditor
                v-if="isEditMode || isCreateMode"
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
              <AvatarSection v-else :guest-data="guestData" />
            </div>
          </div>

          <div class="sections-container">
            <div class="info-section">
              <h4>{{ lang.get("guest.info") || "Thông tin khách" }}</h4>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("guest.citizenId") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  v-model="formData.citizenId"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.citizenId }"
                  :placeholder="lang.get('guest.citizenId')"
                  @input="validationErrors.citizenId = false"
                />
                <div v-else class="view-field">{{ formData.citizenId }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("guest.name") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  v-model="formData.name"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.name }"
                  :placeholder="lang.get('guest.name')"
                  @input="validationErrors.name = false"
                />
                <div v-else class="view-field">{{ formData.name }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("guest.nationality") }}:</label>
                <select v-if="isEditMode || isCreateMode" v-model="formData.nationality" class="input-field">
                  <option v-for="nat in NATIONALITIES" :key="nat.code" :value="nat.name">
                    {{ nat.name }}
                  </option>
                </select>
                <div v-else class="view-field">{{ formData.nationality || "-" }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("guests.joinDate") }}:</label>
                <input type="text" class="input-field" :value="formatDate(formData.createdAt)" disabled />
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("guest.lastRentalDate") }}:</label>
                <input type="text" class="input-field" :value="formatDate(formData.lastRentalDate)" disabled />
              </div>
            </div>

            <div class="info-section">
              <h4>{{ lang.get("guest.contacts") || "Liên hệ" }}</h4>

              <template v-for="(contact, index) in formData.contacts" :key="index">
                <div class="contact-item">
                  <label class="contact-label">{{ contact.type }}</label>
                  <input v-if="isEditMode || isCreateMode" v-model="contact.value" type="text" class="input-field contact-value" :placeholder="`Nhập ${contact.type}`" />
                  <div v-else class="view-field contact-value">{{ contact.value }}</div>
                </div>
              </template>
            </div>
          </div>

          <div class="form-group">
            <label>{{ lang.get("guest.note") || "Ghi chú" }}:</label>
            <textarea v-if="isEditMode || isCreateMode" v-model="formData.note" class="input-field textarea-field" rows="4" :placeholder="lang.get('guest.note')" />
            <div v-else class="view-field textarea-view">{{ formData.note }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- View Mode Footer -->
      <template v-if="!isEditMode && !isCreateMode">
        <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.close") }}</button>
        <button class="btn btn-primary" @click="enterEditMode"><i class="material-icons">edit</i> {{ lang.get("common.edit") || "Chỉnh sửa" }}</button>
      </template>

      <!-- Edit Mode Footer -->
      <template v-else-if="isEditMode">
        <button class="btn btn-secondary" @click="cancelEdit" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
        <button class="btn btn-primary" @click="submitGuest" :disabled="isSubmitting">
          {{ isSubmitting ? "Đang lưu..." : lang.get("guests.update") }}
        </button>
      </template>

      <!-- Create Mode Footer -->
      <template v-else-if="isCreateMode">
        <button class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
        <button class="btn btn-primary btn-create" @click="submitGuest" :disabled="isSubmitting">
          {{ isSubmitting ? "Đang tạo..." : lang.get("guest.create") || "Tạo khách hàng" }}
        </button>
      </template>
    </template>
  </ModalBase>

  <MessageModal ref="messageModalRef" />
</template>

<script setup>
import { ref, computed } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { NATIONALITIES } from "../../data/constants";
import { updateGuest, createGuest } from "../../services/guestService";
import ModalBase from "./ModalBase.vue";
import PhotoEditor from "./PhotoEditor.vue";
import AvatarSection from "./AvatarSection.vue";
import MessageModal from "./MessageModal.vue";
import "../../style/common.css";

const isVisible = ref(false);
const isSubmitting = ref(false);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const messageModalRef = ref(null);
const currentGuestId = ref(null);
const originalGuestData = ref(null);
const validationErrors = ref({
  name: false,
  citizenId: false,
});

const formData = ref({
  name: "",
  email: "",
  phone: "",
  citizenId: "",
  nationality: "",
  avatar: "",
  createdAt: "",
  lastRentalDate: "",
  contacts: [
    { type: "Email", value: "" },
    { type: "Điện thoại", value: "" },
    { type: "Webchat", value: "" },
    { type: "Zalo", value: "" },
    { type: "Facebook", value: "" },
  ],
  note: "",
});

const openModal = (guest) => {
  if (!guest) {
    // Create mode - no guest data provided
    isCreateMode.value = true;
    isEditMode.value = false;
    currentGuestId.value = null;
    originalGuestData.value = null;
    formData.value = {
      name: "",
      email: "",
      phone: "",
      citizenId: "",
      nationality: "",
      avatar: "",
      createdAt: "",
      lastRentalDate: "",
      contacts: [
        { type: "Email", value: "" },
        { type: "Điện thoại", value: "" },
        { type: "Webchat", value: "" },
        { type: "Zalo", value: "" },
        { type: "Facebook", value: "" },
      ],
      note: "",
    };
    isVisible.value = true;
    return;
  }

  // Edit/View mode - guest data provided
  currentGuestId.value = guest.id;
  isCreateMode.value = false;

  // Initialize default contacts
  const defaultContacts = [
    { type: "Email", value: guest.email || "" },
    { type: "Điện thoại", value: guest.phone || "" },
    { type: "Webchat", value: "" },
    { type: "Zalo", value: "" },
    { type: "Facebook", value: "" },
  ];

  // Merge with existing contacts if any
  if (guest.contacts && Array.isArray(guest.contacts)) {
    guest.contacts.forEach((existingContact) => {
      const index = defaultContacts.findIndex((dc) => dc.type === existingContact.type);
      if (index !== -1) {
        defaultContacts[index].value = existingContact.value;
      }
    });
  }

  formData.value = {
    name: guest.name || "",
    email: guest.email || "",
    phone: guest.phone || "",
    citizenId: guest.citizenId || "",
    nationality: guest.nationality || "",
    avatar: guest.avatar || "",
    createdAt: guest.createdAt || "",
    lastRentalDate: guest.lastRentalDate || "",
    contacts: defaultContacts,
    note: guest.note || "",
  };

  // Store original data for cancel operation
  originalGuestData.value = JSON.parse(JSON.stringify(guest));
  isEditMode.value = false;
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  isEditMode.value = false;
  isCreateMode.value = false;
  currentGuestId.value = null;
  originalGuestData.value = null;
  validationErrors.value.name = false;
  validationErrors.value.citizenId = false;
  formData.value = {
    name: "",
    email: "",
    phone: "",
    citizenId: "",
    nationality: "",
    avatar: "",
    createdAt: "",
    lastRentalDate: "",
    contacts: [
      { type: "Email", value: "" },
      { type: "Điện thoại", value: "" },
      { type: "Webchat", value: "" },
      { type: "Zalo", value: "" },
      { type: "Facebook", value: "" },
    ],
    note: "",
  };
};

const enterEditMode = () => {
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  // Restore original data
  if (originalGuestData.value) {
    openModal(originalGuestData.value);
    isEditMode.value = false;
  }
};

const submitGuest = async () => {
  // Reset validation errors
  validationErrors.value.name = false;
  validationErrors.value.citizenId = false;

  // Check for validation errors
  let hasErrors = false;

  if (!formData.value.name.trim()) {
    validationErrors.value.name = true;
    hasErrors = true;
  }

  if (!formData.value.citizenId.trim()) {
    validationErrors.value.citizenId = true;
    hasErrors = true;
  }

  if (formData.value.citizenId.trim().length < 5 && formData.value.citizenId.trim()) {
    validationErrors.value.citizenId = true;
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Extract email and phone from contacts
    const emailContact = formData.value.contacts.find((c) => c.type === "Email");
    const phoneContact = formData.value.contacts.find((c) => c.type === "Điện thoại");

    const guestData = {
      name: formData.value.name,
      email: emailContact?.value || "",
      phone: phoneContact?.value || "",
      citizenId: formData.value.citizenId,
      nationality: formData.value.nationality,
      avatar: formData.value.avatar,
      contacts: formData.value.contacts.filter((c) => c.type && c.value),
      note: formData.value.note,
    };

    if (isCreateMode.value) {
      // Create new guest
      const createdGuest = await createGuest(guestData);
      console.log("[GuestDetailsModal] Guest created successfully:", createdGuest);
      await messageModalRef.value.show({
        title: lang.get("common.success"),
        message: lang.get("guest.created") || "Tạo khách hàng thành công",
        buttonText: lang.get("common.close"),
      });
      closeModal();
    } else {
      // Update existing guest
      const updatedGuestData = {
        ...guestData,
      };
      const updatedGuest = await updateGuest(currentGuestId.value, updatedGuestData);
      console.log("[GuestDetailsModal] Guest updated successfully:", updatedGuest);
      await messageModalRef.value.show({
        title: lang.get("common.success"),
        message: lang.get("guests.updateSuccess") || "Cập nhật khách hàng thành công",
        buttonText: lang.get("common.close"),
      });
      isEditMode.value = false;
      // Update original data with new data
      originalGuestData.value = JSON.parse(JSON.stringify(updatedGuest));
    }
  } catch (error) {
    console.error("[GuestDetailsModal] Error:", error);
    const errorMsg = isCreateMode.value ? lang.get("guest.createError") || "Lỗi khi tạo khách hàng" : lang.get("guests.updateError") || "Lỗi khi cập nhật khách hàng";
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: errorMsg + ": " + error.message,
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

const guestData = computed(() => ({
  imageUrl: formData.value.avatar,
  name: formData.value.name,
}));

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
};
</script>

<style scoped>
.guest-form-wrapper {
  display: flex;
  flex-direction: column;
}

.avatar-container {
  display: flex;
  justify-content: center;
  width: 250px;
}

.form-content {
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

.form-field-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  min-height: 40px;
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
  min-height: 40px;
  display: flex;
  align-items: center;
}

.input-field:disabled {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field.input-error {
  border-color: #ef4444;
  border-width: 1px;
}

.input-field.input-error:focus {
  border-color: #ef4444;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn i {
  font-size: 18px;
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

.btn-create {
  background: #10b981;
}

.btn-create:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
}

.sections-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .sections-container {
    grid-template-columns: 1fr;
  }
}

.contacts-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contacts-section h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-section h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.contact-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.contact-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  min-height: 40px;
}

.contact-value {
  flex: 1;
}

.contact-empty {
  color: #999;
  font-style: italic;
}

.textarea-field {
  resize: vertical;
  font-family: inherit;
  padding: 10px 12px;
  min-height: 100px;
}

.view-field {
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #dadada;
  border-radius: 6px;
  color: #000000;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  display: flex;
  align-items: center;
  min-height: 40px;
  box-sizing: border-box;
}

.textarea-view {
  min-height: 100px;
}
</style>

<template>
  <ModalBase :is-visible="isVisible" modal-id="room-details-modal" max-width="800px" @close="closeModal">
    <template #title>
      <h3>{{ isCreateMode ? lang.get("rooms.createRoom") || "Tạo phòng" : lang.get("rooms.editRoomTitle") || "Chi tiết phòng" }}</h3>
    </template>

    <template #content>
      <div class="room-form-wrapper">
        <div class="form-content">
          <div class="sections-container">
            <div class="info-section">
              <h4>{{ lang.get("rooms.info") || "Thông tin phòng" }}</h4>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.roomNumber") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  v-model="formData.number"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.number }"
                  :placeholder="lang.get('rooms.roomNumber')"
                  @input="validationErrors.number = false"
                />
                <div v-else class="view-field">{{ formData.number }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.type") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  v-model="formData.type"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.type }"
                  :placeholder="lang.get('rooms.type')"
                  @input="validationErrors.type = false"
                />
                <div v-else class="view-field">{{ formData.type }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.group") }}:</label>
                <input v-if="isEditMode || isCreateMode" v-model="formData.group" type="text" class="input-field" :placeholder="lang.get('rooms.group')" />
                <div v-else class="view-field">{{ formData.group || "-" }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.status") }}:</label>
                <div>
                  <span :class="`status-badge ${formData.status.toLowerCase()}`">{{ formData.status }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h4>{{ lang.get("rooms.pricing") || "Giá cả" }}</h4>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.priceHourly") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  :value="formatCurrency(formData.priceHourly)"
                  @input="(e) => (formData.priceHourly = parseCurrency(e.target.value))"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.priceHourly }"
                  :placeholder="lang.get('rooms.priceHourly')"
                  @blur="validationErrors.priceHourly = false"
                />
                <div v-else class="view-field">{{ formatCurrency(formData.priceHourly) }}</div>
              </div>

              <div class="form-field-item">
                <label class="field-label">{{ lang.get("rooms.priceDaily") }}:<span v-if="isEditMode || isCreateMode" class="required">*</span></label>
                <input
                  v-if="isEditMode || isCreateMode"
                  :value="formatCurrency(formData.priceDaily)"
                  @input="(e) => (formData.priceDaily = parseCurrency(e.target.value))"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': validationErrors.priceDaily }"
                  :placeholder="lang.get('rooms.priceDaily')"
                  @blur="validationErrors.priceDaily = false"
                />
                <div v-else class="view-field">{{ formatCurrency(formData.priceDaily) }}</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>{{ lang.get("rooms.description") || "Mô tả" }}:</label>
            <textarea v-if="isEditMode || isCreateMode" v-model="formData.description" class="input-field textarea-field" rows="4" :placeholder="lang.get('rooms.description')" />
            <div v-else class="view-field textarea-view">{{ formData.description }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- View Mode Footer -->
      <template v-if="!isEditMode && !isCreateMode">
        <div class="footer-actions">
          <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.close") }}</button>
          <div class="button-group">
            <button v-if="formData.status === 'Available'" class="btn btn-warning" @click="updateRoomStatus('Maintenance')" :disabled="isSubmitting">
              <i class="material-icons">build</i> {{ lang.get("rooms.startMaintenance") || "Bảo trì" }}
            </button>
            <button v-if="formData.status === 'Maintenance'" class="btn btn-success" @click="updateRoomStatus('Available')" :disabled="isSubmitting">
              <i class="material-icons">check_circle</i> {{ lang.get("rooms.maintenanceDone") || "Bảo trì xong" }}
            </button>
            <button class="btn btn-primary" @click="enterEditMode"><i class="material-icons">edit</i> {{ lang.get("common.edit") || "Chỉnh sửa" }}</button>
          </div>
        </div>
      </template>

      <!-- Edit Mode Footer -->
      <template v-else-if="isEditMode">
        <button class="btn btn-secondary" @click="cancelEdit" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
        <button class="btn btn-primary" @click="submitRoom" :disabled="isSubmitting">
          {{ isSubmitting ? "Đang lưu..." : lang.get("rooms.update") || "Cập nhật" }}
        </button>
      </template>

      <!-- Create Mode Footer -->
      <template v-else-if="isCreateMode">
        <button class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">{{ lang.get("common.cancel") }}</button>
        <button class="btn btn-primary btn-create" @click="submitRoom" :disabled="isSubmitting">
          {{ isSubmitting ? "Đang tạo..." : lang.get("rooms.createRoom") || "Tạo phòng" }}
        </button>
      </template>
    </template>
  </ModalBase>

  <MessageModal ref="messageModalRef" />
</template>

<script setup>
import { ref } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { createRoom, updateRoom } from "../../services/roomService";
import { useCurrency } from "../../composables/useCurrency";
import ModalBase from "./ModalBase.vue";
import MessageModal from "./MessageModal.vue";
import "../../style/common.css";

const { formatCurrency, parseCurrency } = useCurrency();

const isVisible = ref(false);
const isSubmitting = ref(false);
const isEditMode = ref(false);
const isCreateMode = ref(false);
const messageModalRef = ref(null);
const currentRoomId = ref(null);
const originalRoomData = ref(null);

const validationErrors = ref({
  number: false,
  type: false,
  priceHourly: false,
  priceDaily: false,
});

const formData = ref({
  number: "",
  type: "",
  group: "",
  status: "",
  priceHourly: 0,
  priceDaily: 0,
  description: "",
});

const openModal = (room) => {
  if (!room) {
    // Create mode - no room data provided
    isCreateMode.value = true;
    isEditMode.value = false;
    currentRoomId.value = null;
    originalRoomData.value = null;
    formData.value = {
      number: "",
      type: "",
      group: "",
      status: "Available",
      priceHourly: 0,
      priceDaily: 0,
      description: "",
    };
    resetValidationErrors();
    isVisible.value = true;
    return;
  }

  // Edit/View mode - room data provided
  currentRoomId.value = room.id;
  isCreateMode.value = false;

  formData.value = {
    number: room.number || "",
    type: room.type || "",
    group: room.group || "",
    status: room.status || "Available",
    priceHourly: room.priceHourly || 0,
    priceDaily: room.priceDaily || 0,
    description: room.description || "",
  };

  // Store original data for cancel operation
  originalRoomData.value = JSON.parse(JSON.stringify(room));
  isEditMode.value = false;
  resetValidationErrors();
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  isEditMode.value = false;
  isCreateMode.value = false;
  currentRoomId.value = null;
  originalRoomData.value = null;
  resetValidationErrors();
  formData.value = {
    number: "",
    type: "",
    group: "",
    status: "Available",
    priceHourly: 0,
    priceDaily: 0,
    description: "",
  };
};

const resetValidationErrors = () => {
  validationErrors.value = {
    number: false,
    type: false,
    priceHourly: false,
    priceDaily: false,
  };
};

const enterEditMode = () => {
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  // Restore original data
  if (originalRoomData.value) {
    openModal(originalRoomData.value);
    isEditMode.value = false;
  }
};

const validateForm = () => {
  resetValidationErrors();
  let hasErrors = false;

  if (!formData.value.number.trim()) {
    validationErrors.value.number = true;
    hasErrors = true;
  }

  if (!formData.value.type) {
    validationErrors.value.type = true;
    hasErrors = true;
  }

  if (formData.value.priceHourly < 0) {
    validationErrors.value.priceHourly = true;
    hasErrors = true;
  }

  if (formData.value.priceDaily < 0) {
    validationErrors.value.priceDaily = true;
    hasErrors = true;
  }

  return !hasErrors;
};

const submitRoom = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const roomData = {
      number: formData.value.number,
      type: formData.value.type,
      group: formData.value.group,
      status: formData.value.status,
      priceHourly: formData.value.priceHourly,
      priceDaily: formData.value.priceDaily,
      description: formData.value.description,
    };

    if (isCreateMode.value) {
      // Create new room
      const createdRoom = await createRoom(roomData);
      console.log("[RoomDetailsModal] Room created successfully:", createdRoom);
      await messageModalRef.value.show({
        title: lang.get("common.success"),
        message: lang.get("rooms.created") || "Tạo phòng thành công",
        buttonText: lang.get("common.close"),
      });
      closeModal();
    } else {
      // Update existing room
      const updatedRoom = await updateRoom(currentRoomId.value, roomData);
      console.log("[RoomDetailsModal] Room updated successfully:", updatedRoom);
      await messageModalRef.value.show({
        title: lang.get("common.success"),
        message: lang.get("rooms.updated") || "Cập nhật phòng thành công",
        buttonText: lang.get("common.close"),
      });
      isEditMode.value = false;
      // Update original data with new data
      originalRoomData.value = JSON.parse(JSON.stringify(updatedRoom));
    }
  } catch (error) {
    console.error("[RoomDetailsModal] Error:", error);
    const errorMsg = isCreateMode.value ? lang.get("rooms.createError") || "Lỗi khi tạo phòng" : lang.get("rooms.updateError") || "Lỗi khi cập nhật phòng";
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

const updateRoomStatus = async (newStatus) => {
  isSubmitting.value = true;
  try {
    const roomData = {
      number: formData.value.number,
      type: formData.value.type,
      group: formData.value.group,
      status: newStatus,
      priceHourly: formData.value.priceHourly,
      priceDaily: formData.value.priceDaily,
      description: formData.value.description,
    };

    const updatedRoom = await updateRoom(currentRoomId.value, roomData);
    console.log("[RoomDetailsModal] Room status updated successfully:", updatedRoom);

    // Update local form data
    formData.value.status = newStatus;
    originalRoomData.value = JSON.parse(JSON.stringify(updatedRoom));

    const statusMsg = newStatus === "Maintenance" ? lang.get("rooms.maintenanceStarted") || "Bắt đầu bảo trì phòng" : lang.get("rooms.maintenanceDone") || "Bảo trì phòng thành công";
    await messageModalRef.value.show({
      title: lang.get("common.success"),
      message: statusMsg,
      buttonText: lang.get("common.close"),
    });
  } catch (error) {
    console.error("[RoomDetailsModal] Error updating status:", error);
    await messageModalRef.value.show({
      title: lang.get("common.error"),
      message: (lang.get("rooms.updateError") || "Lỗi khi cập nhật phòng") + ": " + error.message,
      buttonText: lang.get("common.close"),
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.room-form-wrapper {
  display: flex;
  flex-direction: column;
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
  font-family: inherit;
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

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-badge.available {
  background: #667eea;
  color: #ffffff;
}

.status-badge.booking {
  background: #10b981;
  color: #ffffff;
}

.status-badge.maintenance {
  background: #ef4444;
  color: #ffffff;
}

.status-badge.cleaning {
  background: #f59e0b;
  color: #ffffff;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
</style>

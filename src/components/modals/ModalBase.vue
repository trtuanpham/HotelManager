<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" :style="{ zIndex: modalZIndex }">
      <div class="modal-container" :style="{ maxWidth: maxWidth, maxHeight: maxHeight }">
        <div class="modal-header">
          <slot name="title"></slot>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="modal-body-wrapper">
          <slot name="content"></slot>
        </div>
        <div class="modal-footer-wrapper">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted, watch } from "vue";
import { useModalZIndex } from "../../composables/useModalZIndex";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  modalId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  maxWidth: {
    type: String,
    default: "1000px",
  },
  maxHeight: {
    type: String,
    default: "90vh",
  },
});

const emit = defineEmits(["close"]);

const { register, unregister, zIndex: modalZIndex } = useModalZIndex(props.modalId);

const handleClose = () => {
  emit("close");
};

onMounted(() => {
  if (props.isVisible) {
    register();
  }
});

onUnmounted(() => {
  unregister();
});

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      register();
    } else {
      unregister();
    }
  },
);
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
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h3,
.modal-header :deep(h3) {
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

.modal-body-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.modal-footer-wrapper {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: white;
  padding: 20px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* Modal Footer Buttons */
.modal-footer-wrapper .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.modal-footer-wrapper .btn-primary {
  background: #667eea;
  color: white;
}

.modal-footer-wrapper .btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modal-footer-wrapper .btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.modal-footer-wrapper .btn-secondary:hover {
  background: #d1d5db;
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.form-row .form-group {
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 12px;
}

.required {
  color: #ef4444;
}

.input-field {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #ffffff;
  color: #000000;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

select.input-field {
  background: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
  appearance: none;
  cursor: pointer;
}
</style>

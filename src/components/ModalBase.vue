<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" :style="{ zIndex: modalZIndex }" @click.self="handleClose">
      <div class="modal-container" :style="{ maxWidth: maxWidth, maxHeight: maxHeight }">
        <div v-if="title" class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="modal-body-wrapper">
          <slot></slot>
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
import { useModalZIndex } from "../composables/useModalZIndex";

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

.modal-body-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-footer-wrapper {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: white;
}
</style>

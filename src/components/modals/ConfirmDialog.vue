<template>
  <div v-if="isVisible" class="confirm-overlay">
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="cancel">×</button>
      </div>
      <div class="confirm-body">
        <p>{{ message }}</p>
      </div>
      <div class="confirm-footer">
        <button class="btn btn-secondary" @click="cancel">{{ cancelText }}</button>
        <button class="btn btn-primary" @click="confirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { langVN as lang } from "../../locales/vi";

const isVisible = ref(false);
const title = ref("");
const message = ref("");
const cancelText = ref("");
const confirmText = ref("");
let resolveCallback = null;

const show = (options) => {
  return new Promise((resolve) => {
    title.value = options.title || lang.confirmDialog.title;
    message.value = options.message || "";
    cancelText.value = options.cancelText || lang.confirmDialog.cancel;
    confirmText.value = options.confirmText || lang.confirmDialog.confirm;
    resolveCallback = resolve;
    isVisible.value = true;
  });
};

const confirm = () => {
  isVisible.value = false;
  if (resolveCallback) {
    resolveCallback(true);
  }
};

const cancel = () => {
  isVisible.value = false;
  if (resolveCallback) {
    resolveCallback(false);
  }
};

defineExpose({ show });
</script>

<style scoped>
.confirm-overlay {
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

.confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.confirm-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
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
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.confirm-body {
  padding: 20px;
  color: #666;
  font-size: 16px;
}

.confirm-body p {
  margin: 0;
  line-height: 1.5;
}

.confirm-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>

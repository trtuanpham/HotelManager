<template>
  <ModalBase :is-visible="isVisible" modal-id="message-modal" max-width="500px" @close="close">
    <template #title>
      <h3>{{ title }}</h3>
    </template>
    <template #content>
      <div class="message-body">
        <p>{{ message }}</p>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-primary" @click="close">{{ buttonText }}</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref } from "vue";
import { languageController as lang } from "../../controller/languageController";
import ModalBase from "./ModalBase.vue";

const isVisible = ref(false);
const title = ref("");
const message = ref("");
const buttonText = ref("");
let resolveCallback = null;

const show = (options) => {
  return new Promise((resolve) => {
    title.value = options.title || lang.get("common.message");
    message.value = options.message || "";
    buttonText.value = options.buttonText || lang.get("common.ok") || "OK";
    resolveCallback = resolve;
    isVisible.value = true;
  });
};

const close = () => {
  isVisible.value = false;
  if (resolveCallback) {
    resolveCallback(true);
  }
};

defineExpose({ show });
</script>

<style scoped>
.message-body {
  padding: 16px 0;
  color: #666;
  font-size: 14px;
}

.message-body p {
  margin: 0;
  line-height: 1.6;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>

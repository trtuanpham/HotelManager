<template>
  <!-- Image Crop Modal -->
  <ModalBase :is-visible="isVisible" modal-id="crop-modal" max-width="600px" @close="onClose">
    <template #title>
      <h3>{{ lang.get("common.crop") || "Cắt hình" }}</h3>
    </template>

    <template #content>
      <ImageCropper ref="cropper" :target-image="targetImage" :canvas-width="350" :canvas-height="221" :crop-width="200" :crop-height="200" @crop-complete="onCropComplete" />
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="onClose">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="confirmCrop">{{ lang.get("common.ok") || "OK" }}</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { languageController as lang } from "../../controller/languageController";
import ModalBase from "./ModalBase.vue";
import ImageCropper from "../ImageCropper.vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  targetImage: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close", "confirm"]);

const cropper = ref(null);
const croppedImage = ref(null);

const onCropComplete = (imageData) => {
  croppedImage.value = imageData;
  emit("confirm", croppedImage.value);
  onClose();
};

const onClose = () => {
  croppedImage.value = null;
  emit("close");
};

const confirmCrop = () => {
  if (cropper.value) {
    cropper.value.cropImage();
  }
};
</script>

<style scoped>
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

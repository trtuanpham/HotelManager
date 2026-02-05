<template>
  <div class="guest-avatar-section">
    <label class="avatar-label">{{ lang.get("guest.citizenIdCard") }}</label>
    <div
      class="avatar-preview"
      @click="triggerFileUpload"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ dragging: isDragging }"
    >
      <img v-if="avatar" :src="avatar" alt="Guest Avatar" class="avatar-img" />
      <div v-else class="avatar-placeholder">
        <i class="material-icons add-icon">add_a_photo</i>
      </div>
    </div>
    <div class="avatar-buttons">
      <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleFileUpload" />
    </div>

    <!-- Crop Image Modal -->
    <CropImageModal :is-visible="isModalVisible" :target-image="inputImage" :canvas-width="canvasWidth" :canvas-height="canvasHeight" @close="closeModal" @confirm="handleCropConfirm" />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import { languageController as lang } from "../../controller/languageController";
import CropImageModal from "./CropImageModal.vue";
import "@material-design-icons/font";

const props = defineProps({
  avatar: {
    type: String,
    default: "",
  },
  canvasWidth: {
    type: Number,
    default: 350,
  },
  canvasHeight: {
    type: Number,
    default: 221,
  },
});

const emit = defineEmits(["update:avatar"]);

const fileInputRef = ref(null);
const isDragging = ref(false);
const isModalVisible = ref(false);
const inputImage = ref(null);

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      inputImage.value = e.target?.result || "";
      isModalVisible.value = true;
    };
    reader.readAsDataURL(file);
  }
  event.target.value = "";
};

const closeModal = () => {
  isModalVisible.value = false;
  inputImage.value = null;
};

const handleCropConfirm = (croppedImage) => {
  emit("update:avatar", croppedImage);
  closeModal();
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result || "";
        console.log("[PhotoEditor] Drop - emitting avatar:", imageData.substring(0, 50) + "...");
        inputImage.value = imageData;
        isModalVisible.value = true;
      };
      reader.readAsDataURL(file);
    }
  }
};

const handlePaste = (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result || "";
          inputImage.value = imageData;
          isModalVisible.value = true;
        };
        reader.readAsDataURL(file);
      }
      break;
    }
  }
};

const openWebcam = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Create video element
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Create canvas with passport photo dimensions (landscape)
    const canvas = document.createElement("canvas");
    canvas.width = 856; // 8.56cm (1:1 DPI)
    canvas.height = 540; // 5.398cm (1:1 DPI)

    // Wait for video to load
    video.onloadedmetadata = () => {
      const ctx = canvas.getContext("2d");

      // Center crop the video to fit canvas
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;

      let sourceX, sourceY, sourceWidth, sourceHeight;

      if (videoAspect > canvasAspect) {
        // Video is wider, crop sides
        sourceHeight = video.videoHeight;
        sourceWidth = sourceHeight * canvasAspect;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Video is taller, crop top/bottom
        sourceWidth = video.videoWidth;
        sourceHeight = sourceWidth / canvasAspect;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      ctx?.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      emit("update:avatar", canvas.toDataURL("image/jpeg"));

      // Stop stream
      stream.getTracks().forEach((track) => track.stop());
    };
  } catch (error) {
    alert("Không thể truy cập webcam. Vui lòng kiểm tra quyền truy cập.");
    console.error("Webcam error:", error);
  }
};

onMounted(() => {
  document.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>

<style scoped>
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

.avatar-preview {
  width: 100%;
  height: auto;
  aspect-ratio: v-bind("canvasWidth / canvasHeight");
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-preview:hover {
  border-color: #667eea;
  background: #f0f3ff;
}

.avatar-preview.dragging {
  border-color: #667eea;
  background: #e8ecf9;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* PC: Fixed width and height with correct aspect ratio */
@media (min-width: 768px) {
  .avatar-preview {
    width: v-bind("canvasWidth + 'px'");
    height: auto;
    aspect-ratio: v-bind("canvasWidth / canvasHeight");
    min-height: v-bind("canvasHeight + 'px'");
  }
}

/* Mobile: Full width with aspect ratio */
@media (max-width: 767px) {
  .avatar-preview {
    width: 100%;
    height: auto;
    aspect-ratio: 8.56 / 5.398;
    min-height: 150px;
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 48px;
  color: #d1d5db;
  opacity: 0.4;
}

.avatar-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
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

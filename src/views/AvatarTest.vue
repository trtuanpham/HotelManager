<template>
  <div class="avatar-test-container">
    <h1>Công cụ cắt Avatar</h1>
    <p class="description">Chọn hình ảnh → Kéo để căn chỉnh → Bấm "Cắt" để lấy kết quả</p>

    <div class="input-section">
      <button @click="selectImageFile" class="btn btn-upload">📁 Select Image</button>
      <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" style="display: none" />
    </div>

    <!-- Component cắt avatar -->
    <ImageCropper ref="cropper" :canvas-width="500" :canvas-height="300" :crop-width="200" :crop-height="200" :target-image="inputImage" :allow-zoom="true" @crop-complete="onCropComplete" />

    <!-- Photo Editor Component -->
    <div class="section-divider">
      <h2>Photo Editor</h2>
    </div>
    <PhotoEditor :avatar="photoEditorAvatar" :canvas-width="300" :canvas-height="300" @update:avatar="photoEditorAvatar = $event" />

    <!-- Hiển thị kết quả -->
    <div v-if="finalImage" class="final-result">
      <h2>Avatar cuối cùng:</h2>
      <img :src="finalImage" alt="Final Avatar" class="final-avatar" />
      <p class="success-message">✅ Cắt thành công!</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import ImageCropper from "../components/ImageCropper.vue";
import PhotoEditor from "../components/modals/PhotoEditor.vue";

export default {
  name: "AvatarTest",
  components: {
    ImageCropper,
    PhotoEditor,
  },
  setup() {
    const cropper = ref(null);
    const fileInput = ref(null);
    const finalImage = ref(null);
    const inputImage = ref(null);
    const photoEditorAvatar = ref("");

    const selectImageFile = () => {
      fileInput.value.click();
    };

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          inputImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      // Reset file input so same file can be selected again
      event.target.value = "";
    };

    const onCropComplete = (imageData) => {
      finalImage.value = imageData;
    };

    return {
      cropper,
      fileInput,
      finalImage,
      inputImage,
      photoEditorAvatar,
      selectImageFile,
      onFileChange,
      onCropComplete,
    };
  },
};
</script>

<style scoped>
.avatar-test-container {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 10px;
  font-size: 28px;
}

.description {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
  font-size: 14px;
  line-height: 1.6;
}

.input-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.btn-upload {
  padding: 12px 32px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-upload:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.btn-upload:active {
  transform: translateY(0);
}

.final-result {
  margin-top: 50px;
  padding: 30px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e0e7ff;
}

.section-divider {
  margin-top: 60px;
  margin-bottom: 30px;
  padding-top: 30px;
  border-top: 2px solid #e5e7eb;
  text-align: center;
}

.section-divider h2 {
  color: #374151;
  font-size: 24px;
  margin: 0;
}

.final-result h2 {
  color: #1f2937;
  margin-bottom: 20px;
  font-size: 20px;
}

.final-avatar {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

.success-message {
  color: #10b981;
  font-size: 16px;
  font-weight: 600;
  margin-top: 15px;
}
</style>

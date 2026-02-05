<template>
  <div class="avatar-cropper-container">
    <div class="crop-area">
      <!-- Canvas for displaying and cropping image -->
      <canvas ref="canvas" class="crop-canvas" @mousedown="startDrag" @mousemove="drag" @mouseup="stopDrag" @touchstart="startDrag" @touchmove="drag" @touchend="stopDrag"></canvas>

      <!-- Crop frame (square) in center -->
      <div class="crop-frame"></div>
    </div>

    <!-- Control buttons -->
    <!-- <div class="controls">
      <button @click="selectImage" class="btn btn-upload">📁 Add Image</button>
      <button @click="resetImage" class="btn btn-secondary">Reset</button>
      <button @click="cropImage" class="btn btn-primary">Crop</button>
    </div> -->

    <!-- Scale slider -->
    <div v-if="allowZoom" class="scale-slider-container">
      <span class="scale-label">Zoom:</span>
      <input type="range" v-model.number="scaleValue" min="1" max="2" step="0.1" class="scale-slider" @input="updateScaleFromSlider" />
      <span class="scale-display">{{ scaleValue.toFixed(1) }}x</span>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";

export default {
  name: "ImageCropper",
  props: {
    allowOutsideCrop: {
      type: Boolean,
      default: false, // Allow crop outside image area by default
    },
    allowZoom: {
      type: Boolean,
      default: true, // Allow zoom by default
    },
    cropWidth: {
      type: Number,
      default: 300, // Crop frame width
    },
    cropHeight: {
      type: Number,
      default: 200, // Crop frame height
    },
    canvasWidth: {
      type: Number,
      default: 500, // Canvas width
    },
    canvasHeight: {
      type: Number,
      default: 300, // Canvas height
    },
    targetImage: {
      type: String,
      default: null, // Target image URL or data string
    },
  },
  emits: ["crop-complete"],
  setup(props, { emit }) {
    // Destructure props for template access
    const allowZoom = props.allowZoom;
    const allowOutsideCropValue = ref(props.allowOutsideCrop);

    const canvas = ref(null);
    const fileInput = ref(null);
    const scaleValue = ref(1); // Default scale 1x, range from 1 to 2

    // Configuration from props
    const CROP_WIDTH = props.cropWidth;
    const CROP_HEIGHT = props.cropHeight;
    const CANVAS_WIDTH = props.canvasWidth;
    const CANVAS_HEIGHT = props.canvasHeight;

    // State
    let image = new Image();
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let imageOffsetX = 0; // X position of image
    let imageOffsetY = 0; // Y position of image
    let imageScale = 1; // Scale ratio for zoom

    // Calculate crop frame position in center of canvas
    const cropFrameX = computed(() => (CANVAS_WIDTH - CROP_WIDTH) / 2);
    const cropFrameY = computed(() => (CANVAS_HEIGHT - CROP_HEIGHT) / 2);

    // Initialize Canvas
    const initCanvas = () => {
      const ctx = canvas.value.getContext("2d");
      canvas.value.width = CANVAS_WIDTH;
      canvas.value.height = CANVAS_HEIGHT;

      // Draw background
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bright area (in crop frame)
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(cropFrameX.value, cropFrameY.value, CROP_WIDTH, CROP_HEIGHT);
      ctx.clearRect(cropFrameX.value, cropFrameY.value, CROP_WIDTH, CROP_HEIGHT);

      // Draw image
      if (image.src) {
        ctx.drawImage(image, imageOffsetX, imageOffsetY);
      }
    };

    // Redraw Canvas
    const redrawCanvas = () => {
      const ctx = canvas.value.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw dark background
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw image
      if (image.src) {
        // Draw full image first
        ctx.drawImage(image, imageOffsetX, imageOffsetY, image.width * imageScale, image.height * imageScale);

        // Draw dark overlay on area outside crop frame
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        // Top part
        ctx.fillRect(0, 0, CANVAS_WIDTH, cropFrameY.value);
        // Bottom part
        ctx.fillRect(0, cropFrameY.value + CROP_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - (cropFrameY.value + CROP_HEIGHT));
        // Left part
        ctx.fillRect(0, cropFrameY.value, cropFrameX.value, CROP_HEIGHT);
        // Right part
        ctx.fillRect(cropFrameX.value + CROP_WIDTH, cropFrameY.value, CANVAS_WIDTH - (cropFrameX.value + CROP_WIDTH), CROP_HEIGHT);
      }

      // Draw crop frame
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropFrameX.value, cropFrameY.value, CROP_WIDTH, CROP_HEIGHT);
    };

    // Handle file selection
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          image.src = e.target.result;
          image.onload = () => {
            // Reset position
            resetImage();
          };
        };
        reader.readAsDataURL(file);
      }
    };

    // Start dragging image
    const startDrag = (event) => {
      event.preventDefault();
      isDragging = true;
      const rect = canvas.value.getBoundingClientRect();
      const clientX = event.touches?.[0]?.clientX || event.clientX;
      const clientY = event.touches?.[0]?.clientY || event.clientY;
      dragStartX = clientX - rect.left;
      dragStartY = clientY - rect.top;

      // Add document listeners to continue dragging when mouse leaves canvas
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag);
      document.addEventListener("mouseup", stopDragGlobal);
      document.addEventListener("touchend", stopDragGlobal);
    };

    // Stop dragging (global)
    const stopDragGlobal = () => {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDragGlobal);
      document.removeEventListener("touchend", stopDragGlobal);
    };

    // Drag image
    const drag = (event) => {
      if (!isDragging) return;
      event.preventDefault();

      const rect = canvas.value.getBoundingClientRect();
      const clientX = event.touches?.[0]?.clientX || event.clientX;
      const clientY = event.touches?.[0]?.clientY || event.clientY;
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      // Calculate new offset
      const deltaX = currentX - dragStartX;
      const deltaY = currentY - dragStartY;

      imageOffsetX += deltaX;
      imageOffsetY += deltaY;

      // Limit dragging - image must always show at least 50% in crop frame
      const scaledWidth = image.width * imageScale;
      const scaledHeight = image.height * imageScale;

      // Image cannot be dragged too far - only 50% remains visible
      const maxOffsetX = cropFrameX.value + CROP_WIDTH * 0.5;
      const maxOffsetY = cropFrameY.value + CROP_HEIGHT * 0.5;
      const minOffsetX = cropFrameX.value - scaledWidth + CROP_WIDTH * 0.5;
      const minOffsetY = cropFrameY.value - scaledHeight + CROP_HEIGHT * 0.5;

      imageOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, imageOffsetX));
      imageOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, imageOffsetY));

      dragStartX = currentX;
      dragStartY = currentY;

      redrawCanvas();
    };

    // Stop dragging
    const stopDrag = () => {
      isDragging = false;
    };

    // Reset image
    const resetImage = () => {
      if (!image.src) return;

      // Calculate scale to fit image in frame
      const scaleX = CROP_WIDTH / image.width;
      const scaleY = CROP_HEIGHT / image.height;
      imageScale = Math.max(scaleX, scaleY) * scaleValue.value;

      // Position image in center of frame
      imageOffsetX = cropFrameX.value + (CROP_WIDTH - image.width * imageScale) / 2;
      imageOffsetY = cropFrameY.value + (CROP_HEIGHT - image.height * imageScale) / 2;

      redrawCanvas();
    };

    // Update scale when slider changes
    const updateScaleFromSlider = () => {
      if (!image.src) return;

      // Calculate center position of crop frame in original image space (before zoom)
      const cropCenterImageX = (cropFrameX.value + CROP_WIDTH / 2 - imageOffsetX) / imageScale;
      const cropCenterImageY = (cropFrameY.value + CROP_HEIGHT / 2 - imageOffsetY) / imageScale;

      // Calculate base scale and new scale
      const scaleX = CROP_WIDTH / image.width;
      const scaleY = CROP_HEIGHT / image.height;
      const baseScale = Math.max(scaleX, scaleY);
      imageScale = baseScale * scaleValue.value;

      // Adjust offset to keep crop frame center point fixed when zooming
      imageOffsetX = cropFrameX.value + CROP_WIDTH / 2 - cropCenterImageX * imageScale;
      imageOffsetY = cropFrameY.value + CROP_HEIGHT / 2 - cropCenterImageY * imageScale;

      redrawCanvas();
    };

    // Crop image
    const cropImage = () => {
      if (!image.src) {
        alert("Vui lòng chọn hình ảnh");
        return;
      }

      // Create temporary canvas for cropping
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = CROP_WIDTH;
      tempCanvas.height = CROP_HEIGHT;
      const ctx = tempCanvas.getContext("2d");

      // Calculate crop position from original image
      const sourceX = (cropFrameX.value - imageOffsetX) / imageScale;
      const sourceY = (cropFrameY.value - imageOffsetY) / imageScale;
      const sourceWidth = CROP_WIDTH / imageScale;
      const sourceHeight = CROP_HEIGHT / imageScale;

      if (allowOutsideCropValue.value) {
        // Allow crop outside image area - background will be transparent
        ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, CROP_WIDTH, CROP_HEIGHT);
      } else {
        // Only crop within image bounds - fill white background for outside areas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);

        // Calculate actual crop part within original image bounds
        let cropSourceX = sourceX;
        let cropSourceY = sourceY;
        let cropSourceWidth = sourceWidth;
        let cropSourceHeight = sourceHeight;

        // Calculate position to draw on result canvas
        let destX = 0;
        let destY = 0;

        // Handle left/right parts
        if (cropSourceX < 0) {
          destX = -cropSourceX * imageScale;
          cropSourceWidth += cropSourceX; // reduce width
          cropSourceX = 0;
        }
        if (cropSourceX + cropSourceWidth > image.width) {
          cropSourceWidth = image.width - cropSourceX;
        }

        // Handle top/bottom parts
        if (cropSourceY < 0) {
          destY = -cropSourceY * imageScale;
          cropSourceHeight += cropSourceY; // reduce height
          cropSourceY = 0;
        }
        if (cropSourceY + cropSourceHeight > image.height) {
          cropSourceHeight = image.height - cropSourceY;
        }

        // Draw image part within bounds
        if (cropSourceWidth > 0 && cropSourceHeight > 0) {
          ctx.drawImage(image, cropSourceX, cropSourceY, cropSourceWidth, cropSourceHeight, destX, destY, cropSourceWidth * imageScale, cropSourceHeight * imageScale);
        }
      }

      // Save result
      emit("crop-complete", tempCanvas.toDataURL("image/png"));
    };

    // Open file picker
    const selectImage = () => {
      fileInput.value.click();
    };

    onMounted(() => {
      initCanvas();
      // Load target image if provided
      if (props.targetImage) {
        image.src = props.targetImage;
        image.onload = () => {
          resetImage();
        };
      }
    });

    // Watch for changes to targetImage prop
    watch(
      () => props.targetImage,
      (newImage) => {
        if (newImage) {
          image.src = newImage;
          image.onload = () => {
            resetImage();
          };
        }
      },
    );

    return {
      canvas,
      fileInput,
      allowOutsideCropValue,
      allowZoom,
      scaleValue,
      cropWidth: props.cropWidth,
      cropHeight: props.cropHeight,
      canvasWidth: props.canvasWidth,
      canvasHeight: props.canvasHeight,
      startDrag,
      drag,
      stopDrag,
      stopDragGlobal,
      handleFileSelect,
      resetImage,
      cropImage,
      selectImage,
      updateScaleFromSlider,
    };
  },
};
</script>

<style scoped>
.avatar-cropper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.crop-area {
  position: relative;
  width: v-bind("canvasWidth + 'px'");
  height: v-bind("canvasHeight + 'px'");
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crop-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: move;
}

.crop-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  width: v-bind("cropWidth + 'px'");
  height: v-bind("cropHeight + 'px'");
  transform: translate(-50%, -50%);
  border-radius: 8px;
  pointer-events: none;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.scale-slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.scale-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.scale-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  transition: background 0.2s ease;
}

.scale-slider::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.scale-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

.scale-slider::-moz-range-thumb:hover {
  background: #2563eb;
}

.scale-display {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  min-width: 40px;
  text-align: right;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-upload {
  background-color: #10b981;
  color: white;
}

.btn-upload:hover {
  background-color: #059669;
}
</style>

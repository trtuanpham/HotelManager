<template>
  <teleport to="body">
    <div v-if="isVisible" class="modal-overlay" :style="{ zIndex: modalZIndex }" @click.self="handleClose">
      <slot></slot>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted } from "vue";
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

// Watch for visibility changes
import { watch } from "vue";
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
</style>

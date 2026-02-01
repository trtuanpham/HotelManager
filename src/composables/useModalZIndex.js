import { ref, computed } from "vue";

const BASE_Z_INDEX = 1000;
const modalStack = ref([]);

export function useModalZIndex(modalId) {
  const register = () => {
    if (!modalStack.value.includes(modalId)) {
      modalStack.value.push(modalId);
    }
  };

  const unregister = () => {
    const index = modalStack.value.indexOf(modalId);
    if (index > -1) {
      modalStack.value.splice(index, 1);
    }
  };

  const zIndex = computed(() => {
    const index = modalStack.value.indexOf(modalId);
    return index === -1 ? BASE_Z_INDEX : BASE_Z_INDEX + index;
  });

  return {
    register,
    unregister,
    zIndex,
  };
}

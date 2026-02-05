<template>
  <svg class="icon" :style="{ color }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
</template>

<script setup>
defineProps({
  color: String,
});
</script>

<style scoped>
.icon {
  display: inline-flex;
  width: 12px;
  height: 12px;
}
</style>

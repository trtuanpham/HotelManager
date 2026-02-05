<template>
  <svg class="icon" :style="{ color }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
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
}
</style>

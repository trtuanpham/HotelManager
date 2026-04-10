<template>
  <div class="avatar-view">
    <img v-if="guestData?.imageUrl" :src="guestData.imageUrl" alt="Avatar" class="avatar-image" />
    <div v-else class="avatar-placeholder">
      {{ getInitials(guestData?.name) }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  guestData: {
    type: Object,
    required: true,
  },
  label: {
    type: String,
    default: "Avatar",
  },
});

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
</script>

<style scoped>
.avatar-view {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  /* 🔥 KHAI BÁO CONTAINER */
  container-type: size;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-weight: 800;
  line-height: 1;

  /* 🔥 LUÔN = 1/2 CẠNH AVATAR */
  font-size: 50cqw;
}
</style>

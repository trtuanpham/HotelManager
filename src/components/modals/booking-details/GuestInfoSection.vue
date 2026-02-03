<template>
  <div class="details-section">
    <div class="accompanied-header">
      <h4 class="section-title">{{ lang.get("booking.guestTitleInfo") }}</h4>
      <button class="edit-toggle-btn" @click="isEditMode = !isEditMode">
        {{ isEditMode ? lang.get("common.close") : lang.get("common.edit") }}
      </button>
    </div>

    <div class="guests-grid">
      <!-- Loading State -->
      <template v-if="isLoadingGuests">
        <div v-for="i in 2" :key="`skeleton-${i}`" class="guest-card skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-name"></div>
          <div class="skeleton-detail"></div>
        </div>
      </template>
      <!-- Accompanying Guest Cards -->
      <template v-else>
        <div v-for="guestId in accompaniedGuestIds" :key="guestId" class="guest-card">
          <div class="guest-card-avatar">
            <img :src="getGuestAvatar(guestId)" alt="Guest" class="guest-card-img" />
          </div>
          <div class="guest-card-info">
            <div class="guest-card-name">{{ getGuestName(guestId) }}</div>
            <small class="guest-card-detail">ID: {{ getGuestCitizenId(guestId) }}</small>
          </div>
          <button v-if="isEditMode" type="button" class="remove-btn" @click="removeGuest(guestId)">×</button>
        </div>
      </template>
    </div>

    <div v-if="accompaniedGuestIds.length === 0 && !isLoadingGuests" class="empty-message">{{ lang.get("booking.noGuests") }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { languageController as lang } from "../../../controller/languageController";
import { DEFAULT_AVATAR_SVG } from "../../../data/constants";
import { getAllGuests, getGuestById } from "../../../services/guestService";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["remove-guest"]);

const isEditMode = ref(false);
const isLoadingGuests = ref(false);
const loadedGuestData = ref({});

// Computed property to get accompanied guest IDs (all except first/main guest)
const accompaniedGuestIds = computed(() => {
  if (!props.booking?.guestIds || props.booking.guestIds.length <= 1) return [];
  return props.booking.guestIds.slice(1);
});

// Load detailed guest data for each accompanied guest
const loadGuestDetails = async (guestId) => {
  if (!guestId) return;
  if (loadedGuestData.value[guestId]) {
    console.log("Guest data already cached:", guestId);
    return;
  }

  try {
    console.log("Fetching guest data for:", guestId);
    const guestData = await getGuestById(guestId);
    console.log("Loaded guest data:", guestId, guestData);
    if (guestData) {
      loadedGuestData.value[guestId] = guestData;
    } else {
      console.warn("No data returned for guest:", guestId);
    }
  } catch (err) {
    console.error(`Failed to load guest ${guestId}:`, err);
  }
};

// Get guest data (from loaded data or props)
const getGuestData = (guestId) => {
  const data = loadedGuestData.value[guestId];
  console.log("Getting guest data for", guestId, ":", data);
  return data;
};

const removeGuest = (guestId) => {
  emit("remove-guest", guestId);
};

const getGuestAvatar = (guestId) => {
  const guest = getGuestData(guestId);
  return guest?.imageUrl || DEFAULT_AVATAR_SVG;
};

const getGuestName = (guestId) => {
  const guest = getGuestData(guestId);
  return guest?.name || "---";
};

const getGuestCitizenId = (guestId) => {
  const guest = getGuestData(guestId);
  return guest?.citizenId || "---";
};

// Load guests on mount
onMounted(async () => {
  isLoadingGuests.value = true;
  try {
    await getAllGuests();
  } catch (err) {
    console.error("Failed to load guests:", err);
  } finally {
    isLoadingGuests.value = false;
  }
});

// Watch for changes in accompanied guests and load their details
watch(
  () => accompaniedGuestIds.value,
  async (newGuestIds) => {
    if (!newGuestIds || newGuestIds.length === 0) return;

    console.log("Loading guest details for:", newGuestIds);
    for (const guestId of newGuestIds) {
      console.log("Loading guest:", guestId);
      await loadGuestDetails(guestId);
    }
  },
  { immediate: true, deep: true },
);
</script>

<style scoped>
.details-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.accompanied-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.edit-toggle-btn {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.edit-toggle-btn:hover {
  background: #5568d3;
}

.guests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.guest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
  position: relative;
}

.guest-card-avatar {
  display: flex;
  justify-content: center;
}

.guest-card-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
}

.guest-card-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.guest-card-detail {
  font-size: 11px;
  color: #6b7280;
  display: block;
  line-height: 1.4;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.empty-message {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border: 1px solid #e5e7eb;
  cursor: default;
}

.skeleton-item:hover {
  transform: none;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  margin-bottom: 4px;
  animation: shimmer 2s infinite;
}

.skeleton-name {
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  width: 80%;
  margin-bottom: 6px;
  animation: shimmer 2s infinite;
  animation-delay: 0.1s;
}

.skeleton-detail {
  height: 11px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  width: 70%;
  animation: shimmer 2s infinite;
  animation-delay: 0.2s;
}
</style>

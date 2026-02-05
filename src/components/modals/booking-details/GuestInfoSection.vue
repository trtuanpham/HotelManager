<template>
  <div class="details-section">
    <div class="accompanied-header">
      <h4 class="section-title">{{ lang.get("booking.guestTitleInfo") }}</h4>
      <div class="header-actions">
        <button v-if="!isEditMode" class="edit-btn" @click="isEditMode = true">
          {{ lang.get("common.edit") }}
        </button>
        <button v-if="isEditMode" class="close-btn" @click="isEditMode = false">
          {{ lang.get("common.close") }}
        </button>
      </div>
    </div>

    <div class="guests-grid">
      <!-- Guest Cards with Loading States -->
      <template v-for="guestId in accompaniedGuestIds" :key="guestId">
        <!-- Loading Skeleton -->
        <div v-if="loadingGuestIds.has(guestId)" class="guest-card skeleton-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-name"></div>
          <div class="skeleton-detail"></div>
        </div>
        <!-- Loaded Guest Card -->
        <div v-else class="guest-card">
          <div class="guest-card-avatar">
            <img :src="getGuestData(guestId)?.imageUrl || DEFAULT_AVATAR_SVG" alt="Guest" class="guest-card-img" />
          </div>
          <div class="guest-card-info">
            <div class="guest-card-name">{{ getGuestData(guestId)?.name || "---" }}</div>
            <small class="guest-card-detail">ID: {{ getGuestData(guestId)?.citizenId || "---" }}</small>
          </div>
          <button v-if="isEditMode" type="button" class="remove-btn" @click="removeGuest(guestId)">×</button>
        </div>
      </template>

      <!-- Add Guest Button -->
      <button class="guest-card add-guest-btn" @click="showGuestSearchModal = true" title="Add guest">
        <div class="add-icon">+</div>
        <div class="add-text">{{ lang.get("common.add") }}</div>
      </button>
    </div>

    <div v-if="accompaniedGuestIds.length === 0" class="empty-message">{{ lang.get("booking.noGuests") }}</div>
  </div>

  <!-- Guest Search Modal -->
  <GuestSearchModal
    :is-open="showGuestSearchModal"
    :selected-guest-ids="props.booking?.guestIds || []"
    @close="showGuestSearchModal = false"
    @select-guest="addGuest"
    @guest-created="onGuestCreated"
  />

  <!-- Confirm Dialog -->
  <ConfirmDialog ref="confirmDialogRef" />
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { languageController as lang } from "../../../controller/languageController";
import { DEFAULT_AVATAR_SVG } from "../../../data/constants";
import { getGuestById, getAllGuests } from "../../../services/guestService";
import GuestSearchModal from "../GuestSearchModal.vue";
import ConfirmDialog from "../ConfirmDialog.vue";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["remove-guest"]);

const isEditMode = ref(false);
const loadingGuestIds = ref(new Set());
const loadedGuestData = ref({});
const showGuestSearchModal = ref(false);
const allGuests = ref([]);
const confirmDialogRef = ref(null);
const guestToRemove = ref(null);

// Computed property to get accompanied guest IDs (all guests)
const accompaniedGuestIds = computed(() => {
  if (!props.booking?.guestIds || props.booking.guestIds.length === 0) return [];
  return props.booking.guestIds;
});

// Load detailed guest data for each accompanied guest
const loadGuestDetails = async (guestId) => {
  if (!guestId) return;
  if (loadedGuestData.value[guestId]) {
    return;
  }

  loadingGuestIds.value.add(guestId);
  try {
    const guestData = await getGuestById(guestId);
    if (guestData) {
      loadedGuestData.value[guestId] = guestData;
    }
  } catch (err) {
    console.error(`Failed to load guest ${guestId}:`, err);
  } finally {
    loadingGuestIds.value.delete(guestId);
  }
};

// Get guest data (from loaded data)
const getGuestData = (guestId) => {
  return loadedGuestData.value[guestId];
};

const removeGuest = (guestId) => {
  guestToRemove.value = guestId;
  confirmDialogRef.value
    ?.show({
      title: lang.get("booking.confirmTitleRemoveGuest"),
      message: lang.get("booking.confirmContentRemoveGuest"),
      cancelText: lang.get("common.cancel"),
      confirmText: lang.get("common.delete"),
    })
    .then((confirmed) => {
      if (confirmed) {
        confirmRemoveGuest();
      }
      guestToRemove.value = null;
    });
};

const confirmRemoveGuest = async () => {
  if (!guestToRemove.value || !props.booking) return;

  try {
    // Remove from local guestIds array
    const index = props.booking.guestIds.indexOf(guestToRemove.value);
    if (index > -1) {
      props.booking.guestIds.splice(index, 1);
    }

    // Remove from loaded data cache
    delete loadedGuestData.value[guestToRemove.value];

    // remove api

    // Emit event for parent to handle
    emit("remove-guest", guestToRemove.value);
  } catch (error) {
    console.error("Failed to remove guest:", error);
  }
};

const addGuest = (guestId) => {
  if (!props.booking) return;
  if (!props.booking.guestIds.includes(guestId)) {
    props.booking.guestIds.push(guestId);
    loadGuestDetails(guestId);
    showGuestSearchModal.value = false;
  }
};

const onGuestCreated = (newGuest) => {
  allGuests.value.push(newGuest);
  addGuest(newGuest.id);
};

// Load all guests for search when modal opens
watch(showGuestSearchModal, async (isOpen) => {
  if (isOpen && allGuests.value.length === 0) {
    try {
      const guests = await getAllGuests();
      allGuests.value = guests;
    } catch (err) {
      console.error("Failed to load guests:", err);
    }
  }
});

// Load guest details when booking data is received
watch(
  () => props.booking?.guestIds,
  async (guestIds) => {
    if (!guestIds || guestIds.length === 0) return;

    await Promise.all(guestIds.map((guestId) => loadGuestDetails(guestId)));
  },
  { immediate: true },
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

.header-actions {
  display: flex;
  gap: 8px;
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

.edit-btn,
.close-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5568d3;
}

.close-btn {
  background: #f97316;
  color: white;
}

.close-btn:hover {
  background: #ea580c;
}

.guests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 150px);
  gap: 12px;
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
  width: 150px;
  height: 150px;
  justify-content: center;
}

.guest-card-avatar {
  display: flex;
  justify-content: center;
}

.guest-card-img {
  width: 80px;
  height: 80px;
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
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
  padding: 0;
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

/* Add Guest Button */
.add-guest-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.add-guest-btn:hover {
  background: #e5e7eb;
  border-color: #667eea;
}

.add-icon {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.add-text {
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
}
</style>

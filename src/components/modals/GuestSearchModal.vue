<template>
  <ModalBase :is-visible="isOpen" modal-id="guest-search-modal" max-width="500px" max-height="800px" @close="closeModal">
    <template #title>
      <h3>{{ lang.get("common.selectGuest") }}</h3>
    </template>
    <template #content>
      <!-- Search Input with Icon -->
      <div class="search-container">
        <i class="material-icons search-icon">search</i>
        <input v-model="localSearchInput" type="text" :placeholder="lang.get('common.searchPlaceholder')" class="search-input" @keydown.enter="handleSearch" />
        <button class="btn-search" @click="handleSearch">
          <i class="material-icons">search</i>
        </button>
      </div>

      <!-- Search Results -->
      <div class="search-results">
        <div v-if="isSearching" class="loading-container">
          <div class="spinner"></div>
          <div class="loading-text">{{ lang.get("common.searching") || "Đang tìm kiếm..." }}</div>
        </div>
        <div v-else-if="localFilteredGuests.length === 0" class="no-results">
          <div>{{ localSearchInput ? lang.get("common.noGuestsFound") : lang.get("common.typeToSearch") }}</div>
          <button v-if="localSearchInput" class="btn btn-link" @click="openCreateGuestModal">+ {{ lang.get("common.newGuest") }}</button>
        </div>
        <div v-for="guest in localFilteredGuests" :key="guest.id" class="guest-result-item" @click="selectGuest(guest.id)">
          <img :src="guest.imageUrl || DEFAULT_AVATAR_SVG" :alt="guest.name" class="result-avatar" />
          <div class="result-info">
            <div class="result-name">{{ guest.name }}</div>
            <small class="result-detail">{{ guest.citizenId }}</small>
          </div>
          <div v-if="props.selectedGuestIds.includes(guest.id)" class="check-icon">
            <i class="material-icons">check</i>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="openCreateGuestModal">+ {{ lang.get("common.newGuest") }}</button>
    </template>
  </ModalBase>

  <!-- Create Guest Modal -->
  <CreateGuestModal ref="createGuestModal" @guest-created="onGuestCreated" />
</template>

<script setup>
import { ref, watch } from "vue";
import { languageController as lang } from "../../controller/languageController";
import { DEFAULT_AVATAR_SVG } from "../../data/constants";
import { searchGuests, getTopGuests } from "../../services/guestService";
import ModalBase from "./ModalBase.vue";
import CreateGuestModal from "./CreateGuestModal.vue";
import "@material-design-icons/font";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  searchInput: {
    type: String,
    required: true,
  },
  filteredGuests: {
    type: Array,
    required: true,
  },
  selectedGuestIds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "select-guest", "update:searchInput", "guest-created"]);

const createGuestModal = ref(null);
const isSearching = ref(false);
const localFilteredGuests = ref([]);
const localSearchInput = ref("");

const closeModal = () => {
  // Reset state
  localSearchInput.value = "";
  localFilteredGuests.value = [];
  isSearching.value = false;
  emit("close");
};

const selectGuest = (guestId) => {
  emit("select-guest", guestId);
};

const openCreateGuestModal = () => {
  if (createGuestModal.value) {
    createGuestModal.value.openModal();
  }
};

const onGuestCreated = (newGuest) => {
  emit("guest-created", newGuest);
};

const handleSearch = async () => {
  const searchValue = localSearchInput.value.trim();

  // Clear previous results
  localFilteredGuests.value = [];

  if (!searchValue) {
    // If empty, load default guests
    await loadDefaultGuests();
    return;
  }

  isSearching.value = true;
  try {
    const results = await searchGuests(searchValue);
    localFilteredGuests.value = results;
  } catch (error) {
    console.error("Error searching guests:", error);
    localFilteredGuests.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Load top guests when modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && localFilteredGuests.value.length === 0) {
      await loadDefaultGuests();
    }
  },
);

const loadDefaultGuests = async () => {
  isSearching.value = true;
  try {
    const results = await getTopGuests();
    localFilteredGuests.value = results;
  } catch (error) {
    console.error("Error loading top guests:", error);
    localFilteredGuests.value = [];
  } finally {
    isSearching.value = false;
  }
};
</script>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-icon {
  position: absolute;
  color: #5568d3;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
  background: transparent;
  color: #1f2937;
  transition: all 0.2s;
  flex: 1;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.btn-search {
  background: #667eea;
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-search .material-icons {
  font-size: 20px;
  color: white;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #5568d3;
}

.guest-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.guest-result-item:hover {
  background: #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.result-detail {
  font-size: 11px;
  color: #6b7280;
  display: block;
}

.check-icon {
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.check-icon .material-icons {
  font-size: 14px;
  color: white;
}
</style>

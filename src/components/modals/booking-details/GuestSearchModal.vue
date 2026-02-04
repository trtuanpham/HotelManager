<template>
  <ModalBase :is-visible="isOpen" modal-id="guest-search-modal" :title="lang.get('common.selectGuest')" @close="closeModal">
    <!-- Search Input -->
    <input :value="searchInput" type="text" :placeholder="lang.get('common.searchByNameOrCitizenId')" class="search-input" @input="$emit('update:searchInput', $event.target.value)" />

    <!-- Search Results -->
    <div class="search-results">
      <div v-if="filteredGuests.length === 0" class="no-results">
        {{ searchInput ? lang.get("common.noGuestsFound") : lang.get("common.typeToSearch") }}
      </div>
      <div v-for="guest in filteredGuests" :key="guest.id" class="guest-result-item" @click="selectGuest(guest.id)">
        <img :src="guest.imageUrl || DEFAULT_AVATAR_SVG" :alt="guest.name" class="result-avatar" />
        <div class="result-info">
          <div class="result-name">{{ guest.name }}</div>
          <small class="result-detail">{{ guest.citizenId }}</small>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="openCreateGuestModal">+ {{ lang.get("common.newGuest") }}</button>
    </template>
  </ModalBase>

  <!-- Create Guest Modal -->
  <CreateGuestModal ref="createGuestModal" @guest-created="onGuestCreated" />
</template>

<script setup>
import { ref } from "vue";
import { languageController as lang } from "../../../controller/languageController";
import { DEFAULT_AVATAR_SVG } from "../../../data/constants";
import ModalBase from "../ModalBase.vue";
import CreateGuestModal from "../CreateGuestModal.vue";

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
});

const emit = defineEmits(["close", "select-guest", "update:searchInput", "guest-created"]);

const createGuestModal = ref(null);

const closeModal = () => {
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
</script>

<style scoped>
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
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
</style>

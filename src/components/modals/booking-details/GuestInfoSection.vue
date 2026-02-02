<template>
  <div class="details-section">
    <div class="accompanied-header">
      <h4 class="section-title">Thông tin khách hàng</h4>
      <div class="guest-search-box">
        <input
          v-model="guestSearchQuery"
          type="text"
          class="guest-search-input"
          placeholder="Thêm khách..."
          @input="handleGuestSearchInput(guestSearchQuery)"
          @focus="handleGuestSearchFocus"
          @blur="handleGuestSearchBlur"
          @keydown.esc="showGuestDropdown = false"
        />
        <div v-show="showGuestDropdown" class="guest-dropdown">
          <div v-if="filteredGuests.length === 0" class="dropdown-empty">Không tìm thấy khách hàng</div>
          <div v-for="guest in filteredGuests" :key="guest.id" class="dropdown-item" @click="addGuest(guest)">
            <div class="dropdown-guest-info">
              <div class="guest-name">{{ guest.name }}</div>
              <small class="guest-citizen-id">ID: {{ guest.citizenId }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="guests-grid">
      <!-- Main Guest Card -->
      <div v-if="mainGuest" class="guest-card main-guest">
        <div class="guest-badge">khách chính</div>
        <div class="guest-card-avatar">
          <img :src="mainGuestAvatarUrl" alt="Guest" class="guest-card-img" />
        </div>
        <div class="guest-card-info">
          <div class="guest-card-name">{{ mainGuestName }}</div>
          <small class="guest-card-detail">ID: {{ mainGuest?.citizenId || "---" }}</small>
        </div>
      </div>

      <!-- Accompanying Guest Cards -->
      <div v-for="guest in accompaniedGuests" :key="guest.id" class="guest-card">
        <div class="guest-card-avatar">
          <img :src="getGuestAvatar(guest)" alt="Guest" class="guest-card-img" />
        </div>
        <div class="guest-card-info">
          <div class="guest-card-name">{{ guest.name }}</div>
          <small class="guest-card-detail">ID: {{ guest.citizenId || "---" }}</small>
        </div>
        <button type="button" class="remove-btn" @click="removeGuest(guest.id)">×</button>
      </div>
    </div>

    <div v-if="accompaniedGuests.length === 0" class="empty-message">Chưa có khách đi cùng</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { DEFAULT_AVATAR_SVG } from "../../../data/constants";

const props = defineProps({
  mainGuest: {
    type: Object,
    default: null,
  },
  mainGuestName: {
    type: String,
    required: true,
  },
  mainGuestAvatarUrl: {
    type: String,
    required: true,
  },
  accompaniedGuests: {
    type: Array,
    required: true,
  },
  availableGuests: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["add-guest", "remove-guest"]);

const guestSearchQuery = ref("");
const showGuestDropdown = ref(false);
const filteredGuests = ref([]);

const handleGuestSearchInput = (query) => {
  if (!query) {
    filteredGuests.value = props.availableGuests;
  } else {
    filteredGuests.value = props.availableGuests.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()) || g.citizenId.includes(query));
  }
};

const handleGuestSearchFocus = () => {
  showGuestDropdown.value = true;
  handleGuestSearchInput(guestSearchQuery.value);
};

const handleGuestSearchBlur = () => {
  setTimeout(() => {
    showGuestDropdown.value = false;
  }, 200);
};

const addGuest = (guest) => {
  emit("add-guest", guest);
  guestSearchQuery.value = "";
  showGuestDropdown.value = false;
  filteredGuests.value = [];
};

const removeGuest = (guestId) => {
  emit("remove-guest", guestId);
};

const getGuestAvatar = (guest) => {
  return guest?.imageUrl || DEFAULT_AVATAR_SVG;
};
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

.guest-search-box {
  position: relative;
  flex: 1;
  max-width: 250px;
}

.guest-search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.guest-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.guest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #1988ff;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: -1px;
}

.dropdown-empty {
  padding: 8px 10px;
  text-align: center;
  color: #9ca3af;
  font-size: 11px;
}

.dropdown-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.15s;
  font-size: 12px;
  color: #374151;
  background: white;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #667eea;
  color: white;
}

.dropdown-guest-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-guest-info .guest-name {
  font-size: 12px;
  font-weight: 500;
}

.dropdown-guest-info .guest-citizen-id {
  font-size: 10px;
  opacity: 0.8;
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

.guest-card.main-guest {
  border: 2px solid #667eea;
  background: #f9fafb;
}

.guest-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #667eea;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.guest-card-avatar {
  display: flex;
  justify-content: center;
}

.guest-card-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
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
</style>

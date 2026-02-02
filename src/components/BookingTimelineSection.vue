<template>
  <div class="details-section">
    <h4 class="section-title">Lịch sử đặt phòng</h4>

    <!-- Loading State -->
    <div v-if="isLoading" class="timeline-loading">
      <div class="loading-spinner"></div>
      <p>Đang tải lịch sử...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="timeline-error">
      <p>⚠️ {{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="timelineEvents.length === 0" class="timeline-empty">
      <p>Không có sự kiện nào</p>
    </div>

    <!-- Timeline -->
    <div v-else class="timeline-container">
      <div class="timeline">
        <div v-for="(event, index) in paginatedEvents" :key="index" class="timeline-item">
          <div class="timeline-marker" :class="`event-${event.type}`">
            <span class="timeline-icon">{{ event.icon }}</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-time">{{ formatDate(event.date) }}</div>
            <div class="timeline-title">{{ event.title }}</div>
            <div v-if="event.description" class="timeline-description">{{ event.description }}</div>
            <div v-if="event.amount" class="timeline-amount" :class="`amount-${event.amountType}`">
              {{ formatAmount(event.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreEvents" class="load-more-container">
        <button @click="loadMore" class="load-more-btn" :disabled="isLoadingMore">
          <span v-if="isLoadingMore" class="load-more-spinner"></span>
          <span>{{ isLoadingMore ? "Đang tải..." : `Xem thêm (${currentPage}/${totalPages})` }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { getBookingEventsByBookingId, getBookingEventsByBookingIdPaginated } from "../services/bookingEventService";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);
const isLoadingMore = ref(false);
const events = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;
const hasMore = ref(true);
const lastLoadedEventId = ref(null);

const timelineEvents = computed(() => {
  return events.value
    .map((event) => ({
      ...event,
      date: new Date(event.date),
    }))
    .sort((a, b) => b.date - a.date);
});

const totalPages = computed(() => {
  return Math.ceil(events.value.length / itemsPerPage);
});

const paginatedEvents = computed(() => {
  const start = 0;
  const end = currentPage.value * itemsPerPage;
  return timelineEvents.value.slice(start, end);
});

const hasMoreEvents = computed(() => {
  return hasMore.value;
});

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;

  try {
    isLoadingMore.value = true;

    // Get the last event ID from all loaded events (not from paginated/sorted)
    // API needs the ID of the last event in the original order
    const lastEventId = lastLoadedEventId.value;

    // Call API with pagination
    const response = await getBookingEventsByBookingIdPaginated(props.booking.id, lastEventId, itemsPerPage);

    if (response.events && response.events.length > 0) {
      events.value.push(...response.events);

      // Update lastLoadedEventId to the last event ID we just loaded
      lastLoadedEventId.value = response.events[response.events.length - 1].id;

      currentPage.value++;

      // Update hasMore flag from API response
      hasMore.value = response.hasMore;
    } else {
      hasMore.value = false;
    }
  } catch (err) {
    console.error("Error loading more events:", err);
    hasMore.value = false;
  } finally {
    isLoadingMore.value = false;
  }
};

onMounted(async () => {
  if (!props.booking?.id) return;

  try {
    isLoading.value = true;
    error.value = null;

    // Load first batch of events (5 items)
    const response = await getBookingEventsByBookingIdPaginated(props.booking.id, null, itemsPerPage);
    events.value = response.events || [];

    // Update lastLoadedEventId to the last event ID we loaded
    if (events.value.length > 0) {
      lastLoadedEventId.value = events.value[events.value.length - 1].id;
    }

    // Update hasMore flag from API response
    hasMore.value = response.hasMore;
  } catch (err) {
    error.value = err.message || "Failed to load booking events";
    events.value = [];
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (date) => {
  if (!date) return "---";
  const d = new Date(date);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount) => {
  return amount.toLocaleString("vi-VN") + " ₫";
};
</script>

<style scoped>
.timeline-loading,
.timeline-error,
.timeline-empty {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.timeline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.timeline-error {
  background: #fee2e2;
  border-radius: 6px;
  color: #991b1b;
}

.timeline-empty {
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
}

.timeline-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.timeline {
  position: relative;
  padding: 0;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 19px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.timeline::after {
  content: "";
  position: absolute;
  left: 12px;
  bottom: -15px;
  width: 16px;
  height: 16px;
  background: #059669;
  border-radius: 50%;
  z-index: 1;
}

.timeline-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid #f9fafb;
}

.timeline-marker.event-booking {
  background: #f0f4ff;
  border-color: #667eea;
}

.timeline-marker.event-payment {
  background: #f0fdf4;
  border-color: #22c55e;
}

.timeline-marker.event-checkin {
  background: #fef3c7;
  border-color: #f59e0b;
}

.timeline-marker.event-checkout {
  background: #fecaca;
  border-color: #ef4444;
}

.timeline-marker.event-service {
  background: #f3e8ff;
  border-color: #a855f7;
}

.timeline-marker.event-booking_created {
  background: #f0f4ff;
  border-color: #667eea;
}

.timeline-marker.event-service_used {
  background: #f3e8ff;
  border-color: #a855f7;
}

.timeline-marker.event-booking_completed {
  background: #d1fae5;
  border-color: #059669;
}

.timeline-icon {
  display: block;
}

.timeline-content {
  padding-top: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.timeline-amount {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.timeline-amount.amount-payment {
  background: #dcfce7;
  color: #15803d;
}

.timeline-amount.amount-service {
  background: #fce7f3;
  color: #be123c;
}

.load-more-container {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.load-more-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover:not(:disabled) {
  background: #5568d3;
}

.load-more-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.load-more-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}

.load-more-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Responsive */
@media (max-width: 640px) {
  .timeline-item {
    grid-template-columns: 36px 1fr;
    gap: 12px;
  }

  .timeline::before {
    left: 17px;
  }

  .timeline-marker {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .timeline-time {
    font-size: 11px;
  }

  .timeline-title {
    font-size: 12px;
  }

  .timeline-description {
    font-size: 11px;
  }
}
</style>

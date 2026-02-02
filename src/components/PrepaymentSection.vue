<template>
  <div class="details-section">
    <div class="prepayment-header-section">
      <h4 class="section-title">Thông tin trả tiền trước</h4>
      <button class="add-btn" @click="$emit('submit-prepayment')">+ Thêm trả tiền</button>
    </div>

    <div class="prepayment-summary">
      <div class="summary-item">
        <span class="summary-label">Tổng tiền trả trước:</span>
        <span class="summary-value">{{ totalPrepaid?.toLocaleString("vi-VN") || "0" }} VND</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Còn lại:</span>
        <span class="summary-value remaining">{{ (booking.totalPrice - totalPrepaid)?.toLocaleString("vi-VN") || "0" }} VND</span>
      </div>
    </div>

    <div v-if="bookingPrepayments.length > 0" class="prepayment-list">
      <div class="prepayment-list-header">Danh sách trả tiền trước</div>
      <div class="prepayment-items">
        <div v-for="prepayment in bookingPrepayments" :key="prepayment.id" class="prepayment-item">
          <div class="prepayment-date">{{ formatPrepaymentDate(prepayment.paymentDate) }}</div>
          <div class="prepayment-info">
            <div class="prepayment-description">{{ prepayment.description }}</div>
            <div class="prepayment-method">{{ prepayment.paymentMethod }}</div>
          </div>
          <div class="prepayment-amount">{{ prepayment.amount?.toLocaleString("vi-VN") || "0" }} VND</div>
          <div :class="`prepayment-status status-${prepayment.status?.toLowerCase()}`">{{ prepayment.status }}</div>
        </div>
      </div>
    </div>
    <div v-else class="empty-message">Chưa có trả tiền trước</div>
  </div>
</template>

<script setup>
defineProps({
  booking: {
    type: Object,
    required: true,
  },
  totalPrepaid: {
    type: Number,
    required: true,
  },
  bookingPrepayments: {
    type: Array,
    required: true,
  },
});

defineEmits(["submit-prepayment"]);

const formatPrepaymentDate = (dateStr) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.details-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prepayment-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.add-btn {
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.prepayment-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.summary-value {
  font-size: 14px;
  color: #667eea;
  font-weight: 700;
}

.summary-value.remaining {
  color: #ef4444;
}

.prepayment-list {
  margin-top: 12px;
}

.prepayment-list-header {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.prepayment-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.prepayment-item {
  display: grid;
  grid-template-columns: 120px 1fr 120px 100px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
}

.prepayment-date {
  font-weight: 600;
  color: #374151;
}

.prepayment-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prepayment-description {
  font-weight: 500;
  color: #374151;
}

.prepayment-method {
  font-size: 11px;
  color: #6b7280;
}

.prepayment-amount {
  font-weight: 700;
  color: #667eea;
  text-align: right;
}

.prepayment-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.prepayment-status.status-completed {
  background: #dcfce7;
  color: #15803d;
}

.prepayment-status.status-pending {
  background: #fef3c7;
  color: #92400e;
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

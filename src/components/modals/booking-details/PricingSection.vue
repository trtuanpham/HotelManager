<template>
  <div class="details-section">
    <h4 class="section-title">{{ lang.get("booking.pricingInfo") }}</h4>
    <div class="pricing-grid">
      <div class="pricing-item">
        <span class="label">{{ lang.get("booking.stayDuration") }}:</span>
        <span class="value">{{ editStayDuration }}</span>
      </div>
      <div class="pricing-item">
        <span class="label">{{ lang.get("booking.pricePerUnit") }}<span class="required">*</span></span>
        <div class="price-value-container">
          <div v-if="!isEditingPrice" class="price-display">
            <span class="value">{{ editPriceData.pricePerUnit?.toLocaleString("vi-VN") || "---" }} VND</span>
            <button class="edit-price-btn" @click="startEditPrice">{{ lang.get("common.edit") }}</button>
          </div>
          <div v-else class="price-edit-mode">
            <input
              :value="tempPricePerUnit ? tempPricePerUnit.toLocaleString('vi-VN') : ''"
              @input="(e) => (tempPricePerUnit = parseInt(e.target.value.replace(/\D/g, '')) || 0)"
              type="text"
              class="input-field price-input-single"
              placeholder="0"
            />
            <button class="btn-save-price" @click="savePriceChanges">{{ lang.get("common.save") }}</button>
            <button class="btn-cancel-price" @click="cancelEditPrice">{{ lang.get("common.cancel") }}</button>
          </div>
        </div>
      </div>
      <div class="pricing-item">
        <span class="label">{{ lang.get("booking.totalPrice") }}:</span>
        <span class="value total-price">{{ editCalculatedTotalPrice?.toLocaleString("vi-VN") || "---" }} VND</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { languageController as lang } from "../../../controller/languageController";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:pricePerUnit"]);

const isEditingPrice = ref(false);
const tempPricePerUnit = ref(0);

const editTimeData = computed(() => ({
  checkIn: new Date(props.booking.checkIn),
  checkOut: new Date(props.booking.checkOut),
}));

const editPriceData = computed(() => ({
  pricePerUnit: props.booking.pricePerUnit || 0,
}));

const bookingType = computed(() => props.booking.bookingType || "hourly");

const editStayDuration = computed(() => {
  const checkIn = editTimeData.value.checkIn;
  const checkOut = editTimeData.value.checkOut;
  if (!checkIn || !checkOut) return "---";

  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} ${lang.get("common.day")} ${remainingHours} ${lang.get("common.hour")}`;
  } else {
    return `${diffHours} ${lang.get("common.hour")}`;
  }
});

const calculateStayUnits = () => {
  const checkIn = editTimeData.value.checkIn;
  const checkOut = editTimeData.value.checkOut;
  if (!checkIn || !checkOut) return 0;

  const diffMs = checkOut - checkIn;

  if (bookingType.value === "hourly") {
    return Math.ceil(diffMs / (1000 * 60 * 60));
  } else {
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
};

const editCalculatedTotalPrice = computed(() => {
  const units = calculateStayUnits();
  return units * (editPriceData.value.pricePerUnit || 0);
});

const startEditPrice = () => {
  tempPricePerUnit.value = editPriceData.value.pricePerUnit;
  isEditingPrice.value = true;
};

const savePriceChanges = () => {
  if (tempPricePerUnit.value >= 0) {
    emit("update:pricePerUnit", tempPricePerUnit.value);
    isEditingPrice.value = false;
  }
};

const cancelEditPrice = () => {
  isEditingPrice.value = false;
  tempPricePerUnit.value = 0;
};

// Watch for booking changes and reset edit state
watch(
  () => props.booking,
  () => {
    isEditingPrice.value = false;
    tempPricePerUnit.value = 0;
  },
  { deep: true },
);
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

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.pricing-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.pricing-item .label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-item .value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.pricing-item .value.total-price {
  font-size: 14px;
  color: #667eea;
  font-weight: 700;
}

.required {
  color: #ef4444;
}

.edit-price-btn {
  padding: 4px 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.edit-price-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.price-display {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
}

.price-edit-mode {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.price-input-single {
  flex: 1;
  max-width: 180px;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  background: #ffffff;
  color: #000000;
  font-weight: 500;
}

.price-input-single:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.btn-save-price,
.btn-cancel-price {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save-price {
  background: #10b981;
  color: white;
}

.btn-save-price:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-cancel-price {
  background: #ef4444;
  color: white;
}

.btn-cancel-price:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.price-value-container {
  flex: 1;
}

.input-field {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #1988ff;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #ffffff;
  color: #000000;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
</style>

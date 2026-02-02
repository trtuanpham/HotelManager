<template>
  <div class="time-duration-picker">
    <div class="form-row">
      <div class="form-group">
        <label>{{ languageManager.get("createBooking.checkIn", null) || "Check-in" }}<span class="required">*</span></label>
        <input :value="formatDateTimeLocal((formData || timeData)?.checkIn)" @input="(e) => updateCheckIn(parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>

      <div class="form-group">
        <label>{{ languageManager.get("createBooking.checkOut", null) || "Check-out" }}<span class="required">*</span></label>
        <input :value="formatDateTimeLocal((formData || timeData)?.checkOut)" @input="(e) => updateCheckOut(parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>
    </div>

    <div class="quick-duration-buttons">
      <button @click="setQuickDuration(1, 'hour')" class="quick-btn quick-btn-hour">
        {{ languageManager.get("createBooking.quickHour").replace("{hour}", "1") }}
      </button>
      <button @click="setQuickDuration(2, 'hour')" class="quick-btn quick-btn-hour">
        {{ languageManager.get("createBooking.quickHour").replace("{hour}", "2") }}
      </button>
      <button @click="setQuickDuration(3, 'hour')" class="quick-btn quick-btn-hour">
        {{ languageManager.get("createBooking.quickHour").replace("{hour}", "3") }}
      </button>
      <button @click="setQuickDuration(1, 'day')" class="quick-btn quick-btn-day">
        {{ languageManager.get("createBooking.quickDay").replace("{day}", "1") }}
      </button>
      <button @click="setQuickDuration(2, 'day')" class="quick-btn quick-btn-day">
        {{ languageManager.get("createBooking.quickDay").replace("{day}", "2") }}
      </button>
      <button @click="setQuickDuration(3, 'day')" class="quick-btn quick-btn-day">
        {{ languageManager.get("createBooking.quickDay").replace("{day}", "3") }}
      </button>
    </div>
    <!-- 
    <div v-if="stayDuration" class="duration-info">
      <small
        >Thời gian lưu trú: <strong>{{ stayDuration }}</strong></small
      >
    </div> -->
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { languageManager } from "../services/languageManager";
import { langVN as lang } from "../locales/vi";

const props = defineProps({
  timeData: {
    type: Object,
    default: null,
  },
  formData: {
    type: Object,
    default: null,
  },
  lang: {
    type: Object,
    default: null,
  },
  bookingType: {
    type: String,
    default: "hourly",
  },
});

const emit = defineEmits(["update:timeData", "update:formData"]);

// Initialize language manager with provided lang or default
watch(
  () => props.lang,
  (newLang) => {
    if (newLang) {
      languageManager.setLanguage(newLang);
    }
  },
  { immediate: true },
);

// If no lang prop provided, use default langVN
if (!props.lang) {
  languageManager.setLanguage(lang);
}

// Support both timeData and formData props
const data = computed(() => props.formData || props.timeData);

const updateCheckIn = (value) => {
  if (props.formData) {
    emit("update:formData", { ...props.formData, checkIn: value });
  } else {
    emit("update:timeData", { ...props.timeData, checkIn: value });
  }
};

const updateCheckOut = (value) => {
  if (props.formData) {
    emit("update:formData", { ...props.formData, checkOut: value });
  } else {
    emit("update:timeData", { ...props.timeData, checkOut: value });
  }
};

const setQuickDuration = (value, unit) => {
  if (!data.value?.checkIn) return;

  const checkOutDate = new Date(data.value.checkIn);

  if (unit === "hour") {
    checkOutDate.setHours(checkOutDate.getHours() + value);
  } else if (unit === "day") {
    checkOutDate.setDate(checkOutDate.getDate() + value);
  }

  if (props.formData) {
    emit("update:formData", { ...props.formData, checkOut: checkOutDate });
  } else {
    emit("update:timeData", { ...props.timeData, checkOut: checkOutDate });
  }
};

const stayDuration = computed(() => {
  const timeData = data.value;
  if (!timeData?.checkIn || !timeData?.checkOut) return null;
  const checkIn = new Date(timeData.checkIn);
  const checkOut = new Date(timeData.checkOut);
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} ngày ${remainingHours} giờ`;
  } else {
    return `${diffHours} giờ`;
  }
});

const formatDateTimeLocal = (value) => {
  if (!value || !(value instanceof Date)) return "";
  if (isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateTime = (value) => {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");

  const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
  return dateObj;
};
</script>

<style scoped>
.time-duration-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 12px;
}

.required {
  color: #ef4444;
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

.quick-duration-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-btn {
  padding: 6px 10px;
  border: 1px solid #667eea;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 60px;
  white-space: nowrap;
}

.quick-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.quick-btn-hour {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.quick-btn-hour:hover {
  background: #5568d3;
}

.quick-btn-day {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.quick-btn-day:hover {
  background: #059669;
}

.duration-info {
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #667eea;
  font-size: 12px;
  color: #374151;
}

.duration-info strong {
  color: #667eea;
  font-weight: 700;
}
</style>

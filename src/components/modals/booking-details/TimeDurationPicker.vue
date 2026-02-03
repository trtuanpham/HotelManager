<template>
  <div class="time-duration-picker">
    <div class="form-row">
      <div class="form-group">
        <label>{{ lang.get("booking.checkIn") }}<span class="required">*</span></label>
        <input :value="formatDateTimeLocal(checkIn)" @input="(e) => updateCheckIn(parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>

      <div class="form-group">
        <label>{{ lang.get("booking.checkOut") }}<span class="required">*</span></label>
        <input :value="formatDateTimeLocal(checkOut)" @input="(e) => updateCheckOut(parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>
    </div>

    <div class="quick-duration-buttons">
      <button @click="setQuickDuration(1, BOOKING_TYPES.HOURLY)" class="quick-btn quick-btn-hour">
        {{ lang.get("booking.quickHour").replace("{hour}", "1") }}
      </button>
      <button @click="setQuickDuration(2, BOOKING_TYPES.HOURLY)" class="quick-btn quick-btn-hour">
        {{ lang.get("booking.quickHour").replace("{hour}", "2") }}
      </button>
      <button @click="setQuickDuration(3, BOOKING_TYPES.HOURLY)" class="quick-btn quick-btn-hour">
        {{ lang.get("booking.quickHour").replace("{hour}", "3") }}
      </button>
      <button @click="setQuickDuration(1, BOOKING_TYPES.DAILY)" class="quick-btn quick-btn-day">
        {{ lang.get("booking.quickDay").replace("{day}", "1") }}
      </button>
      <button @click="setQuickDuration(2, BOOKING_TYPES.DAILY)" class="quick-btn quick-btn-day">
        {{ lang.get("booking.quickDay").replace("{day}", "2") }}
      </button>
      <button @click="setQuickDuration(3, BOOKING_TYPES.DAILY)" class="quick-btn quick-btn-day">
        {{ lang.get("booking.quickDay").replace("{day}", "3") }}
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
import { languageController as lang } from "../../../controller/languageController";
import { BOOKING_TYPES } from "../../../data/constants";
import { calculateBookingHours, calculateBookingDays } from "../../../services/calculatorTime";

const props = defineProps({
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  bookingType: {
    type: String,
    default: "hourly",
  },
});

const emit = defineEmits(["update:time"]);

const calculateDurations = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return { totalHour: 0, totalDay: 0 };

  const totalHour = calculateBookingHours(checkInDate, checkOutDate);
  const totalDay = calculateBookingDays(checkInDate, checkOutDate);

  return { totalHour, totalDay };
};

const updateCheckIn = (value) => {
  const durations = calculateDurations(value, props.checkOut);
  emit("update:time", {
    checkIn: value,
    checkOut: props.checkOut,
    bookingType: props.bookingType,
    ...durations,
  });
};

const updateCheckOut = (value) => {
  const durations = calculateDurations(props.checkIn, value);
  emit("update:time", {
    checkIn: props.checkIn,
    checkOut: value,
    bookingType: props.bookingType,
    ...durations,
  });
};

const setQuickDuration = (value, unit) => {
  if (!props.checkIn) return;

  const checkOutDate = new Date(props.checkIn);

  if (unit === BOOKING_TYPES.HOURLY) {
    checkOutDate.setHours(checkOutDate.getHours() + value);
    props.bookingType = BOOKING_TYPES.HOURLY;
  } else if (unit === BOOKING_TYPES.DAILY) {
    checkOutDate.setDate(checkOutDate.getDate() + value);
    props.bookingType = BOOKING_TYPES.DAILY;
  }

  const durations = calculateDurations(props.checkIn, checkOutDate);
  emit("update:time", {
    checkIn: props.checkIn,
    checkOut: checkOutDate,
    bookingType: props.bookingType,
    ...durations,
  });
};

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

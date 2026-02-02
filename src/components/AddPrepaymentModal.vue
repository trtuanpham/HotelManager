<template>
  <ModalBase :is-visible="isVisible" modal-id="add-prepayment-modal" title="Thêm trả tiền trước" max-width="500px" @close="closeModal">
    <div class="modal-body">
      <div class="form-group">
        <label>Số tiền (VND)<span class="required">*</span></label>
        <input v-model.number="formData.amount" type="number" class="input-field" placeholder="Nhập số tiền" min="0" />
      </div>

      <div class="form-group">
        <label>Ngày thanh toán<span class="required">*</span></label>
        <input :value="formatDateTimeLocal(formData.paymentDate)" @input="(e) => (formData.paymentDate = parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Phương thức thanh toán<span class="required">*</span></label>
          <select v-model="formData.paymentMethod" class="input-field">
            <option value="">Chọn phương thức</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
          </select>
        </div>

        <div class="form-group">
          <label>Trạng thái<span class="required">*</span></label>
          <select v-model="formData.status" class="input-field">
            <option value="">Chọn trạng thái</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Pending">Đang chờ</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <input v-model="formData.description" type="text" class="input-field" placeholder="Ví dụ: Trả tiền trước 50%" />
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="submitForm">Lưu</button>
      </div>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref } from "vue";
import { hotelStore as store } from "../stores/hotelStore";
import ModalBase from "./ModalBase.vue";

const isVisible = ref(false);
const bookingId = ref(null);
const formData = ref({
  amount: 0,
  paymentDate: new Date(),
  paymentMethod: "",
  description: "",
  status: "Completed",
});

const openModal = (id) => {
  bookingId.value = id;
  formData.value = {
    amount: 0,
    paymentDate: new Date(),
    paymentMethod: "",
    description: "",
    status: "Completed",
  };
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  bookingId.value = null;
};

const submitForm = () => {
  if (!formData.value.amount || !formData.value.paymentMethod || !formData.value.status) {
    alert("Vui lòng điền đầy đủ thông tin trả tiền trước");
    return;
  }

  const paymentDateStr = formData.value.paymentDate.toISOString();

  store.addPrepayment({
    bookingId: bookingId.value,
    amount: formData.value.amount,
    paymentDate: paymentDateStr,
    paymentMethod: formData.value.paymentMethod,
    description: formData.value.description,
    status: formData.value.status,
  });

  closeModal();
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

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.form-row .form-group {
  gap: 6px;
}

.form-group label {
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

select.input-field {
  background: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
  appearance: none;
  cursor: pointer;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>

<template>
  <ModalBase :is-visible="isVisible" modal-id="add-prepayment-modal" max-width="500px" @close="closeModal">
    <template #title>
      <h3>{{ lang.get("prepayment.addTitle") }}</h3>
    </template>

    <template #content>
      <div class="form-group">
        <label>{{ lang.get("prepayment.amount") }}<span class="required">*</span></label>
        <input
          :value="formatCurrency(formData.amount)"
          @input="(e) => (formData.amount = parseCurrency(e.target.value))"
          type="text"
          class="input-field"
          :placeholder="lang.get('prepayment.amountPlaceholder')"
        />
      </div>

      <div class="form-group">
        <label>{{ lang.get("prepayment.paymentDate") }}<span class="required">*</span></label>
        <input :value="formatDateTimeLocal(formData.paymentDate)" @input="(e) => (formData.paymentDate = parseDateTime(e.target.value))" type="datetime-local" class="input-field" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>{{ lang.get("prepayment.paymentMethod") }}<span class="required">*</span></label>
          <select v-model="formData.paymentMethod" class="input-field">
            <option value="">{{ lang.get("prepayment.selectMethod") }}</option>
            <option :value="PAYMENT_METHODS.CASH">{{ lang.get("prepayment.cash") }}</option>
            <option :value="PAYMENT_METHODS.TRANSFER">{{ lang.get("prepayment.transfer") }}</option>
            <option :value="PAYMENT_METHODS.CARD">{{ lang.get("prepayment.card") }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>{{ lang.get("prepayment.description") }}</label>
        <textarea v-model="formData.description" class="input-field" :placeholder="lang.get('prepayment.descriptionPlaceholder')" rows="3"></textarea>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="closeModal">{{ lang.get("common.cancel") }}</button>
      <button class="btn btn-primary" @click="submitForm">{{ lang.get("common.save") }}</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref } from "vue";
import ModalBase from "./ModalBase.vue";
import { languageController as lang } from "../../controller/languageController";
import { PAYMENT_METHODS } from "../../data/constants";
import { useCurrency } from "../../composables/useCurrency";
import { useDateTime } from "../../composables/useDateTime";

const { formatCurrency, parseCurrency } = useCurrency();
const { formatDateTimeLocal, parseDateTime } = useDateTime();

const isVisible = ref(false);
const bookingId = ref(null);
const formData = ref({
  amount: 0,
  paymentDate: new Date(),
  paymentMethod: "",
  description: "",
});

const emit = defineEmits(["prepayment-added"]);

const openModal = (id) => {
  bookingId.value = id;
  formData.value = {
    amount: 0,
    paymentDate: new Date(),
    paymentMethod: "",
    description: "",
  };
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
  bookingId.value = null;
};

const submitForm = async () => {
  if (!formData.value.amount || !formData.value.paymentMethod) {
    alert(lang.get("prepayment.validationError"));
    return;
  }

  // Emit form data for parent to handle
  emit("prepayment-added", {
    bookingId: bookingId.value,
    amount: formData.value.amount,
    paymentDate: formData.value.paymentDate.toISOString(),
    paymentMethod: formData.value.paymentMethod,
    description: formData.value.description,
  });

  closeModal();
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
/* No local styles needed - inherits from ModalBase */
</style>

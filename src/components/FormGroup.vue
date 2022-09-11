<script setup lang="ts">
import { provide } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  feedback: {
    type: String,
    default: '',
  },
  state: {
    type: String as PropType<'' | 'success' | 'error'>,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  for: {
    type: String,
    default: '',
  },
})

provide('label', props.label)
</script>

<template>
  <div
    class="form-group"
    :class="{
      'form-group--error': props.state === 'error',
      'form-group--success': props.state === 'success',
      'form-group--required': props.required,
    }"
  >
    <label
      :for="props.for"
      class="form-group__label"
    >
      {{ props.label }}
    </label>
    <div class="form-group__input">
      <slot />
    </div>
    <div
      class="form-group__feedback"
      :class="{
        'text-error': props.state === 'error',
        'text-success': props.state === 'success',
      }"
    >
      {{ props.feedback }}
    </div>
  </div>
</template>

<style>
.form-group {
  @apply relative block w-full;
}
.form-group__label {
  @apply relative block w-full text-sm mb-1 font-bold text-gray-900;
}

.form-group__input {
  @apply relative block w-full;
}

.form-group__feedback {
  @apply relative block w-full text-sm text-gray-500 mt-1;
}

.form-group--error .form-group__feedback {
  @apply text-red-500;
}

.form-group--success .form-group__feedback {
  @apply text-emerald-500;
}

.form-group--required .form-group__label::after {
  content: '*';
  @apply text-red-500 ml-1;
}
</style>

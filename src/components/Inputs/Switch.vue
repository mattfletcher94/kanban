<script setup lang="ts">
import { computed, ref } from 'vue'
import { Switch } from '@headlessui/vue'

const props = defineProps<{
  checked: boolean
  disabled?: boolean
  labelPlacement?: 'left' | 'right'
}>()

const emits = defineEmits<{
  (event: 'change', value: boolean): void
}>()

// Create a computed vmodel
const computedChecked = computed({
  get: () => props.checked,
  set: value => emits('change', value),
})
</script>

<template>
  <Switch
    v-model="computedChecked"
    :class="computedChecked ? 'bg-primary-500' : 'bg-gray-300'"
    class="relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-opacity-75"
  >
    <span
      aria-hidden="true"
      :class="computedChecked ? 'translate-x-5' : 'translate-x-0'"
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
    />
  </Switch>
</template>

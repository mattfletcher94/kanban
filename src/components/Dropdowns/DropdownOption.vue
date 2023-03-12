<script lang="ts" setup>
import { MenuItem } from '@headlessui/vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <MenuItem v-slot="{ active }" :disabled="disabled">
    <button
      type="button"
      class="group flex items-center w-full px-2.5 py-2 transition-colors duration-200 text-sm font-semibold"
      :class="{
        'bg-gray-100': active || selected,
        'opacity-60 cursor-not-allowed': disabled,
      }"
    >
      <slot :active="active" />
    </button>
  </MenuItem>
</template>

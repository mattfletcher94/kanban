<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <div class="flex justify-between items-center gap-4 border-b border-b-slate-300 px-4 py-2 min-h-[60px]">
    <h2 class="text-md font-bold w-full m-0 text-ellipsis overflow-hidden whitespace-nowrap">
      <slot name="title" />
    </h2>
    <div v-if="slots.actions" class="flex items-center shrink-0 gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

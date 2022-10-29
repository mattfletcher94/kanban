<script setup lang="ts">
import { resolveUserFriendlyColorName } from '../data/colors'
const props = defineProps<{
  color: string
  title: string
}>()
</script>

<template>
  <div
    v-tooltip="{ content: `${resolveUserFriendlyColorName(props.color)}: ${title}` }"
    class="flex items-center gap-1 text-xs font-bold rounded-md px-2 py-1 tracking-wide"
    :class="[
      `bg-${props.color}-100`,
      `text-${props.color}-600`,
    ]"
  >
    <div>
      <div
        class="w-2 h-2 rounded-full"
        :class="[
          `bg-${props.color}-500`,
        ]"
      />
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

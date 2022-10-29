<script lang="ts" setup>
import { PopoverButton } from '@headlessui/vue'
import { colors, resolveUserFriendlyColorName } from '../../data/colors'
import Popover from './Popover.vue'

const props = defineProps({
  width: {
    type: String,
    default: '210px',
  },
  triggerClass: {
    type: String,
    default: '',
  },
  selectedColor: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (event: 'select', color: string): void
}>()
</script>

<template>
  <Popover
    :width="props.width"
    anchor="bottom"
    :trigger-class="props.triggerClass"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-4 p-4">
        <div
          v-for="c in colors"
          :key="c"
          v-tooltip="{ content: resolveUserFriendlyColorName(c) }"
          class="shrink-0"
        >
          <PopoverButton
            type="button"
            class="flex items-center justify-center w-6 h-6 rounded-full"
            :class="`bg-${c}-500`"
            @click="() => emit('select', c)"
          >
            <svg
              v-if="props.selectedColor === c"
              class="w-4 h-4 text-white"
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0z" /><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </PopoverButton>
        </div>
      </div>
    </template>
  </Popover>
</template>


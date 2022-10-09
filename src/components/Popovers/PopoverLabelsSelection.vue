<script lang="ts" setup>
import type { Label } from 'src/stores/boards'
import type { PropType } from 'vue'
import Popover from './Popover.vue'

const props = defineProps({
  triggerClass: {
    type: String,
    default: '',
  },
  labels: {
    type: Array as PropType<Label[]>,
    required: true,
  },
  selectedLabelIds: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'change', boardId: string): void
}>()
</script>

<template>
  <Popover
    width="270px"
    anchor="right"
    :trigger-class="props.triggerClass"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <div class="block p-4">
        <div
          class="flex flex-col gap-4"
        >
          <div
            v-for="label in props.labels"
            :key="label.id"
            class="flex items-center gap-2"
          >
            <div>
              <div
                class="w-5 h-5 rounded-full"
                :class="{
                  'bg-green-500': label.color === 'green',
                  'bg-amber-500': label.color === 'amber',
                  'bg-red-500': label.color === 'red',
                }"
              />
            </div>
            <div>
              {{ label.title }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popover>
</template>


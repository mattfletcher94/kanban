<script setup lang="ts">
import {
  Popover,
  PopoverButton,
  PopoverOverlay,
  PopoverPanel,
} from '@headlessui/vue'
import type { PropType } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: '300px',
  },
  anchor: {
    type: String as PropType<'left' | 'right'>,
    default: 'left',
  },
  triggerClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Popover class="relative inline" as="div">
    <PopoverButton as="button" :class="props.triggerClass">
      <slot name="trigger" />
    </PopoverButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <PopoverPanel
        class="absolute w-screen bg-white bg-opacity-90 backdrop-filter backdrop-blur rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
        :class="{
          'right-0 origin-top-right': props.anchor === 'right',
          'left-0 origin-top-left': props.anchor === 'left',
        }"
        :style="{
          'max-width': props.width,
        }"
      >
        <slot name="content" />
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import type { PropType } from 'vue'
import { Teleport, computed, ref } from 'vue'
import { usePopper } from '../../composables/usePopper'

const props = defineProps({
  width: {
    type: String,
    default: undefined,
  },
})

const [trigger, container] = usePopper({
  placement: 'bottom',
  strategy: 'fixed',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 6],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: 6,
      },
    },
    {
      name: 'flip',
      options: {
        padding: 6,
      },
    },
    {
      name: 'sameWidth',
      enabled: true,
      fn: ({ state }: any) => {
        state.styles.popper.width = `${props.width ? props.width : state.rects.reference.width}px`
      },
      effect({ state }: any) {
        state.elements.popper.style.width = `${props.width ? props.width : state.elements.reference.offsetWidth}px`
      },
      phase: 'beforeWrite',
      requires: ['computeStyles'],
    },
  ],
})
</script>

<template>
  <Menu as="div" class="block z-100">
    <MenuButton ref="trigger" as="div">
      <slot name="trigger" />
    </MenuButton>
    <Teleport to="body">
      <MenuItems
        ref="container"
        class="z-[99999] bg-white bg-opacity-90 backdrop-filter backdrop-blur divide-y divide-slate-200 rounded-md shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <slot name="options" />
      </MenuItems>
    </Teleport>
  </Menu>
</template>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition: opacity 200ms, transform 200ms ease;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.75);
}
</style>

<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import type { Placement, Instance as PopperInstance } from '@popperjs/core'
import { createPopper, detectOverflow } from '@popperjs/core'
import type { FocusTrap as FocusTrapInstance } from 'focus-trap'
import { createFocusTrap } from 'focus-trap'
import { onClickOutside } from '@vueuse/core'

const props = withDefaults(defineProps<{
  class?: string
  dropdownClass?: string
  dropdownWidth?: 'auto' | 'cover' | string
  dropdownHeight?: 'auto' | string
  dropdownPlacement?: Placement
  dropdownOffset?: string
  closeOnSelect?: boolean
}>(), {
  class: '',
  dropdownClass: '',
  dropdownWidth: 'auto',
  dropdownHeight: 'auto',
  dropdownPlacement: 'bottom-start',
  dropdownOffset: '4',
  closeOnSelect: true,
})

const isOpen = ref(false)

const instancePopper = ref<PopperInstance>()
const instanceFocusTrap = ref<FocusTrapInstance>()

const templateRefDropdown = ref<HTMLDivElement>()
const templateRefPopper = ref<HTMLSpanElement>()
const templateRefPopperCardOptions = ref<HTMLDivElement>()

const dropdownWidthCalculated = computed(() => {
  if (props.dropdownWidth === 'auto')
    return 'auto'

  if (props.dropdownWidth === 'cover')
    return `${templateRefDropdown.value?.offsetWidth}px`

  return props.dropdownWidth
})

const open = async () => {
  isOpen.value = true

  // Destroy old instances
  instancePopper.value?.destroy()
  instanceFocusTrap.value?.deactivate()

  await nextTick()

  // Create new instances
  instancePopper.value = createPopperInstance()
  instanceFocusTrap.value = createFocusTrapInstance()
}

const close = () => {
  instanceFocusTrap.value?.deactivate()
  isOpen.value = false
}

const toggle = () => {
  if (isOpen.value)
    close()

  else
    open()
}

function createPopperInstance() {
  const trigger = templateRefDropdown.value?.querySelector(':first-child')
  if (!templateRefPopper.value || !trigger)
    return
  return createPopper(trigger, templateRefPopper.value, {
    placement: props.dropdownPlacement,
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, Number(props.dropdownOffset)],
          padding: 0,
        },
      },
      {
        name: 'flip',
        enabled: false,
      },
      {
        name: 'maxSize',
        enabled: true,
        phase: 'main',
        // Prevent the dropdown from expanding outside of the viewport
        // by adding a max height to the dropdown
        fn({ state }: { state: any }) {
          const { placement } = state
          const { top, bottom } = detectOverflow(state)
          const isBelow = placement.startsWith('bottom')
          const height = isBelow
            ? `calc(100vh - ${Math.abs(top)}px - 16px)`
            : `calc(100vh - ${Math.abs(bottom)}px - 16px)`
          state.styles.popper.height = height
          return state
        },
      },
    ],
  })
}

function createFocusTrapInstance() {
  if (!templateRefPopper.value || !templateRefPopperCardOptions.value || !templateRefPopperCardOptions.value)
    return

  const initialFocus = templateRefPopperCardOptions.value.querySelector<HTMLElement>('.dropdown-option--selected')
        || templateRefPopperCardOptions.value as HTMLElement

  const focusTrap = createFocusTrap(templateRefPopper.value, {
    initialFocus: () => initialFocus,
    fallbackFocus: templateRefPopperCardOptions.value,
    onDeactivate: close,
    isKeyForward: (e) => {
      if (!e.shiftKey && e.key === 'Tab')
        return true

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        return true
      }
      return false
    },
    isKeyBackward: (e) => {
      if (e.shiftKey && e.key === 'Tab')
        return true

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        return true
      }
      return false
    },
    escapeDeactivates: true,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
  })
  focusTrap.activate()
  return focusTrap
}

const handleClickOptions = (e: MouseEvent) => {
  if (!props.closeOnSelect)
    return
  const target = e.target as HTMLElement
  if (target.closest('.dropdown-option'))
    close()
}

const className = computed(() => {
  const classes = []
  classes.push('dropdown', 'relative', 'inline-flex')
  return twMerge(classes, props.class)
})

const dropdownClassName = computed(() => {
  const classes = []
  classes.push('dropdown__popper__card', 'flex', 'flex-col', 'w-full', 'overflow-x-hidden', 'overlow-y-auto', 'py-2', 'bg-white', 'shadow-lg', 'rounded-md', 'pointer-events-auto', 'ring-1', 'ring-black/5', 'outline-none')
  return twMerge(classes, props.dropdownClass)
})

onClickOutside(templateRefPopper, (event) => {
  if (!templateRefDropdown.value?.contains(event.target as Node))
    isOpen.value && close()
})

onBeforeUnmount(() => {
  instancePopper.value?.destroy()
  instanceFocusTrap.value?.deactivate()
})

defineExpose({
  open,
  close,
  toggle,
})
</script>

<template>
  <div
    ref="templateRefDropdown"
    :class="className"
  >
    <slot
      name="trigger"
      :open="open"
      :close="close"
      :toggle="toggle"
      :is-open="isOpen"
    />
    <Teleport to="body">
      <Transition
        name="dropdown__popper"
        :duration="240"
      >
        <span
          v-if="isOpen"
          ref="templateRefPopper"
          class="dropdown__popper pointer-events-none z-[9000]"
        >
          <div
            ref="templateRefPopperCardOptions"
            tabindex="-1"
            :class="dropdownClassName"
            role="menu"
            :style="{
              width: dropdownWidthCalculated,
            }"
            @click="handleClickOptions"
          >
            <slot name="options" />
          </div>
        </span>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.dropdown__popper-enter-active .dropdown__popper__card {
    transition: all 240ms;
}

.dropdown__popper-leave-active .dropdown__popper__card {
    transition: all 240ms;
}

.dropdown__popper-enter-from .dropdown__popper__card {
    transform: translateY(4px);
    opacity: 0;
}

.dropdown__popper-leave-to .dropdown__popper__card {
    transform: translateY(4px);
    opacity: 0;
}
</style>

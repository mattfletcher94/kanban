<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import type { Placement, Instance as PopperInstance } from '@popperjs/core'
import { createPopper, detectOverflow } from '@popperjs/core'
import type { FocusTrap as FocusTrapInstance } from 'focus-trap'
import { createFocusTrap } from 'focus-trap'
import { onClickOutside } from '@vueuse/core'

const props = withDefaults(defineProps<{
  popoverWidth?: 'auto' | 'cover' | string
  popoverHeight?: 'auto' | string
  popoverPlacement?: Placement
  popoverOffset?: string
}>(), {
  popoverWidth: 'auto',
  popoverHeight: 'auto',
  popoverPlacement: 'bottom-start',
  popoverOffset: '4',
})

const isOpen = ref(false)
const isTransitioning = ref(false)
const transformOrigin = ref('bottom left')

const instancePopper = ref<PopperInstance>()
const instanceFocusTrap = ref<FocusTrapInstance>()

const templateRefPopover = ref<HTMLDivElement>()
const templateRefPopper = ref<HTMLSpanElement>()
const templateRefPopperCard = ref<HTMLDivElement>()

const popoverWidthCalculated = computed(() => {
  if (props.popoverWidth === 'auto')
    return 'auto'

  if (props.popoverWidth === 'cover')
    return `${templateRefPopper.value?.offsetWidth}px`

  return props.popoverWidth
})

const open = async () => {
  isOpen.value = true

  const placementOriginMap = {
    'top-start': 'bottom left',
    'top-end': 'bottom right',
    'bottom-start': 'top left',
    'bottom-end': 'top right',
    'top': 'bottom center',
    'bottom': 'top center',
    'right': 'center left',
    'left': 'center right',
    'right-start': 'top left',
    'right-end': 'bottom left',
    'left-start': 'top right',
    'left-end': 'bottom right',
  } as const

  transformOrigin.value = placementOriginMap[props.popoverPlacement as keyof typeof placementOriginMap]

  // Destroy old instances
  instancePopper.value?.destroy()
  instanceFocusTrap.value?.deactivate()

  await nextTick()

  // Create new instances
  instancePopper.value = createPopperInstance()
  instanceFocusTrap.value = createFocusTrapInstance()

  // If popper has flipped, update transform origin
  setTimeout(() => {
    const placement = instancePopper.value?.state.placement
    transformOrigin.value = placementOriginMap[placement as keyof typeof placementOriginMap]
  }, 0)
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
  const trigger = templateRefPopover.value?.querySelector(':first-child')
  if (!templateRefPopper.value || !trigger)
    return
  return createPopper(trigger, templateRefPopper.value, {
    placement: props.popoverPlacement,
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [Number(props.popoverOffset), Number(props.popoverOffset)],
          padding: 0,
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 0,
        },
      },
      {
        name: 'flip',
        options: {
          padding: 0,
        },
      },
    ],
  })
}

function createFocusTrapInstance() {
  if (!templateRefPopper.value)
    return
  const focusTrap = createFocusTrap(templateRefPopper.value, {
    fallbackFocus: templateRefPopperCard.value,
    onDeactivate: close,
    escapeDeactivates: true,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
  })
  focusTrap.activate()
  return focusTrap
}

onClickOutside(templateRefPopper, (event) => {
  if (!templateRefPopover.value?.contains(event.target as Node))
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
    ref="templateRefPopover"
    class="popover"
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
        name="popover__popper"
        :duration="300"
        @enter="isTransitioning = true"
        @after-enter="isTransitioning = false"
        @leave="isTransitioning = true"
        @after-leave="isTransitioning = false"
      >
        <span
          v-if="isOpen"
          ref="templateRefPopper"
          class="popover__popper"
        >
          <div
            ref="templateRefPopperCard"
            class="popover__popper__card"
            tabindex="-1"
            :style="{
              'width': popoverWidthCalculated,
              'height': 'auto',
              'transform-origin': transformOrigin,
            }"
            aria-modal="true"
            role="dialog"
          >
            <slot
              name="content"
              :close="close"
              :toggle="toggle"
              :is-open="isOpen"
            />
          </div>
        </span>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss">
.popover {
    position: relative;
    display: inline-flex;

    &__popper {
        pointer-events: none;
        z-index: var(--lucid-dropdown-z-index);

        &__card {
            display: block;
            overflow: hidden;
            opacity: 1;
            background-color: rgba(255, 255, 255, 1);
            box-shadow: 0 0 0 1px rgba(0,0,0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border-radius: var(--lucid-rounded-md);
            max-height: 100%;
            pointer-events: initial;
            transform: scale(1);
        }
    }

}

.popover__popper-enter-active .popover__popper__card {
    transition: all 240ms
}

.popover__popper-leave-active .popover__popper__card {
    transition: all 240ms
}

.popover__popper-enter-from .popover__popper__card {
    transform: scale(0.9);
    opacity: 0;
}

.popover__popper-leave-to .popover__popper__card {
    transform: scale(0.9);
    opacity: 0;
}
</style>

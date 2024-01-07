<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import type { FocusTrap } from 'focus-trap'
import { createFocusTrap } from 'focus-trap'

const props = withDefaults(defineProps<{
  open?: boolean
  width?: string
  appearance?: 'slideout' | 'modal'
  dismissable?: boolean
}>(), {
  open: false,
  width: '480px',
  appearance: 'modal',
  dismissable: true,
})

const emits = defineEmits<{
  close: []
  submit: [event: Event]
}>()

const slots = useSlots()

const target = ref<HTMLElement>()
const card = ref<HTMLElement>()
const body = ref<HTMLElement>()

const focusTrap = ref<FocusTrap>()

function close() {
  emits('close')
}

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    if (!target.value)
      return
    focusTrap.value?.deactivate()
    focusTrap.value = createFocusTrap(target.value, {
      initialFocus: () => card.value,
      onDeactivate: () => close(),
      escapeDeactivates: () => true,
      clickOutsideDeactivates: () => false,
      allowOutsideClick: () => true,
    })
    focusTrap.value.activate()
    card.value?.focus()
  }
  else {
    focusTrap.value?.deactivate()
    focusTrap.value = undefined
  }
})

onBeforeUnmount(() => {
  focusTrap.value?.deactivate()
  focusTrap.value = undefined
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="lucid-modal"
      mode="out-in"
      :duration="240"
    >
      <div
        v-if="open"
        ref="target"
        class="lucid-modal fixed inset-0 flex items-start justify-end z-[100]"
        :class="{
          'lucid-modal--slideout items-start justify-end': appearance === 'slideout',
          'lucid-modal--modal items-center justify-center': appearance === 'modal',
        }"
        role="dialog"
        tabindex="-1"
      >
        <button
          class="lucid-modal__backdrop absolute inset-0 bg-slate-900/60 cursor-default"
          aria-hidden="true"
          tabindex="-1"
          @click="dismissable && close()"
        />
        <form
          ref="card"
          class="lucid-modal__card flex flex-col bg-white overflow-hidden shadow-lg relative w-full"
          :class="{
            'rounded-l-lg h-full': appearance === 'slideout',
            'rounded-lg h-auto max-h-full': appearance === 'modal',
          }"
          :style="{
            'max-width': width,
          }"
          @submit.prevent="emits('submit', $event)"
        >
          <div class="shrink-0">
            <slot name="header" />
          </div>
          <div
            ref="body"
            class="lucid-modal__card__body h-full grow overflow-y-auto overflow-x-hidden"
          >
            <slot name="body" />
          </div>
          <div v-if="slots.footer" class="shrink-0">
            <slot name="footer" />
          </div>
        </form>

      </div>
    </Transition>
  </Teleport>
</template>

<style>
.lucid-modal-enter-active .lucid-modal__card,
.lucid-modal-leave-active .lucid-modal__card {
    transition: all 240ms;
}

.lucid-modal-enter-from.lucid-modal--slideout .lucid-modal__card {
    transform: translateX(24px);
    opacity: 0;
}

.lucid-modal-leave-to.lucid-modal--slideout .lucid-modal__card {
    transform: translateX(24px);
    opacity: 0;
}

.lucid-modal-enter-from.lucid-modal--modal .lucid-modal__card {
    transform: translateY(12px);
    opacity: 0;
}

.lucid-modal-leave-to.lucid-modal--modal .lucid-modal__card {
    transform: translateY(12px);
    opacity: 0;
}

.lucid-modal-leave-active .lucid-modal__backdrop,
.lucid-modal-enter-active .lucid-modal__backdrop {
    transition: all 240ms;
}

.lucid-modal-enter-from .lucid-modal__backdrop,
.lucid-modal-leave-to .lucid-modal__backdrop {
    opacity: 0;
}

.lucid-modal__card__body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: rgba(0,0,0,0.1);
}
.lucid-modal__card__body::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  @apply rounded-lg;
}
</style>

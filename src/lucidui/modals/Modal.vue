<script lang="ts" setup>
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const emits = defineEmits<{
  close: []
}>()

const target = ref<HTMLElement>()
const card = ref<HTMLElement>()

const trap = useFocusTrap(target, {
  immediate: false,
  onDeactivate: close,
  initialFocus: false,
})

function close() {
  emits('close')
}

watch(() => props.open, async (open) => {
  await nextTick()
  if (open) {
    card.value?.focus()
    trap.activate()
  }
  else {
    trap.deactivate()
  }
})
</script>

<template>
  <Transition
    name="lucid-modal"
    mode="out-in"
    :duration="240"
  >
    <div
      v-if="open"
      ref="target"
      class="lucid-modal fixed inset-0 flex items-center justify-center z-[100]"
      role="dialog"
      tabindex="-1"
    >
      <button
        class="lucid-modal__backdrop absolute inset-0 bg-slate-900/60 cursor-default"
        aria-hidden="true"
        tabindex="-1"
        @click="trap.deactivate()"
      />
      <div
        ref="card"
        class="lucid-modal__card bg-white rounded-lg shadow-lg relative w-[600px] h-[600px]"
        tabindex="0"
      >
        <slot>
          <button>Modal</button>
        </slot>
      </div>

    </div>
  </Transition>
</template>

<style>
.lucid-modal-enter-active .lucid-modal__card {
    transition: all 240ms;
}

.lucid-modal-leave-active .lucid-modal__card {
    transition: all 240ms;
}

.lucid-modal-enter-from .lucid-modal__card {
    transform: translateY(6px);
    opacity: 0;
}

.lucid-modal-leave-to .lucid-modal__card {
    transform: translateY(6px);
    opacity: 0;
}

.lucid-modal-enter-active .lucid-modal__backdrop {
    transition: all 240ms;
}

.lucid-modal-leave-active .lucid-modal__backdrop {
    transition: all 240ms;
}

.lucid-modal-enter-from .lucid-modal__backdrop {
    opacity: 0;
}

.lucid-modal-leave-to .lucid-modal__backdrop {
    opacity: 0;
}
</style>

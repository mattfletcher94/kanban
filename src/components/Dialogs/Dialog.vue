<script setup lang="ts">
import {
  Dialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { nextTick, ref, watch } from 'vue'
import IconClose from './../Icons/IconClose.vue'
import LoadingBar from './../LoadingBar.vue'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '600px',
  },
  title: {
    type: String,
    default: '',
  },
  busy: {
    type: Boolean,
    default: false,
  },
})

// Emit
const emit = defineEmits<{
  (event: 'close'): void
}>()

// HTML Refs
const dialogHeader = ref<null | HTMLElement>(null)
const dialogContent = ref<null | HTMLElement>(null)

// COntent height
const contentHeight = ref('calc(100vh- 4rem')

// Watch open prop
watch(() => props.open, async (open) => {
  if (!open)
    return

  await nextTick()
  const headerHeight = Math.ceil(dialogHeader.value?.getBoundingClientRect().height || 0)
  contentHeight.value = `calc(100vh - ${headerHeight}px - 11.5rem)`
})

const handleClose = () => {
  if (!props.busy)
    emit('close')
}
</script>

<template>
  <TransitionRoot
    appear
    :show="props.open"
    as="template"
  >
    <Dialog
      as="div"
      @close="() => handleClose()"
    >
      <div class="fixed inset-0 overflow-hidden flex item-center justify-center h-screen p-8" style="z-index: 1000">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="fixed inset-0 bg-slate-800/70"
          />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="duration-200 ease-in-out"
          enter-from="opacity-0 scale-75"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in-out"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-75"
        >
          <div
            class="dialog"
            :style="{ maxWidth: props.width }"
          >
            <LoadingBar
              v-if="busy"
              class="!absolute top-0 left-0 z-10"
            />
            <div class="flex flex-col-reverse">
              <div v-if="$slots.content" ref="dialogContent" class="dialog-content" :style="{ maxHeight: contentHeight }">
                <slot name="content" />
              </div>
              <div v-if="$slots.header || props.title" ref="dialogHeader" class="dialog-header">
                <div class="flex w-full gap-4 items-center justify-start">
                  <div class="w-full">
                    <template v-if="$slots.header">
                      <slot name="header" />
                    </template>
                    <template v-else>
                      <h2 class="text-base font-bold">
                        {{ props.title }}
                      </h2>
                    </template>
                  </div>
                  <div class="ml-auto">
                    <button
                      type="button"
                      title="Close"
                      class="btn flex items-center justify-center text-gray-900 rounded-full w-8 h-8 p-0 !outline-none transition-colors bg-transparent hover:bg-gray-200 focus:bg-gray-200"
                      :disabled="props.busy"
                      @click="() => handleClose()"
                    >
                      <IconClose class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style>
.dialog {
  @apply
    relative
    block
    my-auto
    mx-auto
    w-full
    rounded-md
    bg-white
    shadow-md;
  max-height: calc(100% - 6rem);
}
.dialog-header {
  @apply
    flex
    items-center
    justify-between
    px-6
    py-3
    border-b
    border-b-slate-200;
}
.dialog-content {
  @apply block w-full overflow-y-auto overflow-x-hidden p-6;
}
.dialog-footer {
  @apply block w-full;
}
</style>

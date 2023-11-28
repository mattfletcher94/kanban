<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import Button from '@/lucidui/buttons/Button.vue'
import IconChevonDown from '@/components/Icons/IconChevonDown.vue'

const props = withDefaults(defineProps<{
  class?: string
  open?: boolean
}>(), {
  class: '',
  open: false,
})

const emits = defineEmits<{
  click: [e: Event]
  blur: [e: Event]
  focus: [e: Event]
}>()

const className = computed(() => {
  const classes = []
  classes.push('relative', 'flex', 'items-center', 'w-full', 'justify-between', 'px-2.5', 'h-10', 'bg-gray-50', 'border', 'border-gray-300', 'text-slate-700', 'text-sm', 'text-left', 'rounded-md', 'outline-none', 'shadow-none', 'transition-colors', 'placeholder:text-slate-500', 'focus:outline-none', 'focus:border', 'focus:border-primary-500')
  if (props.open)
    classes.push('border-primary-500')
  return twMerge(classes, props.class)
})

function handleInput(emit: 'click' | 'blur' | 'focus', e: Event) {
  const value = (e.target as HTMLInputElement)?.value ?? ''
  // @ts-expect-error emit is a string
  emits(emit, value)
}
</script>

<template>
  <button
    :class="className"
    type="button"
    @click="handleInput('click', $event)"
    @blur="handleInput('blur', $event)"
    @focus="handleInput('focus', $event)"
  >
    <slot />
    <IconChevonDown
      class="block shrink-0 w-4 h-4 text-gray-500 transition-transform"
      :class="{
        'transform rotate-180': props.open,
      }"
    />
  </button>
</template>

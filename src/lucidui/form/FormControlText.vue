<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed, useAttrs } from 'vue'

const props = withDefaults(defineProps<{
  class?: string
}>(), {
  class: '',
})

const emits = defineEmits<{
  input: [value: string]
  change: [value: string]
  blur: [value: string]
  focus: [value: string]
}>()

const attrs = useAttrs()

const className = computed(() => {
  const classes = []
  classes.push('relative', 'block', 'w-full', 'px-2.5', 'h-10', 'bg-gray-50', 'border', 'border-gray-300', 'text-slate-700', 'text-sm', 'text-left', 'rounded-md', 'outline-none', 'shadow-none', 'transition-colors', 'placeholder:text-slate-500', 'focus:outline-none', 'focus:border', 'focus:border-primary-500')
  return twMerge(classes, props.class)
})

function handleInput(emit: 'input' | 'change' | 'blur' | 'focus', e: Event) {
  const value = (e.target as HTMLInputElement)?.value ?? ''
  // @ts-ignore Seems to be an error in Vue
  emits(emit, value)
}
</script>

<template>
  <input
    v-bind="attrs"
    :class="className"
    @input="handleInput('input', $event)"
    @change="handleInput('change', $event)"
    @blur="handleInput('blur', $event)"
    @focus="handleInput('focus', $event)"
  >
</template>

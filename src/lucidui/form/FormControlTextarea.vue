<script lang="ts" setup>
import { useTextareaAutosize } from '@vueuse/core'
import { twMerge } from 'tailwind-merge'
import { computed, onBeforeMount, useAttrs, watch } from 'vue'

const props = withDefaults(defineProps<{
  class?: string
  autoResize?: boolean
  inline?: boolean
}>(), {
  class: '',
  autoResize: true,
  inline: false,
})

const emits = defineEmits<{
  input: [value: string]
  change: [value: string]
  blur: [value: string]
  focus: [value: string]
}>()

const attrs = useAttrs()

const { textarea, input } = useTextareaAutosize()

watch(() => input.value, () => {
  emits('change', input.value)
})

const className = computed(() => {
  const classes = []
  classes.push('relative', 'block', 'w-full', 'overflow-hidden', 'text-slate-700', 'text-sm', 'text-left', 'rounded-md', 'outline-none', 'shadow-none', 'transition-colors', 'placeholder:text-slate-500', 'focus:outline-none', 'focus:border', 'focus:border-primary-500', 'resize-none')

  if (!props.inline)
    classes.push('p-2.5', 'bg-gray-50', 'border', 'border-gray-300')
  else
    classes.push('p-1', 'bg-transparent', 'border', 'border-transparent', 'hover:border-primary-500', 'hover:bg-slate-50')

  return twMerge(classes, props.class)
})

function handleInput(emit: 'input' | 'change' | 'blur' | 'focus', e: Event) {
  const value = (e.target as HTMLInputElement)?.value ?? ''
  // @ts-ignore Seems to be an error in Vue
  emits(emit, value)
}

onBeforeMount(() => {
  if (attrs.value)
    input.value = attrs.value as string
})
</script>

<template>
  <textarea
    v-bind="attrs"
    ref="textarea"
    v-model="input"
    :class="className"
    @input="handleInput('input', $event)"
    @focus="handleInput('focus', $event)"
    @blur="handleInput('blur', $event)"
  />
</template>

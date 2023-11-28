<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  class?: string
  labelClass?: string
  helperClass?: string
  errorClass?: string
  for?: string
}>(), {
  class: '',
  labelClass: '',
  helperClass: '',
  errorClass: '',
  for: () => `id-${uuidv4()}`,
} as const)

const className = computed(() => {
  const classes: string[] = []
  classes.push('relative', 'flex', 'flex-col', 'gap-1')
  return twMerge(classes, props.class)
})

const labelClassName = computed(() => {
  const classes: string[] = []
  classes.push('text-sm', 'text-black', 'font-semibold')
  return twMerge(classes, props.labelClass)
})

const helperClassName = computed(() => {
  const classes: string[] = []
  classes.push('text-sm', 'text-gray-500')
  return twMerge(classes, props.helperClass)
})

const errorClassName = computed(() => {
  const classes: string[] = []
  classes.push('text-sm', 'text-red-500')
  return twMerge(classes, props.errorClass)
})

const slots = useSlots()
</script>

<template>
  <div :class="className">
    <label v-if="slots.label" :class="labelClassName" :for="props.for">
      <slot name="label" />
    </label>
    <slot
      v-if="slots.control"
      :id="props.for"
      name="control"
    />
    <p v-if="slots.helper" :class="helperClassName">
      <slot name="helper" />
    </p>
    <p v-if="slots.error" :class="errorClassName">
      <slot name="error" />
    </p>
  </div>
</template>

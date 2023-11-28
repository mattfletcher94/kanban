<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  class?: string
  color?: 'primary' | 'secondary' | 'danger'
  variant?: 'solid' | 'tonal' | 'ghost' | 'outline' | 'link'
  shape?: 'rounded' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  selected?: boolean
  as?: 'button' | 'a'
  disabled?: boolean
}>(), {
  class: '',
  color: 'primary',
  variant: 'solid',
  shape: 'rounded',
  size: 'md',
  type: 'button',
  selected: false,
  as: 'button',
  disabled: false,
} as const)

const className = computed(() => {
  const classes = []

  // General
  classes.push('relative', 'inline-flex', 'items-center', 'justify-center', 'gap-2', 'font-medium', 'leading-5', 'transition', 'outline-none', 'focus:outline-none')
  classes.push('text-sm', 'font-semibold')

  // Shape
  if (props.shape === 'rounded')
    classes.push('rounded-md')
  if (props.shape === 'circle')
    classes.push('rounded-full')

  // Sizes
  if (props.size === 'sm')
    classes.push('text-xs')
  if (props.size === 'md')
    classes.push('text-sm')
  if (props.size === 'lg')
    classes.push('text-md')

  // Shape and size combinations
  if (props.shape === 'rounded' && props.size === 'sm')
    classes.push('px-2', 'h-8')
  else if (props.shape === 'rounded' && props.size === 'md')
    classes.push('px-4', 'h-10')
  else if (props.shape === 'rounded' && props.size === 'lg')
    classes.push('px-6', 'h-12')
  else if (props.shape === 'circle' && props.size === 'sm')
    classes.push('w-8', 'h-8', 'p-0')
  else if (props.shape === 'circle' && props.size === 'md')
    classes.push('w-10', 'h-10', 'p-0')
  else if (props.shape === 'circle' && props.size === 'lg')
    classes.push('w-12', 'h-12', 'p-0')

  // Primary color
  if (props.color === 'primary' && props.variant === 'solid')
    classes.push('text-white', 'bg-primary-500', 'hover:bg-primary-600', 'active:bg-primary-700', 'focus-visible:bg-primary-600')
  else if (props.color === 'primary' && props.variant === 'tonal')
    classes.push('text-primary-600', 'bg-primary-100', 'hover:bg-primary-200', 'active:bg-primary-300', 'focus-visible:bg-primary-200')
  else if (props.color === 'primary' && props.variant === 'ghost')
    classes.push('text-primary-600', 'bg-transparent', 'hover:bg-primary-100', 'active:bg-primary-200', 'focus-visible:bg-primary-100')
  else if (props.color === 'primary' && props.variant === 'link')
    classes.push('text-primary-600', 'underline', 'bg-transparent', 'hover:text-primary-700', 'active:text-primary-700', 'focus-visible:text-primary-700')

  // Secondary color
  if (props.color === 'secondary' && props.variant === 'solid')
    classes.push('text-black', 'bg-slate-100', 'hover:bg-slate-200', 'active:bg-slate-300', 'focus-visible:bg-slate-200')
  else if (props.color === 'secondary' && props.variant === 'tonal')
    classes.push('text-black', 'bg-slate-100', 'hover:bg-slate-200', 'active:bg-slate-300', 'focus-visible:bg-slate-200')
  else if (props.color === 'secondary' && props.variant === 'ghost')
    classes.push('text-black', 'bg-transparent', 'hover:bg-slate-100', 'active:bg-slate-200', 'focus-visible:bg-slate-100')
  else if (props.color === 'secondary' && props.variant === 'link')
    classes.push('text-black', 'underline', 'bg-transparent', 'hover:text-slate-800', 'active:text-slate-700', 'focus-visible:text-slate-800')

  // Danger color
  if (props.color === 'danger' && props.variant === 'solid')
    classes.push('text-white', 'bg-red-500', 'hover:bg-red-600', 'active:bg-red-700', 'focus-visible:bg-red-600')
  else if (props.color === 'danger' && props.variant === 'tonal')
    classes.push('text-red-600', 'bg-red-100', 'hover:bg-red-200', 'active:bg-red-300', 'focus-visible:bg-red-200')
  else if (props.color === 'danger' && props.variant === 'ghost')
    classes.push('text-red-600', 'bg-transparent', 'hover:bg-red-100', 'active:bg-red-200', 'focus-visible:bg-red-100')
  else if (props.color === 'danger' && props.variant === 'link')
    classes.push('text-red-600', 'underline', 'bg-transparent', 'hover:text-red-700', 'active:text-red-700', 'focus-visible:text-red-700')

  // Disabled
  if (props.disabled)
    classes.push('cursor-not-allowed', 'opacity-60')

  return twMerge(classes, props.class)
})
</script>

<template>
  <component
    :is="props.as"
    :class="className"
    :type="props.type"
    :disabled="props.disabled"
    :aria-disabled="props.disabled"
  >
    <slot />
  </component>
</template>

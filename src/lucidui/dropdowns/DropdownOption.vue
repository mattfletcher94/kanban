<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { computed, useSlots } from 'vue'
import Button from './../buttons/Button.vue'

const props = withDefaults(defineProps<{
  class?: string
  classLabel?: string
  classStart?: string
  classEnd?: string
  selected?: boolean
  disabled?: boolean
}>(), {
  class: '',
  classLabel: '',
  classStart: '',
  classEnd: '',
  selected: false,
  disabled: false,
})

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const slots = useSlots()

const className = computed(() => {
  const classes = []
  classes.push('dropdown-option', 'truncate', 'shrink-0', 'rounded-none')
  if (props.selected)
    classes.push('bg-primary-50')
  return twMerge(classes, props.class)
})

const classNameLabel = computed(() => {
  const classes = []
  classes.push('shrink-1', 'text-left', 'max-w-full', 'w-full', 'min-w-0', 'truncate', 'pointer-events-none')
  return twMerge(classes, props.classLabel)
})

const classNameStart = computed(() => {
  const classes = []
  classes.push('shrink-0')
  return twMerge(classes, props.classStart)
})

const classNameEnd = computed(() => {
  const classes = []
  classes.push('shrink-0')
  return twMerge(classes, props.classEnd)
})
</script>

<template>
  <Button
    :class="className"
    variant="ghost"
    color="secondary"
    type="button"
    role="menuitem"
    :selected="props.selected"
    :disabled="props.disabled"
    @click="emits('click', $event)"
  >
    <span
      v-if="slots.start"
      :class="classNameStart"
      aria-hidden="true"
    >
      <slot
        name="start"
        :selected="props.selected"
        :disabled="props.disabled"
      />
    </span>
    <div
      v-if="slots.label"
      :class="classNameLabel"
    >
      <slot
        name="label"
        :selected="props.selected"
        :disabled="props.disabled"
      />
    </div>
    <span
      v-if="slots.end"
      :class="classNameEnd"
      aria-hidden="true"
    >
      <slot
        name="end"
        :selected="props.selected"
        :disabled="props.disabled"
      />
    </span>
  </Button>
</template>

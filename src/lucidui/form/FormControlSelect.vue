<script
  setup
  lang="ts"
  generic="T extends { id: string | number }, U extends string | number"
>
import { computed, useSlots } from 'vue'
import { Dropdown, DropdownOption, FormControlSelectButton } from '@/lucidui'

const props = withDefaults(defineProps<{
  id?: string
  class?: string
  options: T[]
  value: U
}>(), {
  id: '',
  class: '',
})

const emits = defineEmits<{
  change: [value: T]
}>()

const slots = useSlots()

const selectedOption = computed(() => {
  return props.options.find(option => option.id === props.value)
})
</script>

<template>
  <Dropdown class="w-full" dropdown-width="cover">
    <template #trigger="{ toggle, isOpen }">
      <FormControlSelectButton :id="id" :open="isOpen" @click="toggle">
        <slot
          v-if="selectedOption"
          name="label"
          :selected="selectedOption"
        />
      </FormControlSelectButton>
    </template>
    <template #options>
      <DropdownOption
        v-for="option in props.options"
        :key="option.id"
        :value="option.id"
        :selected="option.id === props.value"
        @click="emits('change', option)"
      >
        <template v-if="slots['option-start']" #start>
          <slot
            name="option-start"
            :option="option"
          />
        </template>
        <template v-if="slots['option-label']" #label>
          <slot
            name="option-label"
            :option="option"
          />
        </template>
        <template v-if="slots['option-end']" #end>
          <slot
            name="option-end"
            :option="option"
          />
        </template>
      </DropdownOption>
    </template>
  </Dropdown>
</template>

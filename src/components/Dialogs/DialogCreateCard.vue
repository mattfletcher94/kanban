<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { watch } from 'vue'
import type { CardCreate, ColumnCreate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  columnId: string
  columnTitle: string
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: CardCreate): void
}>()

const form = useForm<CardCreate>({
  initialValues: {
    columnId: props.columnId,
    title: '',
    order: 0,
  },
  validationSchema: toFormValidator(zod.object({
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
  })),
})

const title = form.useFieldModel('title')

const onSubmit = form.handleSubmit((values, actions) => {
  emits('create', values)
})

const onClose = () => {
  emits('close')
}

watch(() => props.open, () => {
  props.open && form.handleReset()
})
</script>

<template>
  <Dialog
    :title="`Add card to ${props.columnTitle}`"
    width="420px"
    :open="props.open"
    @close="() => onClose()"
  >
    <template #content>
      <form @submit.prevent="() => onSubmit()">
        <FormGroup
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.title) || ''"
        >
          <input
            v-model="title"
            type="text"
            placeholder="Enter column name..."
          >
        </FormGroup>
        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="btn btn--primary" type="submit">
            Create Card
          </button>
        </div>
      </form>
    </template>
  </Dialog>
</template>


<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { watch } from 'vue'
import type { ColumnCreate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  boardId: string
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: ColumnCreate): void
}>()

const form = useForm<ColumnCreate>({
  initialValues: {
    boardId: props.boardId,
    title: '',
    order: 0,
  },
  validationSchema: toTypedSchema(zod.object({
    boardId: zod.string().min(1, 'Board is required'),
    title: zod.string().min(1, 'Name is required'),
    order: zod.number().default(0),
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
    title="Add Column"
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
        <div class="flex items-center justify-end gap-4 mt-6">
          <button class="btn btn--primary" type="submit">
            Create Column
          </button>
        </div>
      </form>
    </template>
  </Dialog>
</template>


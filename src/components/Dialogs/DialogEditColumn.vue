<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { unref, watch } from 'vue'
import type { Column, ColumnCreate, ColumnUpdate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  column: Column | null
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'save', column: ColumnUpdate): void
}>()

const form = useForm<ColumnUpdate>({
  initialValues: {
    id: unref(props.column?.id || ''),
    boardId: unref(props.column?.boardId || ''),
    title: unref(props.column?.title),
  },
  validationSchema: toFormValidator(zod.object({
    boardId: zod.string().min(1, 'Board is required'),
    title: zod.string().min(1, 'Name is required'),
  })),
})

const title = form.useFieldModel('title')

const onSubmit = form.handleSubmit((values, actions) => {
  emits('save', values)
})

const onClose = () => {
  emits('close')
}

watch(() => props.open, () => {
  if (props.open) {
    form.setValues({
      id: unref(props.column?.id || ''),
      boardId: unref(props.column?.boardId || ''),
      title: unref(props.column?.title),
    })
  }
})
</script>

<template>
  <Dialog
    title="Update Column"
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
            Save Column
          </button>
        </div>
      </form>
    </template>
  </Dialog>
</template>


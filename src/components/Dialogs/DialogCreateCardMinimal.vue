<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { unref, watch } from 'vue'
import type { CardCreate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  columnId: string
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
    labelIds: [],
    links: [],
    todos: [],
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

watch(() => [props.open, props.columnId], () => {
  if (props.open) {
    console.log(props.columnId)
    form.setValues({
      columnId: unref(props.columnId),
      title: '',
      labelIds: [],
      todos: [],
      links: [],
      order: 0,
    })
  }
})
</script>

<template>
  <Dialog
    title="Add card"
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
            placeholder="Enter card name..."
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


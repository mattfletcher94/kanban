<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { watch } from 'vue'
import type { ColumnCreate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'

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
        <FormGroup>
          <template #label>
            Title *
          </template>
          <template #control="{ id }">
            <FormControlText
              :id="id"
              :value="title"
              type="text"
              placeholder="Enter title..."
              @input="(value) => title = value"
            />
          </template>
          <template v-if="form.submitCount.value > 0 && form.errors.value.title" #error>
            {{ form.errors.value.title }}
          </template>
        </FormGroup>
        <Button class="w-full mt-6" type="submit">
          Create Column
        </Button>
      </form>
    </template>
  </Dialog>
</template>


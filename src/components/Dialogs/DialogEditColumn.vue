<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { unref, watch } from 'vue'
import type { Column, ColumnUpdate } from '../../stores/boards'
import Dialog from './Dialog.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'

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
  validationSchema: toTypedSchema(zod.object({
    id: zod.string().min(1, 'Id is required'),
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
    title="Edit Column"
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
              placeholder="Enter card title..."
              @input="(value) => title = value"
            />
          </template>
          <template v-if="form.submitCount.value > 0 && form.errors.value.title" #error>
            {{ form.errors.value.title }}
          </template>
        </FormGroup>
        <Button class="w-full mt-6" type="submit">
          Save Column
        </Button>
      </form>
    </template>
  </Dialog>
</template>


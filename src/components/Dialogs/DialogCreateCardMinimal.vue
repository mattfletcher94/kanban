<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { unref, watch } from 'vue'
import type { CardCreate } from '../../stores/boards'
import IconClose from '../Icons/IconClose.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'

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
  validationSchema: toTypedSchema(zod.object({
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
    labelIds: zod.array(zod.string()).default([]),
    links: zod.array(zod.string()).default([]),
    todos: zod.array(zod.string()).default([]),
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

watch(() => [props.open, props.columnId], () => {
  if (props.open) {
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
  <Modal
    width="420px"
    :open="props.open"
    @submit="onSubmit"
    @close="onClose"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          Add Card
        </template>
        <template #actions>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="onClose"
          >
            <IconClose class="w-5 h-5" />
          </Button>
        </template>
      </ModalHeader>
    </template>
    <template #body>
      <div class="p-6">
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
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="primary"
            type="submit"
            :disabled="!form.meta.value.valid"
          >
            Add Card
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


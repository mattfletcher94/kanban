<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { unref, watch } from 'vue'
import type { Column, ColumnUpdate } from '../../stores/boards'
import IconClose from '../Icons/IconClose.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
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
  <Modal
    width="420px"
    :open="props.open"
    @submit="onSubmit"
    @close="onClose"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          Edit Column
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
            Save Column
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


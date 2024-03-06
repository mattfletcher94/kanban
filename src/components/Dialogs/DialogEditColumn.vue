<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import { unref, watch } from 'vue'
import type { Column, ColumnUpdate } from '../../stores/boards'
import { Button, FormGroup, FormControlText, Modal, ModalHeader, ModalFooter } from '@/lucidui'
import { useEditColumnForm } from '@/composables/useEditColumnForm'

const props = defineProps<{
  column: Column | null
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'save', column: ColumnUpdate): void
}>()

const form = useEditColumnForm({
  initialValues: {
    id: unref(props.column?.id || ''),
    boardId: unref(props.column?.boardId || ''),
    title: unref(props.column?.title),
  },
})

const onSubmit = form.handleSubmit((values, actions) => {
  emits('save', values)
})

const onClose = () => {
  emits('close')
}

watch(() => props.open, () => {
  if (props.open) {
    form.resetForm({
      values: {
        id: unref(props.column?.id || ''),
        boardId: unref(props.column?.boardId || ''),
        title: unref(props.column?.title),
      }
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
            <X class="w-5 h-5" />
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
              :value="form.values.title.value"
              type="text"
              placeholder="Enter card title..."
              @input="(value) => form.values.title.value = value"
            />
          </template>
          <template v-if="form.errorBag.value.title?.[0]" #error>
            {{ form.errorBag.value.title?.[0] }}
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


<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import { watch } from 'vue'
import { Button, FormGroup, FormControlText, Modal, ModalHeader, ModalFooter } from '@/lucidui'
import { useCreateColumnForm } from '@/composables/useCreateColumnForm'
import type { ColumnCreate } from '@/stores/boards'

const props = defineProps<{
  boardId: string
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: ColumnCreate): void
}>()

const form = useCreateColumnForm({
  initialValues: {
    boardId: props.boardId,
  },
})

const onSubmit = form.handleSubmit((values, actions) => {
  emits('create', values)
})

const onClose = () => {
  emits('close')
}

watch(() => props.open, () => {
  if (props.open) {
    form.resetForm({
      values: {
        boardId: props.boardId,
      },
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
          Add Column
        </template>
        <template #actions>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="onClose()"
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
              placeholder="Enter title..."
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
            Add Column
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import { Modal, ModalHeader, ModalFooter, Button } from '@/lucidui'

const props = defineProps<{
  open: boolean
  title: string
  message: string
}>()

const emits = defineEmits<{
  (event: 'cancel'): void
  (event: 'confirm'): void
}>()

const onSubmit = async () => {
  emits('confirm')
}

const onCancel = () => {
  emits('cancel')
}
</script>

<template>
  <Modal
    width="420px"
    :open="props.open"
    @submit="onSubmit"
    @close="onCancel"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          {{ props.title }}
        </template>
        <template #actions>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="onCancel()"
          >
            <X class="w-5 h-5" />
          </Button>
        </template>
      </ModalHeader>
    </template>
    <template #body>
      <div class="p-6 text-sm">
        {{ props.message }}
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="secondary"
            type="button"
            @click="onCancel()"
          >
            Cancel
          </Button>
          <Button
            class="w-full"
            color="danger"
            type="submit"
          >
            Confirm
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


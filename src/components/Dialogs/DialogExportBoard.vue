<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import { POSITION, useToast } from 'vue-toastification'
import { useBoardsStore } from '../../stores/boards'
import { Button, FormGroup, FormControlText, Modal, ModalHeader, ModalFooter } from '@/lucidui'


const props = defineProps<{
  boardId: string
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
}>()

const boardsStore = useBoardsStore()
const toast = useToast()

const onSubmit = async () => {
  const board = boardsStore.getBoardById(props.boardId)
  if (!board)
    return
  const columns = boardsStore.getBoardColumns(props.boardId)
  const cards = boardsStore.getBoardCards(props.boardId)
  const labels = boardsStore.getLabels
  const labelsUsedByTheseCards = labels.filter(label => cards.some(card => card.labelIds.includes(label.id)))
  const fileFriendlyUnixTimestamp = Date.now().toString()
  const data = {
    exportedAt: fileFriendlyUnixTimestamp,
    board,
    columns,
    cards,
    labels: labelsUsedByTheseCards,
  }
  const fileFriendlyBoardName = board.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const response = await window.api.importer.export({
    json: JSON.stringify(data),
    filename: `${fileFriendlyBoardName}_${fileFriendlyUnixTimestamp}.json`,
  })
  if (response.result === 'success') {
    toast.success('Your export file has been saved successfully.', {
      position: POSITION.TOP_CENTER,
    })

    emits('close')
  }
  else if (response.result === 'error') {
    toast.error('Sorry, there was an error saving your export file.', {
      position: POSITION.TOP_CENTER,
    })
  }
}

const onClose = () => {
  emits('close')
}
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
          <div class="flex items-center justify-between">
            Export Board
            <div class="rounded-full text-sm font-semibold px-2 py-1 border border-blue-500 bg-blue-100">
              Beta
            </div>
          </div>
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
      <div class="p-6 text-sm">
        <!-- Write some copy about exporting the board -->
        Export your board to a JSON file, which you can then import.
        This will allow you to share your board across multiple devices.
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="primary"
            type="submit"
          >
            Download
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


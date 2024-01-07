<script lang="ts" setup>
import { POSITION, useToast } from 'vue-toastification'
import { z } from 'zod'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import IconClose from '../Icons/IconClose.vue'
import IconFolder from '../Icons/IconFolder.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import type { ImportSchema } from '@/stores/boards'
import { BoardSchema, CardSchema, ColumnSchema, LabelSchema, useBoardsStore } from '@/stores/boards'

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
}>()

const router = useRouter()
const boardsStore = useBoardsStore()
const toast = useToast()

const importData = ref<z.infer<typeof ImportSchema> | null>(null)
const importType = ref<'overwrite' | 'new'>('new')

const existingBoard = computed(() => {
  if (!importData.value)
    return undefined
  return boardsStore.getBoardById(importData.value.board.id)
})

const handleSelectFile = async () => {
  const result = await window.api.importer.select()
  if (!result)
    return

  const zodSchema = z.object({
    exportedAt: z.string(),
    board: BoardSchema,
    columns: z.array(ColumnSchema),
    cards: z.array(CardSchema),
    labels: z.array(LabelSchema),
  })

  try {
    const parsed = zodSchema.parse(result.data)
    importData.value = parsed
    importType.value = 'new'
  }
  catch (error) {
    importData.value = null
    toast.error('Sorry, there was an error parsing your import file.', {
      position: POSITION.TOP_CENTER,
      hideProgressBar: true,
      timeout: 6000,
    })
  }
}

const unixTimestampToFriendlyDate = (unixTimestamp: string) => {
  const date = new Date(parseInt(unixTimestamp))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

const onClose = () => {
  emits('close')
}

const onSubmit = async () => {
  if (!importData.value)
    return

  let newBoardId

  if (importType.value === 'new' && !existingBoard.value) {
    newBoardId = boardsStore.importBoard(importData.value, {
      mode: 'new',
    })
  }
  else if (importType.value === 'new' && existingBoard.value) {
    importData.value.board.title = `${importData.value.board.title} (1)`
    newBoardId = boardsStore.importBoard(importData.value, {
      mode: 'new',
    })
  }
  else if (importType.value === 'overwrite' && existingBoard.value) {
    newBoardId = boardsStore.importBoard(importData.value, {
      mode: 'overwrite',
    })
  }

  if (newBoardId) {
    toast.success('Board imported successfully!', {
      position: POSITION.TOP_CENTER,
      hideProgressBar: true,
      timeout: 6000,
    })
    onClose()
    router.push(`/boards/${newBoardId}`)
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      importData.value = null
      importType.value = 'new'
    }
  },
)
</script>

<template>
  <Modal
    width="450px"
    :open="props.open"
    @submit="onSubmit"
    @close="onClose"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          <div class="flex items-center justify-between">
            Import Board
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
            <IconClose class="w-5 h-5" />
          </Button>
        </template>
      </ModalHeader>
    </template>
    <template #body>
      <div class="p-6">
        <FormGroup>
          <template #label>
            JSON import file *
          </template>
          <template #control="{ id }">
            <Button
              :id="id"
              class="w-full justify-start border border-slate-300"
              color="secondary"
              @click="handleSelectFile"
            >
              <IconFolder class="w-4 h-4" />
              Select file
            </Button>
          </template>
        </FormGroup>
        <div
          v-if="importData"
          class="mt-6"
        >
          <h3 class="text-sm font-semibold text-slate-900">
            Import details:
          </h3>

          <!-- Display the board details in a nested structure with columns and cards -->
          <ul class="mt-2 text-sm flex flex-col divide-y divide-slate-300 bg-slate-100 rounded-lg border border-slate-300 overflow-x-hidden overflow-y-auto max-h-[320px]">
            <li class="flex items-center gap-2 p-2 font-medium">
              <strong>
                {{ importData.board.title }}
              </strong>
            </li>
            <li class="flex flex-col">
              <ul class="flex flex-col divide-y divide-slate-300">
                <li
                  v-for="column in importData.columns.sort((a, b) => a.order - b.order)"
                  :key="column.id"
                  class="flex flex-col p-2"
                >
                  <div class="whitespace-nowrap text-ellipsis overflow-hidden font-semibold">
                    ({{ column.order + 1 }})
                    {{ column.title }}
                  </div>
                  <ul v-if="importData.cards.filter(card => card.columnId === column.id).length" class="flex flex-col gap-2 mt-2">
                    <li
                      v-for="card in importData.cards.filter(card => card.columnId === column.id).sort((a, b) => a.order - b.order)"
                      :key="card.id"
                      class="flex items-center gap-2 pl-4 whitespace-nowrap text-ellipsis overflow-hidden font-medium"
                    >
                      ({{ column.order + 1 }}.{{ card.order + 1 }}) {{ card.title }}
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li class="flex items-center gap-2 p-2 font-medium">
              Exported at: {{ unixTimestampToFriendlyDate(importData.exportedAt) }}
            </li>
          </ul>
          <div v-if="existingBoard" class="mt-6 text-sm">
            <p class="text-slate-900">
              This board already exists on this device.
              What would you like to do?
            </p>
            <div class="mt-2 flex items-center justify-between rounded-lg border border-primary-500">
              <Button
                color="primary"
                :variant="importType === 'new' ? 'solid' : 'ghost'"
                class="w-full rounded-r-none"
                @click="importType = 'new'"
              >
                Create new board
              </Button>
              <Button
                color="primary"
                :variant="importType === 'overwrite' ? 'solid' : 'ghost'"
                class="w-full rounded-l-none border-l border-l-primary-500"
                @click="importType = 'overwrite'"
              >
                Overwrite existing board
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="primary"
            type="submit"
            :disabled="!importData"
          >
            Run import
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


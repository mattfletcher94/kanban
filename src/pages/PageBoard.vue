<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import Sortable from 'sortablejs'
import { marked } from 'marked'
import SmoothReflow from '../components/SmoothReflow.vue'
import DialogCreateBoard from '../components/Dialogs/DialogCreateBoard.vue'
import DialogCreateColumn from '../components/Dialogs/DialogCreateColumn.vue'
import DialogCreateCard from '../components/Dialogs/DialogCreateCard.vue'
import DialogEditCard from '../components/Dialogs/DialogEditCard.vue'
import IconChevonDown from '../components/Icons/IconChevonDown.vue'
import IconAdd from '../components/Icons/IconAdd.vue'
import IconConfig from '../components/Icons/IconConfig.vue'
import Dropdown from '../components/Dropdowns/Dropdown.vue'
import DropdownOption from '../components/Dropdowns/DropdownOption.vue'
import PopoverEditBoard from '../components/Popovers/PopoverEditBoard.vue'
import IconHandle from '../components/Icons/IconHandle.vue'
import IconBin from '../components/Icons/IconBin.vue'
import DialogEditColumn from '../components/Dialogs/DialogEditColumn.vue'
import IconPencil from '../components/Icons/IconPencil.vue'
import { useBoardsStore } from './../stores/boards'
import type { BoardCreate, BoardUpdate, Card, CardCreate, CardUpdate, Column, ColumnCreate, ColumnUpdate } from './../stores/boards'

const router = useRouter()
const route = useRoute()
const boardsStore = useBoardsStore()

const board = computed(() => boardsStore.getBoardById((route.params.boardId as string) || ''))
const theme = computed(() => boardsStore.getThemeById(board.value?.themeId || ''))
const columns = computed(() => boardsStore.getBoardColumns(board.value?.id || '').sort((a, b) => a.order - b.order))

const columnRef = ref<HTMLElement>()
const cardRefs = ref<HTMLElement[]>([])
const isCreateDialogOpen = ref(false)

const isCreateColumnDialogOpen = ref(false)
const editColumnCandidate = ref<Column | null>(null)
const createCardColumnCandidate = ref<string | null>(null)

const isCreateCardDialogOpen = ref(false)
const editCardCandidate = ref<Card | null>(null)

const columnsSortableInstance = ref<Sortable>()
const cardSortableInstances = ref<Map<string, Sortable>>(new Map())

const parseMarkdown = (markdown = '') => {
  return marked.parse(markdown, {
    headerIds: false,
  })
}

const parseMarkdownInline = (markdown = '') => {
  return marked.parseInline(markdown, {
    headerIds: false,
  })
}

const handleCreateBoard = (board: BoardCreate) => {
  const created = boardsStore.createBoard(board)
  router.push(`/boards/${created.id}`)
  isCreateDialogOpen.value = false
}

const handleUpdateBoard = (updatedValues: BoardUpdate) => {
  if (!board.value)
    return
  boardsStore.updateBoard(updatedValues)
}

const handleDeleteBoard = async () => {
  if (!board.value)
    return

  if (boardsStore.boards.length === 1) {
    alert('You cannot delete the last board.')
    return
  }

  if (window.confirm(`Are you sure you want to delete the board "${board.value.title}"?`)) {
    boardsStore.deleteBoard(board.value.id)
    const nextBoard = boardsStore.boards[0]
    router.push(`/boards/${nextBoard.id}`)
  }
}

const handleCreateColumn = (column: ColumnCreate) => {
  boardsStore.createColumn({
    ...column,
    order: columns.value.length > 0 ? columns.value[columns.value.length - 1].order + 1 : 0,
  })
  isCreateColumnDialogOpen.value = false
}

const handleUpdateColumn = (column: ColumnUpdate) => {
  boardsStore.updateColumn(column)
  editColumnCandidate.value = null
}

const handleDeleteColumn = (columnId: string) => {
  boardsStore.deleteColumn(columnId)
}

const handleCreateCard = (card: CardCreate) => {
  card.order = boardsStore.getColumnCards(card.columnId).length
  boardsStore.createCard(card)
  createCardColumnCandidate.value = null
}

const handleUpdateCard = (card: CardUpdate) => {
  boardsStore.updateCard(card)
  // editCardCandidate.value = null
}

const initSortableCards = () => {
  // Destroy all existing sortable instances
  cardSortableInstances.value.forEach(sortable => sortable.destroy())
  cardSortableInstances.value.clear()

  // Init new sortable instances
  cardRefs.value.forEach((ref) => {
    const columnId = ref?.dataset.columnId
    if (!columnId)
      return
    cardSortableInstances.value.set(columnId, Sortable.create(ref, {
      group: 'cards',
      animation: 300,
      dataIdAttr: 'data-card-id',
      handle: '.board__columns__column__cards__card__handle',
      draggable: '.board__columns__column__cards__card',
      chosenClass: 'board__columns__column__cards__card--chosen',
      onEnd(this: Sortable, evt) {
        if (!board.value)
          return

        const oldColumnId = evt.from.dataset.columnId || ''
        const newColumnId = evt.to.dataset.columnId || ''

        // Update orders in the same column
        if (oldColumnId === newColumnId) {
          const orders = this.toArray()
          const columnCards = boardsStore.getColumnCards(oldColumnId)
          columnCards.forEach((card, i) => {
            boardsStore.updateCard({
              ...card,
              columnId: card.columnId,
              order: orders.indexOf(card.id),
            })
          })
        }

        // Card has changed column
        else {
          const newColumnSortableInstance = cardSortableInstances.value.get(newColumnId)
          if (!newColumnSortableInstance)
            return
          const card = boardsStore.getCardById(evt.item.dataset.cardId || '')
          if (!card)
            return
          boardsStore.updateCard({
            ...card,
            id: card.id,
            columnId: newColumnId,
          })

          const orders = newColumnSortableInstance.toArray()
          const columnCards = boardsStore.getColumnCards(newColumnId)
          columnCards.forEach((c) => {
            boardsStore.updateCard({
              ...card,
              columnId: newColumnId,
              order: orders.indexOf(c.id),
            })
          })
        }
      },
    }))
  })
}

const initSortableColumns = () => {
  if (!columnRef.value)
    return
  // Destroy all existing sortable instances
  columnsSortableInstance.value?.destroy()

  // Init sortable
  columnsSortableInstance.value = Sortable.create(columnRef.value, {
    group: 'columns',
    animation: 300,
    draggable: '.board__columns__column',
    handle: '.board__columns__column__handle',
    dataIdAttr: 'data-column-id',
    chosenClass: 'board__columns__column--chosen',
    direction: 'horizontal',
    onEnd(this: Sortable) {
      const orders = this.toArray()
      const columns = boardsStore.getBoardColumns(board.value?.id || '')
      columns.forEach((col) => {
        boardsStore.updateColumn({
          id: col.id,
          boardId: col.boardId,
          order: orders.indexOf(col.id),
        })
      })
    },
  })
}

onMounted(() => {
  if (route.params.boardId) {
    nextTick().then(() => initSortableColumns())
    nextTick().then(() => initSortableCards())
    return
  }

  const selectedBoard = boardsStore.getBoardById(boardsStore.selectedBoardId)
  if (selectedBoard) {
    router.push(`/boards/${selectedBoard.id}`)
    return
  }

  const nextBoard = boardsStore.boards[0]
  router.push(`/boards/${nextBoard.id}`)
})

onBeforeUnmount(() => {
  columnsSortableInstance.value?.destroy()
  cardSortableInstances.value.forEach(sortable => sortable.destroy())
  cardSortableInstances.value.clear()
})

// Watch columns length and re-init sortable
watch(() => columns.value.length, () => {
  nextTick().then(() => initSortableColumns())
  nextTick().then(() => initSortableCards())
})
</script>

<template>
  <div v-if="board" class="relative block w-full h-screen overflow-hidden text-slate-700">

    <!-- Theme bg -->
    <Transition mode="out-in" appear name="background">
      <div
        v-if="theme"
        :key="theme?.id"
        class="absolute inset-0 bg-cover bg-no-repeat bg-center"
        :style="{ backgroundImage: `url(${theme?.image})` }"
      />
    </Transition>

    <!-- Header -->
    <header class="relative block w-full text-base z-20 bg-white shadow-md">
      <div class="block h-16 px-4 mx-auto">
        <div class="flex items-center gap-4 h-full">
          <div>
            <div class="flex items-center justify-center w-9 h-9 rounded-md bg-primary-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
          </div>
          <div>
            <Dropdown width="100%">
              <template #trigger>
                <button class="btn btn--gray flex w-48 items-center justify-between font-bold rounded-md h-9">
                  <Transition mode="out-in" name="slide-fade">
                    <div :key="board.title" class="tracking-wide min-w-0 truncate">
                      {{ board.title }}
                    </div>
                  </Transition>
                  <div>
                    <IconChevonDown class="w-4 h-4" />
                  </div>
                </button>
              </template>
              <template #options>
                <DropdownOption
                  @click="() => isCreateDialogOpen = true"
                >
                  <div class="flex items-center gap-4 w-full">
                    <div>
                      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white">
                        <IconAdd class="w-4 h-4" />
                      </div>
                    </div>
                    <div class="min-w-0 truncate">
                      Create Board
                    </div>
                  </div>
                </DropdownOption>
                <DropdownOption
                  v-for="b in boardsStore.boards.sort((a, b) => a.title.localeCompare(b.title))"
                  :key="b.id"
                  :disabled="b.id === board?.id"
                  @click="() => router.push(`/boards/${b.id}`)"
                >
                  <div class="flex items-center gap-4 w-full">
                    <div>
                      <div
                        class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                        :style="{ backgroundImage: `url(${boardsStore.getThemeById(b.themeId)?.image})` }"
                      />
                    </div>
                    <div class="min-w-0 truncate">
                      {{ b.title }}
                    </div>
                  </div>
                </DropdownOption>
              </template>
            </Dropdown>
          </div>
          <div class="ml-auto">
            <button
              class="btn btn--gray h-9 flex items-center gap-2 justify-between font-bold rounded-md"
              @click="() => isCreateColumnDialogOpen = true"
            >
              <div>
                Add Column
              </div>
              <div>
                <IconAdd class="w-4 h-4" />
              </div>
            </button>
          </div>
          <div>
            <PopoverEditBoard
              :key="board.id"
              :board="board"
              :themes="boardsStore.themes"
              trigger-class="btn btn--gray h-9 flex items-center gap-2 justify-between font-bold rounded-md"
              @save-board="(board) => handleUpdateBoard(board)"
              @delete-board="(id) => handleDeleteBoard()"
            >
              <template #trigger>
                <div>
                  Board settings
                </div>
                <div>
                  <IconConfig class="w-4 h-4" />
                </div>
              </template>
            </PopoverEditBoard>
          </div>
        </div>
      </div>
    </header>

    <!-- Board area -->
    <Transition
      class="board overflow-x-auto overflow-y-hidden w-full"
      name="board"
      as="div"
      appear
    >

      <!-- Columns -->
      <div
        ref="columnRef"
        class="board__columns flex flex-nowrap items-start w-auto p-6 gap-6"
      >
        <div
          v-for="column in columns"
          :id="column.id"
          :key="column.id"
          :data-column-id="column.id"
          class="board__columns__column relative text-base shrink-0 basis-[24rem] max-h-full overflow-hidden bg-slate-100 rounded-lg shadow-md outline-dashed outline-2 outline-transparent outline-offset-2"
        >
          <SmoothReflow>
            <div class="block w-full">

              <!-- Column title -->
              <div class="flex w-full items-center justify-between font-bold gap-4 px-4 h-12 border-b border-b-slate-200 text-slate-800">
                <div
                  class="board__columns__column__handle cursor-grab"
                >
                  <IconHandle class="w-4 h-4" />
                </div>
                <div>
                  <Transition mode="out-in" name="slide-fade">
                    <h3
                      :key="column.title"
                      class="tracking-wide min-w-0 truncate text-sm"
                    >
                      {{ column.title }}
                    </h3>
                  </Transition>
                </div>
                <div class="ml-auto">
                  <button
                    v-tooltip="{ content: 'Add Card' }"
                    class="btn btn--gray flex items-center justify-center w-8 h-8 rounded-full p-0"
                    @click="() => createCardColumnCandidate = column.id"
                  >
                    <IconAdd class="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <Dropdown
                    width="180px"
                    anchor="right"
                  >
                    <template #trigger>
                      <button
                        v-tooltip="{ content: 'Options' }"
                        class="btn btn--gray flex items-center justify-center w-8 h-8 rounded-full p-0"
                      >
                        <IconChevonDown class="w-4 h-4" />
                      </button>
                    </template>
                    <template #options>
                      <DropdownOption
                        @click="() => editColumnCandidate = column"
                      >
                        <div class="flex items-center gap-4 w-full">
                          <div>
                            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white">
                              <IconPencil class="w-3 h-3" />
                            </div>
                          </div>
                          <div class="min-w-0 truncate">
                            Edit Column
                          </div>
                        </div>
                      </DropdownOption>
                      <DropdownOption
                        @click="() => handleDeleteColumn(column.id)"
                      >
                        <div class="flex items-center gap-4 w-full">
                          <div>
                            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
                              <IconBin class="w-4 h-4" />
                            </div>
                          </div>
                          <div class="min-w-0 truncate">
                            Delete Column
                          </div>
                        </div>
                      </DropdownOption>
                    </template>
                  </Dropdown>
                </div>
              </div>

              <!-- Column cards -->
              <div
                class="board__columns__column__cards block w-full overflow-x-hidden overflow-y-auto"
                :style="{
                  maxHeight: `calc(100vh - 4rem - 1.5rem - 1.5rem - 3rem)`,
                }"
              >
                <div
                  ref="cardRefs"
                  :data-column-id="column.id"
                  class="flex flex-col flex-nowrap justify-start gap-4 p-4 w-full min-h-[200px]"
                >

                  <!-- Card -->
                  <div
                    v-for="card in boardsStore.getColumnCards(column.id).sort((a, b) => a.order - b.order)"
                    :id="card.id"
                    :key="card.id"
                    :data-card-id="card.id"
                    :data-column-id="column.id"
                    class="board__columns__column__cards__card rounded-lg bg-white shadow-sm text-slate-700 outline-2 outline-dashed outline-transparent cursor-pointer"
                    @click="() => editCardCandidate = card"
                  >

                    <!-- Card Labels -->
                    <div
                      v-if="card.labelIds && card.labelIds.length"
                      class="flex justify-start items-start gap-4"
                    >
                      <div
                        v-for="label in boardsStore.getCardLabels(card.id)"
                        :key="label.id"
                      >
                        {{ label.title }}
                      </div>
                    </div>

                    <!-- Card title -->
                    <div class="flex w-full items-start justify-start font-medium gap-4 px-4 py-3 border-b border-b-slate-200">
                      <div
                        class="board__columns__column__cards__card__handle cursor-grab"
                      >
                        <IconHandle class="w-4 h-4" />
                      </div>
                      <div class="min-w-0">
                        <h4
                          :key="card.title"
                          class="tracking-wide min-w-0 mt-[3px] text-sm font-semibold"
                          v-html="parseMarkdownInline(card.title)"
                        />
                      </div>
                    </div>

                    <!-- Card body -->
                    <div class="prose-card p-4 min-h-[100px]" v-html="parseMarkdown(card.description)" />
                  </div>
                </div>
              </div>
            </div>
          </SmoothReflow>
        </div>
        <div class="relative shrink-0 basis-[1px] h-[200px]" />
      </div>
    </Transition>

    <!-- Create board dialog -->
    <DialogCreateBoard
      :key="board.id"
      :open="isCreateDialogOpen"
      @close="isCreateDialogOpen = false"
      @create="(board) => handleCreateBoard(board)"
    />

    <!-- Create column dialog -->
    <DialogCreateColumn
      :key="board.id"
      :board-id="board.id"
      :open="isCreateColumnDialogOpen"
      @close="isCreateColumnDialogOpen = false"
      @create="(column) => handleCreateColumn(column)"
    />

    <!-- Edit column dialog -->
    <DialogEditColumn
      :key="board.id"
      :column="editColumnCandidate"
      :open="!!editColumnCandidate"
      @close="editColumnCandidate = null"
      @save="(column) => handleUpdateColumn(column)"
    />

    <!-- Create card dialog -->
    <DialogCreateCard
      v-if="createCardColumnCandidate"
      :key="board.id"
      :column-id="createCardColumnCandidate"
      :column-title="columns.find(column => column.id === createCardColumnCandidate)?.title || ''"
      :open="!!createCardColumnCandidate"
      @close="() => createCardColumnCandidate = null"
      @create="(card) => handleCreateCard(card)"
    />

    <DialogEditCard
      v-if="editCardCandidate"
      :open="!!editCardCandidate"
      :card="editCardCandidate"
      @close="() => editCardCandidate = null"
      @save="(card) => handleUpdateCard(card)"
    />

  </div>
</template>

<style scoped>
.board {
  height: calc(100vh - 4rem);
}
.board::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: rgba(255,255,255,0.8);
}
.board::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  @apply rounded-lg;
}
.board__columns__column__cards::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: rgba(0,0,0,0.1);
}
.board__columns__column__cards::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  @apply rounded-lg;
}

.board__columns__column__cards__card--chosen,
.board__columns__column--chosen {
  @apply !outline-orange-500;
}

/** Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-2px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(2px);
}

.background-enter-active,
.background-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.background-enter-from,
.background-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.board-enter-active,
.board-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.board-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.board-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

<style>
.board-scroller {
  height:calc(100vh - 4rem)
}
.column-scroller {
  height: calc(100vh - 4rem - 1.5rem - 1.5rem - 3rem)
}
</style>

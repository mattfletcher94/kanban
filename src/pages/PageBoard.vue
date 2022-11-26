<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import Sortable from 'sortablejs'
import { POSITION, useToast } from 'vue-toastification'
import DialogCreateBoard from '../components/Dialogs/DialogCreateBoard.vue'
import DialogCreateColumn from '../components/Dialogs/DialogCreateColumn.vue'
import DialogCreateCard from '../components/Dialogs/DialogCreateCard.vue'
import DialogEditCard from '../components/Dialogs/DialogEditCard.vue'
import DialogEditBoard from '../components/Dialogs/DialogEditBoard.vue'
import CardLabel from '../components/CardLabel.vue'
import IconChevonDown from '../components/Icons/IconChevonDown.vue'
import IconAdd from '../components/Icons/IconAdd.vue'
import IconConfig from '../components/Icons/IconConfig.vue'
import Dropdown from '../components/Dropdowns/Dropdown.vue'
import DropdownOption from '../components/Dropdowns/DropdownOption.vue'
import PopoverConfirm from '../components/Popovers/PopoverConfirm.vue'
import IconHandle from '../components/Icons/IconHandle.vue'
import IconBin from '../components/Icons/IconBin.vue'
import IconOpen from '../components/Icons/IconOpen.vue'
import DialogEditColumn from '../components/Dialogs/DialogEditColumn.vue'
import IconPencil from '../components/Icons/IconPencil.vue'
import { useBoardsStore } from './../stores/boards'
import type { BoardCreate, BoardUpdate, Card, CardCreate, CardUpdate, Column, ColumnCreate, ColumnUpdate } from './../stores/boards'

const router = useRouter()
const route = useRoute()
const boardsStore = useBoardsStore()
const toast = useToast()

const board = computed(() => boardsStore.getBoardById((route.params.boardId as string) || ''))
const theme = computed(() => boardsStore.getThemeById(board.value?.themeId || ''))
const columns = computed(() => boardsStore.getBoardColumns(board.value?.id || '').sort((a, b) => a.order - b.order))

const columnRef = ref<HTMLElement>()
const cardRefs = ref<HTMLElement[]>([])
const deleteColumnPopoverTriggerRef = ref<HTMLElement[]>()
const isCreateDialogOpen = ref(false)
const isEditBoardDialogOpen = ref(false)
const isCreateColumnDialogOpen = ref(false)
const editColumnCandidate = ref<Column | null>(null)
const createCardColumnCandidate = ref<string | null>(null)

const editCardCandidate = ref<Card | null>(null)

const columnsSortableInstance = ref<Sortable>()
const cardSortableInstances = ref<Map<string, Sortable>>(new Map())

const handleCreateBoard = (board: BoardCreate) => {
  const created = boardsStore.createBoard(board)
  router.push(`/boards/${created.id}`)
  isCreateDialogOpen.value = false
}

const handleUpdateBoard = (updatedValues: BoardUpdate) => {
  isEditBoardDialogOpen.value = false
  if (!board.value)
    return
  boardsStore.updateBoard(updatedValues)
}

const handleDeleteBoard = async () => {
  if (!board.value) {
    isEditBoardDialogOpen.value = false
    return
  }

  if (boardsStore.boards.length === 1) {
    toast.error('You cannot delete your last board.', {
      position: POSITION.TOP_CENTER,
    })
    return
  }
  isEditBoardDialogOpen.value = false
  boardsStore.deleteBoard(board.value.id)
  const nextBoard = boardsStore.boards[0]
  router.push(`/boards/${nextBoard.id}`)
}

const handleCreateColumn = (column: ColumnCreate) => {
  const highestOrder = Math.max(...columns.value.map(c => c.order)) || 0
  boardsStore.createColumn({
    ...column,
    order: columns.value.length > 0 ? (highestOrder + 1) : 0,
  })
  isCreateColumnDialogOpen.value = false
}

const handleUpdateColumn = (column: ColumnUpdate) => {
  boardsStore.updateColumn(column)
  editColumnCandidate.value = null
}

const handleDeleteColumnClick = (columnIndex: number) => {
  if (!deleteColumnPopoverTriggerRef.value || deleteColumnPopoverTriggerRef.value.length < columnIndex)
    return

  deleteColumnPopoverTriggerRef.value[columnIndex].click()
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
  editCardCandidate.value = null
}

const handleDeleteCard = (cardId: string) => {
  editCardCandidate.value = null
  boardsStore.deleteCard(cardId)
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
      draggable: '.board__columns__column__cards__card',
      chosenClass: 'board__columns__column__cards__card--chosen',
      async onEnd(this: Sortable, evt) {
        if (!board.value)
          return

        const oldColumnId = evt.from.dataset.columnId || ''
        const newColumnId = evt.to.dataset.columnId || ''

        // Update orders in the same column
        if (oldColumnId === newColumnId) {
          const orders = this.toArray()
          const columnCards = boardsStore.getColumnCards(oldColumnId)

          orders.forEach((order, i) => {
            const card = columnCards.find(card => card.id === order)
            if (!card)
              return

            boardsStore.updateCard({
              ...card,
              columnId: card.columnId,
              order: i,
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

          // Move card to column
          boardsStore.updateCard({
            ...card,
            id: card.id,
            columnId: newColumnId,
          })

          const orders = newColumnSortableInstance.toArray()
          const columnCards = boardsStore.getColumnCards(newColumnId)

          orders.forEach((order, i) => {
            const card = columnCards.find(card => card.id === order)
            if (!card)
              return

            boardsStore.updateCard({
              ...card,
              columnId: card.columnId,
              order: i,
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
    boardsStore.selectedBoardId = route.params.boardId as string
    nextTick().then(() => {
      initSortableColumns()
      initSortableCards()
    })
    return
  }

  const selectedBoard = boardsStore.getBoardById(boardsStore.selectedBoardId)
  if (selectedBoard) {
    router.push(`/boards/${selectedBoard.id}`)
    return
  }

  const nextBoard = boardsStore.boards[0] || null
  router.push(`/boards/${nextBoard?.id}`)
})

onBeforeUnmount(() => {
  columnsSortableInstance.value?.destroy()
  cardSortableInstances.value.forEach(sortable => sortable.destroy())
  cardSortableInstances.value.clear()
})

// Watch columns length and re-init sortable
watch(() => columns.value.length, () => {
  nextTick().then(() => {
    initSortableColumns()
    initSortableCards()
  })
})
</script>

<template>
  <div class="relative block w-full h-screen overflow-hidden text-slate-700">

    <!-- Board -->
    <template v-if="board">

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
        <div class="flex items-center gap-4 w-full h-16 px-4">
          <div>
            <div class="flex items-center justify-center w-8 h-8">
              <img src="/logo-256x256.png" class="w-full h-full object-cover object-center">
            </div>
          </div>
          <div class="shrink-0">
            <Dropdown>
              <template #trigger>
                <button class="btn btn--gray flex w-[280px] items-center justify-between font-bold rounded-md h-9">
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
                  <div class="flex items-center gap-4 w-full p-1">
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
                  @click="() => router.push(`/boards/${b.id}`)"
                >
                  <div class="flex items-center gap-4 w-full p-1">
                    <div>
                      <div
                        class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                        :style="{ backgroundImage: `url(${boardsStore.getThemeById(b.themeId)?.thumbnail})` }"
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
            <button
              class="btn btn--gray h-9 flex items-center gap-2 justify-between font-bold rounded-md"
              @click="() => isEditBoardDialogOpen = true"
            >
              <div>
                Board settings
              </div>
              <div>
                <IconConfig class="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <!-- Board area -->
      <Transition
        class="board overflow-x-auto overflow-y-hidden w-full"
        name="board"
        as="div"
        appear
        mode="out-in"
      >

        <!-- Columns -->
        <div
          v-if="columns.length > 0"
          ref="columnRef"
          class="board__columns flex flex-nowrap items-start w-auto p-6 gap-6"
        >
          <div
            v-for="(column, columnIndex) in columns"
            :id="column.id"
            :key="column.id"
            :data-column-id="column.id"
            class="board__columns__column relative text-base shrink-0 basis-[22rem] max-h-full overflow-hidden bg-slate-100 rounded-lg shadow-md outline-dashed outline-2 outline-transparent outline-offset-2"
          >
            <div class="block w-full">

              <!-- Column title -->
              <div class="flex w-full items-center justify-between font-bold gap-4 px-4 py-2.5 border-b border-b-slate-200 text-slate-800">
                <div
                  class="board__columns__column__handle cursor-grab"
                >
                  <IconHandle class="w-4 h-4" />
                </div>
                <div>
                  <Transition mode="out-in" name="slide-fade">
                    <h3
                      :key="column.title"
                      class="tracking-wide text-sm"
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
                        <div class="flex items-center gap-4 w-full p-1">
                          <div>
                            <IconPencil class="w-4 h-4" />
                          </div>
                          <div class="min-w-0 truncate">
                            Edit Column
                          </div>
                        </div>
                      </DropdownOption>
                      <DropdownOption
                        @click="() => handleDeleteColumnClick(columnIndex)"
                      >
                        <div class="flex items-center gap-4 w-full p-1">
                          <div>
                            <IconBin class="w-4 h-4" />
                          </div>
                          <div class="min-w-0 truncate">
                            Delete Column
                          </div>
                        </div>
                      </DropdownOption>
                    </template>
                  </Dropdown>
                  <div class="absolute top-0 right-0">
                    <PopoverConfirm
                      message="Are you sure you want to delete this column? This cannot be undone"
                      trigger-class="absolute top-[30px] right-0 w-0 h-0 p-0"
                      width="240px"
                      anchor="bottom-end"
                      @confirm="() => handleDeleteColumn(column.id)"
                    >
                      <template #trigger>
                        <div ref="deleteColumnPopoverTriggerRef" class="" />
                      </template>
                    </PopoverConfirm>
                  </div>
                </div>
              </div>

              <!-- Column cards -->
              <div
                class="board__columns__column__cards block w-full overflow-x-hidden overflow-y-auto"
                :style="{
                  maxHeight: `calc(100vh - 4rem - 1.5rem - 1.5rem - 3rem - 1rem)`,
                }"
              >
                <div
                  ref="cardRefs"
                  :data-column-id="column.id"
                  class="flex flex-col flex-nowrap justify-start gap-4 p-4 w-full min-h-[200px]"
                >

                  <!-- Card -->
                  <div
                    v-for="card in boardsStore.getColumnCards(column.id)"
                    :id="card.id"
                    :key="card.id"
                    :data-card-id="card.id"
                    :data-column-id="column.id"
                    class="board__columns__column__cards__card rounded-lg p-4 bg-white shadow-sm text-slate-700 outline-2 outline-dashed outline-transparent cursor-grab"
                    @click="() => editCardCandidate = card"
                  >

                    <!-- Card title -->
                    <div class="flex w-full items-start justify-start font-medium gap-4">
                      <div class="min-w-0">
                        <h4
                          :key="card.title"
                          class="min-w-0 mt-[3px] text-base font-bold"
                          v-html="card.title"
                        />
                      </div>
                    </div>

                    <!-- Card Labels -->
                    <div
                      v-if="card.labelIds && card.labelIds.length"
                      class="flex flex-wrap gap-2 w-full items-center mt-2"
                      name="vue-list"
                      tag="div"
                    >
                      <CardLabel
                        v-for="label in boardsStore.getCardLabels(card.id)"
                        :key="label.id"
                        :color="label.color"
                        :title="label.title"
                      >
                        {{ label.title }}
                      </CardLabel>
                    </div>

                    <!-- Card body -->
                    <div class="flex flex-col gap-4 mt-4">
                      <div>

                        <!-- Card description -->
                        <div
                          v-if="card.description"
                          class="prose-card prose-card line-clamp-2"
                          v-html="card.description"
                        />
                      </div>

                      <!-- Card todos progress -->
                      <div
                        v-if="card.todos && card.todos.length"
                        class="flex items-center divide-x divide-x-slate-300 border border-slate-300 justify-start w-full h-4 rounded-lg bg-slate-100 overflow-hidden"
                      >
                        <div
                          v-for="todo in card.todos"
                          :key="todo.id"
                          class="w-full h-full"
                          :class="{
                            'bg-primary-500': todo.completed,
                            'bg-slate-100': !todo.completed,
                          }"
                        />
                      </div>

                      <!-- Card links -->
                      <div
                        v-if="card.links && card.links.length > 0"
                        class="flex flex-wrap gap-2 w-full"
                      >
                        <div
                          v-for="link in card.links"
                          :key="link.id"
                        >
                          <a
                            v-tooltip="{ content: `Open ${link.name} in browser` }"
                            class="btn btn--gray btn--sm text-xs flex items-center gap-2 !text-slate-500 "
                            :href="link.url"
                            target="_blank"
                          >
                            <IconOpen class="w-4 h-4" />
                            <div>
                              {{ link.name }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
                <div class="block w-full px-4 pb-4">
                  <button
                    class="btn btn--light w-full h-9 flex items-center gap-2 justify-center font-bold rounded-md"
                    @click="() => createCardColumnCandidate = column.id"
                  >
                    <div>
                      Add Card
                    </div>
                    <div>
                      <IconAdd class="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="relative shrink-0 basis-[1px] h-[200px]" />
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center flex-col gap-4 text-base p-8 bg-slate-100 rounded-lg shadow-md"
          >
            <p class="font-medium text-base">
              Create your first column
            </p>
            <button
              class="btn btn--primary"
              @click="() => isCreateColumnDialogOpen = true"
            >
              Add Column
            </button>
          </div>
        </div>

      </Transition>

      <!-- Edit Board dialog -->
      <DialogEditBoard
        :board="board"
        :themes="boardsStore.themes"
        :open="isEditBoardDialogOpen"
        @save="(board) => handleUpdateBoard(board)"
        @delete="(boardId) => handleDeleteBoard()"
        @close="() => isEditBoardDialogOpen = false"
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
        :key="board.id"
        :column-id="createCardColumnCandidate || ''"
        :open="!!createCardColumnCandidate"
        @close="() => createCardColumnCandidate = null"
        @create="(card) => handleCreateCard(card)"
      />

      <!-- Edit card dialog -->
      <DialogEditCard
        :open="!!editCardCandidate"
        :card="editCardCandidate"
        @close="() => editCardCandidate = null"
        @save="(card) => handleUpdateCard(card)"
        @delete="(cardId) => handleDeleteCard(cardId)"
      />

    </template>

    <!-- No boards (this should not happen) -->
    <template v-else>
      <div class="relative block w-full h-screen overflow-hidden text-slate-700">
        <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div class="flex items-center justify-center flex-col gap-4 text-base p-8 bg-slate-100 rounded-lg shadow-md">
            <p class="font-medium text-base">
              Create your first board
            </p>
            <button class="btn btn--primary" @click="() => isCreateDialogOpen = true">
              Add Board
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Create board dialog -->
    <DialogCreateBoard
      :open="isCreateDialogOpen"
      @close="isCreateDialogOpen = false"
      @create="(board) => handleCreateBoard(board)"
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

<script setup lang="ts">
import Sortable from 'sortablejs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, Plus, Settings2, GripVertical, Trash, ExternalLink, Download, Upload, Pencil, Search } from 'lucide-vue-next'
import { Button, Dropdown, DropdownOption, FormControlCheckbox } from '@/lucidui'
import { useBoardsStore } from '@/stores/boards'
import { watchDebounced } from '@vueuse/core'
import type { BoardCreate, BoardUpdate, Card, CardCreate, CardUpdate, Column, ColumnCreate, ColumnUpdate } from '@/stores/boards'
import { POSITION, useToast } from 'vue-toastification'
import { workerService } from '@/worker/client'
import DialogCreateBoard from '../components/Dialogs/DialogCreateBoard.vue'
import DialogCreateColumn from '../components/Dialogs/DialogCreateColumn.vue'
import DialogCreateCardMinimal from '../components/Dialogs/DialogCreateCardMinimal.vue'
import DialogEditCard from '../components/Dialogs/DialogEditCard.vue'
import DialogEditBoard from '../components/Dialogs/DialogEditBoard.vue'
import CardLabel from '../components/CardLabel.vue'
import DialogEditColumn from '../components/Dialogs/DialogEditColumn.vue'
import DialogConfirm from '@/components/Dialogs/DialogConfirm.vue'
import DialogExportBoard from '@/components/Dialogs/DialogExportBoard.vue'
import DialogImportBoard from '@/components/Dialogs/DialogImportBoard.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'
import CardComponent from '@/components/Card.vue'

const router = useRouter()
const route = useRoute()
const boardsStore = useBoardsStore()
const toast = useToast()

const board = computed(() => boardsStore.getBoardById((route.params.boardId as string) || ''))
const theme = computed(() => boardsStore.getThemeById(board.value?.themeId || ''))
const columns = computed(() => boardsStore.getBoardColumns(board.value?.id || '').sort((a, b) => a.order - b.order))

const columnRef = ref<HTMLElement>()
const cardRefs = ref<HTMLElement[]>([])
const searchValue = ref('')
const isSearchLoading = ref(false)
const filteredCards = ref<{ id: string, score: number }[]>([])
const isCreateDialogOpen = ref(false)
const isEditBoardDialogOpen = ref(false)
const isCreateColumnDialogOpen = ref(false)
const isExportDialogOpen = ref(false)
const isImportDialogOpen = ref(false)
const editColumnCandidate = ref<Column | null>(null)
const deleteColumnCandidate = ref<Column | null>(null)
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

const handleDeleteColumn = () => {
  if (!deleteColumnCandidate.value)
    return
  boardsStore.deleteColumn(deleteColumnCandidate.value.id)
  deleteColumnCandidate.value = null
}

const handleCreateCard = (card: CardCreate) => {
  card.order = boardsStore.getColumnCards(card.columnId).length
  const createdCard = boardsStore.createCard(card)
  createCardColumnCandidate.value = null
  editCardCandidate.value = createdCard
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
      delay: 75,
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
    delay: 75,
    onEnd(this: Sortable) {
      const orders = this.toArray()
      const columns = boardsStore.getBoardColumns(board.value?.id || '')
      columns.forEach((col) => {
        boardsStore.updateColumn({
          id: col.id,
          title: col.title,
          boardId: col.boardId,
          order: orders.indexOf(col.id),
        })
      })
    },
  })
}

const handleToggleTodoCompleted = (cardId: string, todoId: string) => {
  const card = boardsStore.getCardById(cardId)
  if (!card)
    return
  const todos = card?.todos || []
  const updatedTodos = todos.map((todo) => {
    if (todo.id !== todoId)
      return todo
    return {
      ...todo,
      completed: !todo.completed,
    }
  })
  boardsStore.updateCard({
    ...card,
    todos: updatedTodos,
  })
}

const resolveColumnCards = (columnId: string) => {
  const cards = boardsStore.getColumnCards(columnId);
  return cards;
}

watchDebounced(() => searchValue.value, async () => {
  if (!searchValue.value.trim()) {
    filteredCards.value = []
    return;
  }
  const result = await workerService.query('search', {
    query: searchValue.value,
    data: boardsStore.getBoardCards(boardsStore.selectedBoardId).map((card) => {
      const labels = boardsStore.getCardLabels(card.id).map(label => label.title).join(' ')
      return {
        id: card.id,
        title: card.title,
        description: `${labels} ${card.description}`
      }
    })
  })
  filteredCards.value = result
}, {
  debounce: 300,
})

onMounted(async () => {
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
          <div class="shrink-0 flex items-center justify-center w-8 h-8">
            <img src="/logo-256x256.png" class="w-full h-full object-cover object-center">
          </div>
          <Dropdown class="w-full max-w-[270px]" dropdown-width="cover">
            <template #trigger="{ toggle }">
              <Button
                class="w-full justify-start"
                color="secondary"
                @click="toggle"
              >
                <div class="w-full text-left truncate">
                  {{ board.title }}
                </div>
                <ChevronDown class="w-4 h-4 ml-auto" />
              </Button>
            </template>
            <template #options>
              <DropdownOption @click="isCreateDialogOpen = true">
                <template #start>
                  <div class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white">
                    <Plus class="w-4 h-4" />
                  </div>
                </template>
                <template #label>
                  Create Board
                </template>
              </DropdownOption>
              <DropdownOption
                v-for="b in boardsStore.boards.sort((a, b) => a.title.localeCompare(b.title))"
                :key="b.id"
                :selected="b.id === board.id"
                @click="router.push(`/boards/${b.id}`)"
              >
                <template #start>
                  <div
                    class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                    :style="{ backgroundImage: `url(${boardsStore.getThemeById(b.themeId)?.thumbnail})` }"
                  />
                </template>
                <template #label>
                  {{ b.title }}
                </template>
              </DropdownOption>
            </template>
          </Dropdown>
          <div class="ml-auto flex items-center gap-2">
            <!-- Search bar -->
            <div class="relative shirnk w-full max-w-[280px]">
              <FormControlText
                :value="searchValue"
                class="w-full h-10 pl-10"
                placeholder="Search..."
                @input="(value) => searchValue = value"
              />
              <Search class="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4" />
            </div>
            <Button
              class="shrink-0"
              color="secondary"
              title="Add Column"
              @click="isCreateColumnDialogOpen = true"
            >
              Add Column
              <Plus class="w-4 h-4" />
            </Button>
            <Button
              class="shrink-0"
              color="secondary"
              @click="isEditBoardDialogOpen = true"
            >
              Board Settings
              <Settings2 class="w-4 h-4" />
            </Button>
            <Button
              class="shrink-0"
              color="secondary"
              @click="isExportDialogOpen = true"
            >
              Export
              <Download class="w-4 h-4" />
            </Button>
            <Button
              class="shrink-0"
              color="secondary"
              @click="isImportDialogOpen = true"
            >
              Import
              <Upload class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div class="flex w-full h-full flex-nowrap">

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
              v-for="column in columns"
              :id="column.id"
              :key="column.id"
              :data-column-id="column.id"
              class="board__columns__column relative text-base shrink-0 basis-[22rem] max-h-full overflow-hidden bg-slate-100 rounded-lg shadow-md outline-dashed outline-2 outline-transparent outline-offset-2"
            >
              <div class="block w-full">

                <!-- Column title -->
                <div class="flex w-full items-center justify-between font-bold gap-2 px-4 py-2.5 border-b border-b-slate-200 text-slate-800">
                  <div class="board__columns__column__handle cursor-grab">
                    <GripVertical class="w-4 h-4" />
                  </div>
                  <div class="ml-2">
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
                    <Button
                      color="secondary"
                      variant="tonal"
                      shape="circle"
                      size="sm"
                      title="Add Card"
                      @click="createCardColumnCandidate = column.id"
                    >
                      <Plus class="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Dropdown dropdown-placement="bottom-end">
                      <template #trigger="{ toggle }">
                        <Button
                          color="secondary"
                          variant="tonal"
                          shape="circle"
                          size="sm"
                          title="Edit or delete column"
                          @click="toggle"
                        >
                          <ChevronDown class="w-4 h-4" />
                        </Button>
                      </template>
                      <template #options>
                        <DropdownOption @click="editColumnCandidate = column">
                          <template #start>
                            <Pencil class="block w-4 h-4" />
                          </template>
                          <template #label>
                            Edit Column
                          </template>
                        </DropdownOption>
                        <DropdownOption @click="deleteColumnCandidate = column">
                          <template #start>
                            <Trash class="block w-4 h-4" />
                          </template>
                          <template #label>
                            Delete Column
                          </template>
                        </DropdownOption>
                      </template>
                    </Dropdown>
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
                    <CardComponent 
                      v-for="card in boardsStore.getColumnCards(column.id)"
                      :key="card.id"
                      class="board__columns__column__cards__card"
                      :class="{
                        'opacity-40': filteredCards.length > 0 && !filteredCards.find(c => c.id === card.id),
                        'outline-pink-500': filteredCards.find(c => c.id === card.id)
                      }"
                      :card="card"
                      :labels="boardsStore.getCardLabels(card.id)"
                      :hide-labels="board.viewSettings?.hideLabels"
                      :hide-description="board.viewSettings?.hideDescription"
                      :hide-todos="board.viewSettings?.hideTodos"
                      :hide-links="board.viewSettings?.hideLinks"
                      @click="editCardCandidate = card"
                      @toggle-todo-completed="(cardId, todoId) => handleToggleTodoCompleted(cardId, todoId)"
                    />
                  </div>
                  <div class="block w-full px-4 pb-4">
                    <Button
                      class="w-full"
                      color="secondary"
                      @click="createCardColumnCandidate = column.id"
                    >
                      Add Card
                      <Plus class="w-4 h-4" />
                    </Button>
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
              <Button
                color="primary"
                @click="isCreateColumnDialogOpen = true"
              >
                Add Column
              </Button>
            </div>
          </div>

        </Transition>

      </div>

      <!-- Edit Board dialog -->
      <DialogEditBoard
        :board="board"
        :themes="boardsStore.themes"
        :open="isEditBoardDialogOpen"
        @save="(board) => handleUpdateBoard(board)"
        @delete="() => handleDeleteBoard()"
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
      <DialogCreateCardMinimal
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

      <!-- Export -->
      <DialogExportBoard
        :open="isExportDialogOpen"
        :board-id="board.id"
        @close="isExportDialogOpen = false"
      />

      <!-- Import -->
      <DialogImportBoard
        :open="isImportDialogOpen"
        @close="isImportDialogOpen = false"
      />

      <!-- Confirm delete column dialog -->
      <DialogConfirm
        :title="`Delete column ${deleteColumnCandidate?.title}?`"
        message="Are you sure you want to delete this column? All cards in this column will be deleted."
        :open="!!deleteColumnCandidate"
        @cancel="deleteColumnCandidate = null"
        @confirm="handleDeleteColumn"
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
            <Button color="primary" @click="isCreateDialogOpen = true">
              Add Board
            </Button>
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
.board__columns__column__cards__card:focus-visible,
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

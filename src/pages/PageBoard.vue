<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeMount, ref, unref, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import SmoothReflow from '../components/SmoothReflow.vue'
import DialogCreateBoard from '../components/Dialogs/DialogCreateBoard.vue'
import DialogCreateColumn from '../components/Dialogs/DialogCreateColumn.vue'
import DialogCreateCard from '../components/Dialogs/DialogCreateCard.vue'
import IconChevonDown from '../components/Icons/IconChevonDown.vue'
import IconAdd from '../components/Icons/IconAdd.vue'
import IconConfig from '../components/Icons/IconConfig.vue'
import Dropdown from '../components/Dropdowns/Dropdown.vue'
import DropdownOption from '../components/Dropdowns/DropdownOption.vue'
import Popover from '../components/Popovers/Popover.vue'
import PopoverEditBoard from '../components/Popovers/PopoverEditBoard.vue'
import IconHandle from '../components/Icons/IconHandle.vue'
import IconBin from '../components/Icons/IconBin.vue'
import DialogEditColumn from '../components/Dialogs/DialogEditColumn.vue'
import IconPencil from '../components/Icons/IconPencil.vue'
import { useBoardsStore } from './../stores/boards'
import type { BoardCreate, BoardUpdate, CardCreate, Column, ColumnCreate, ColumnUpdate, Theme } from './../stores/boards'

const router = useRouter()
const route = useRoute()
const boardsStore = useBoardsStore()

const board = computed(() => boardsStore.getBoardById((route.params.boardId as string) || ''))
const theme = computed(() => boardsStore.getThemeById(board.value?.themeId || ''))
const columns = computed(() => boardsStore.getBoardColumns(board.value?.id || '').sort((a, b) => a.order - b.order))

const isCreateDialogOpen = ref(false)
const isCreateColumnDialogOpen = ref(false)
const editColumnCandidate = ref<Column | null>(null)
const createdCardColumnCandidate = ref<string | null>(null)

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
  boardsStore.createCard(card)
  createdCardColumnCandidate.value = null
}

onBeforeMount(() => {
  if (route.params.boardId)
    return

  const selectedBoard = boardsStore.getBoardById(boardsStore.selectedBoardId)
  if (selectedBoard) {
    router.push(`/boards/${selectedBoard.id}`)
    return
  }

  const nextBoard = boardsStore.boards[0]
  router.push(`/boards/${nextBoard.id}`)
})

watch(() => route.params, (params) => {
  if (!params.boardId)
    return

  boardsStore.selectedBoardId = params.boardId as string
})
</script>

<template>
  <div v-if="board" class="relative block w-full h-screen overflow-hidden text-slate-700">

    <!-- Theme bg -->
    <transition mode="in-out" name="background">
      <div
        v-if="theme"
        :key="theme?.id"
        class="absolute inset-0 bg-cover bg-no-repeat bg-center"
        :style="{ backgroundImage: `url(${theme?.image})` }"
      />
    </transition>

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
                  <transition mode="out-in" name="slide-fade">
                    <div :key="board.title" class="tracking-wide min-w-0 truncate">
                      {{ board.title }}
                    </div>
                  </transition>
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
    <PerfectScrollbar
      :key="board.id"
      :style="{
        height: 'calc(100vh - 4rem)',
      }"
    >
      <div class="relative block w-full" style="height:calc(100vh - 4rem)">
        <div class="relative block w-auto h-full p-6 whitespace-nowrap text-[0px]">

          <!-- Columns -->
          <TransitionGroup
            name="columns"
            class="columns"
            tag="div"
          >
            <div v-for="column in columns" :key="column.id" class="relative inline-block align-top text-base w-[24rem] max-h-full overflow-hidden bg-slate-100 rounded-lg shadow-md mr-6">
              <SmoothReflow>
                <div class="block w-full">

                  <!-- Column title -->
                  <div class="flex w-full items-center justify-between font-bold gap-4 px-4 h-12 border-b border-b-slate-200 text-slate-700">
                    <div class="cursor-grab">
                      <IconHandle class="w-4 h-4" />
                    </div>
                    <div>
                      <transition mode="out-in" name="slide-fade">
                        <h3
                          :key="column.title"
                          class="tracking-wide min-w-0 truncate text-sm"
                        >
                          {{ column.title }}
                        </h3>
                      </transition>
                    </div>
                    <div class="ml-auto">
                      <button
                        v-tooltip="{ content: 'Add Card' }"
                        class="btn btn--gray flex items-center justify-center w-8 h-8 rounded-full p-0"
                        @click="() => createdCardColumnCandidate = column.id"
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
                  <PerfectScrollbar
                    :style="{
                      maxHeight: `calc(100vh - 4rem - 1.5rem - 1.5rem - 3rem)`,
                    }"
                  >
                    <div class="flex flex-col gap-4 w-full min-h-[200px] p-4">
                      <div
                        v-for="card in boardsStore.getColumnCards(column.id)"
                        :key="card.id"
                        class="rounded-lg bg-white shadow-sm p-6"
                      >
                        {{ card.title }}
                      </div>

                    </div>
                  </PerfectScrollbar>
                </div>
              </SmoothReflow>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </PerfectScrollbar>

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
      v-if="createdCardColumnCandidate"
      :key="board.id"
      :column-id="createdCardColumnCandidate"
      :column-title="columns.find(column => column.id === createdCardColumnCandidate)?.title || ''"
      :open="!!createdCardColumnCandidate"
      @close="() => {
        createdCardColumnCandidate = null;
      }"
      @create="(card) => handleCreateCard(card)"
    />

  </div>
</template>

<style scoped>
.columns-move, /* apply transition to moving elements */
.columns-enter-active,
.columns-leave-active {
  transition: all 0.5s ease;
}

.columns-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.columns-leave-to {
  opacity: 0;
  transform: translateY(0.9);
}

.columns-leave-active {
  position: absolute;
}

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
.background-enter-from {
  opacity: 0;
  transform: scale(1.05);
}
.background-leave-to {
  opacity: 0;
  transform: translateY(1.05);
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

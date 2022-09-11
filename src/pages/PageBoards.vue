<script setup lang="ts">
import { ref } from 'vue'
import moment from 'moment'
import type { Board, BoardCreate } from './../stores/boards'
import { useBoardsStore } from './../stores/boards'
import DialogCreateBoard from './../components/Dialogs/DialogCreateBoard.vue'

const boardsStore = useBoardsStore()

const isCreateDialogOpen = ref(false)

const onCreate = (board: BoardCreate) => {
  boardsStore.createBoard(board)
  isCreateDialogOpen.value = false
}

const onDelete = (board: Board) => {
  boardsStore.deleteBoard(board.id)
}
</script>

<template>
  <div>
    <!--
    <button class="btn btn--primary" @click="isCreateDialogOpen = true">
      Create Board
    </button>
    <DialogCreateBoard
      :open="isCreateDialogOpen"
      @close="isCreateDialogOpen = false"
      @create="(board) => onCreate(board)"
    />
    <ul>
      <li
        v-for="board in boardsStore.boards"
        :key="board.id"
      >
        {{ board.title }}
        <span>- {{ moment(board.dateCreated).fromNow() }}</span>
        <router-link :to="`/boards/${board.id}`">
          Open Board
        </router-link>

        <PopoverConfirm
          title="Delete Board"
          description="Are you sure you want to delete this board?"
          @confirm="() => onDelete(board)"
        >
          <template #trigger>
            <button class="bg-gray-300">
              delete
            </button>
          </template>
        </PopoverConfirm>
      </li>
    </ul>
    -->
  </div>
</template>


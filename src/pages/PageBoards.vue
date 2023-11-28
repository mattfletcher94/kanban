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
  <div />
</template>


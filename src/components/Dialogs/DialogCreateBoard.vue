<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, ref, watch } from 'vue'
import type { BoardCreate, Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import DropdownThemes from '../Dropdowns/DropdownThemes.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'
import DialogCreateTheme from './DialogCreateTheme.vue'

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: BoardCreate): void
}>()

const boardsStore = useBoardsStore()

const form = useForm<BoardCreate>({
  initialValues: {
    title: '',
    themeId: boardsStore.themes[0].id,
  },
  validationSchema: toTypedSchema(zod.object({
    title: zod.string().min(1, 'Title is required'),
    themeId: zod.string().min(1, 'Theme is required'),
  })),
})

const title = form.useFieldModel('title')
const themeId = form.useFieldModel('themeId')

const isCreateThemeDialogOpen = ref(false)

const onSubmit = form.handleSubmit((values, actions) => {
  emits('create', values)
})

const onCreateTheme = (theme: Theme) => {
  isCreateThemeDialogOpen.value = false
  themeId.value = theme.id
}

const onClose = () => {
  emits('close')
}

watch(() => props.open, () => {
  props.open && form.handleReset()
})
</script>

<template>
  <Dialog
    title="Create Board"
    width="480px"
    :open="props.open"
    @close="() => onClose()"
  >
    <template #content>
      <form @submit.prevent="() => onSubmit()">
        <FormGroup
          label="Title"
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.title) || ''"
        >
          <input
            v-model="title"
            type="text"
            placeholder="Enter title..."
          >
        </FormGroup>
        <FormGroup
          class="mt-6"
          label="Theme"
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.themeId) || ''"
        >
          <DropdownThemes
            :selected="themeId"
            :allow-delete="true"
            @select="(id) => themeId = id"
          />
        </FormGroup>
        <div class="mt-4">
          <button
            type="button"
            class="btn btn--gray w-full"
            @click="() => isCreateThemeDialogOpen = true"
          >
            Create a custom theme
          </button>
        </div>
        <div class="flex items-center justify-end gap-4 mt-12">
          <button class="btn btn--primary " type="submit">
            Create Board
          </button>
        </div>
      </form>
    </template>
  </Dialog>
  <DialogCreateTheme
    :open="isCreateThemeDialogOpen"
    @create="(theme) => onCreateTheme(theme)"
    @close="isCreateThemeDialogOpen = false"
  />
</template>

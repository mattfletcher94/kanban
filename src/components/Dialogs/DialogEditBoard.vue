<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, ref, unref, watch } from 'vue'
import type { Board, BoardUpdate, Theme } from '../../stores/boards'
import PopoverConfirm from '../Popovers/PopoverConfirm.vue'
import DropdownThemes from '../Dropdowns/DropdownThemes.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'
import DialogCreateTheme from './DialogCreateTheme.vue'

const props = defineProps<{
  open: boolean
  board: Board
  themes: Theme[]
}>()

const emit = defineEmits<{
  (event: 'delete', boardId: string): void
  (event: 'save', board: BoardUpdate): void
  (event: 'close'): void
}>()

const form = useForm<BoardUpdate>({
  initialValues: {
    id: unref(props.board.id),
    title: unref(props.board.title),
    themeId: unref(props.board.themeId),
  },
  validationSchema: toFormValidator(zod.object({
    title: zod.string().min(1, 'Title is required'),
    themeId: zod.string().min(1, 'Theme is required'),
  })),
})

const title = form.useFieldModel('title')
const themeId = form.useFieldModel('themeId')
const isCreateThemeDialogOpen = ref(false)

const onSubmit = form.handleSubmit((values) => {
  emit('save', values)
})

const onCreateTheme = (theme: Theme) => {
  isCreateThemeDialogOpen.value = false
  themeId.value = theme.id
}

watch(() => props.open, () => {
  if (props.open) {
    form.setValues({
      id: unref(props.board.id),
      title: unref(props.board.title),
      themeId: unref(props.board.themeId),
    })
  }
})
</script>

<template>
  <Dialog
    title="Edit Board"
    width="480px"
    :open="props.open"
    @close="() => emit('close')"
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
          label="Select Theme"
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.themeId) || ''"
        >
          <DropdownThemes
            :selected="themeId || ''"
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
        <div class="flex items-center justify-between gap-4 mt-12">
          <div>
            <PopoverConfirm
              trigger-class="text-sm text-red-600 font-medium underline"
              message="Are you sure you want to delete this Board? This cannot be undone."
              width="270px"
              confirm-text="Delete"
              cancel-text="Cancel"
              anchor="top-start"
              @confirm="() => emit('delete', props.board.id)"
            >
              <template #trigger>
                Delete Board
              </template>
            </PopoverConfirm>
          </div>
          <div>
            <button
              class="btn btn--primary"
              type="submit"
            >
              Save Changes
            </button>
          </div>

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


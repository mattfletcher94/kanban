<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, unref, watch } from 'vue'
import type { Board, BoardUpdate, Column, ColumnCreate, ColumnUpdate, Theme } from '../../stores/boards'
import Dropdown from '../Dropdowns/Dropdown.vue'
import DropdownOption from '../Dropdowns/DropdownOption.vue'
import PopoverConfirm from '../Popovers/PopoverConfirm.vue'
import IconChevonDown from '../Icons/IconChevonDown.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

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

const selectedTheme = computed(() => props.themes.find(t => t.id === themeId.value))

const onSubmit = form.handleSubmit((values, actions) => {
  emit('save', values)
})

const handleDeleteBoard = () => {
  emit('delete', props.board.id)
}

const onClose = () => {
  emit('close')
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
    width="420px"
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
          <Dropdown width="100%">
            <template #trigger>
              <button type="button" class="select flex items-center gap-4 w-full">
                <div>
                  <div
                    class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                    :style="{ backgroundImage: `url(${selectedTheme?.thumbnail})` }"
                  />
                </div>
                <div>
                  {{ selectedTheme?.title || 'Select theme...' }}
                </div>
                <div class="ml-auto">
                  <IconChevonDown class="w-4 h-4" />
                </div>
              </button>
            </template>
            <template #options>
              <DropdownOption
                v-for="theme in themes"
                :key="theme.id"
                :selected="theme.id === themeId"
                @click="() => form.setFieldValue('themeId', theme.id)"
              >
                <div class="flex items-center gap-4 w-full">
                  <div>
                    <div
                      class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                      :style="{ backgroundImage: `url(${theme.thumbnail})` }"
                    />
                  </div>
                  <div>
                    {{ theme.title }}
                  </div>
                </div>
              </DropdownOption>
            </template>
          </Dropdown>
        </FormGroup>

        <div class="flex items-center justify-between gap-4 mt-12">
          <div>
            <PopoverConfirm
              trigger-class="text-sm text-red-600 font-medium underline"
              message="Are you sure you want to delete this Board? This cannot be undone."
              width="270px"
              confirm-text="Delete"
              cancel-text="Cancel"
              anchor="top-start"
              @confirm="() => handleDeleteBoard()"
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
</template>


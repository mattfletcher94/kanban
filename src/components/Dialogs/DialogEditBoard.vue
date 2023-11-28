<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, ref, unref, watch } from 'vue'
import type { Board, BoardUpdate, Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconBin from '../Icons/IconBin.vue'
import IconEllipsis from '../Icons/IconEllipsis.vue'
import Dialog from './Dialog.vue'
import DialogCreateTheme from './DialogCreateTheme.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'
import FormControlSelect from '@/lucidui/form/FormControlSelect.vue'
import Dropdown from '@/lucidui/dropdowns/Dropdown.vue'
import DropdownOption from '@/lucidui/dropdowns/DropdownOption.vue'

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

const boardsStore = useBoardsStore()

const form = useForm<BoardUpdate>({
  initialValues: {
    id: unref(props.board.id),
    title: unref(props.board.title),
    themeId: unref(props.board.themeId),
  },
  validationSchema: toTypedSchema(zod.object({
    id: zod.string().min(1, 'Id is required'),
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

const handleDeleteTheme = (id: string) => {
  // If theme is selected theme, reset themeId
  if (id === themeId.value)
    themeId.value = boardsStore.themes[0].id

  // Delete theme image
  const image = boardsStore.getThemeById(id)?.image
  if (image)
    window.api.images.delete(image)

  boardsStore.deleteTheme(id)
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
    width="480px"
    :open="props.open"
    @close="() => emit('close')"
  >
    <template #header>
      <div class="flex items-center w-full">
        <h2 class="text-base font-bold">
          Edit Board
        </h2>
        <Dropdown class="ml-auto" dropdown-width="180px" dropdown-placement="bottom-end">
          <template #trigger="{ toggle }">
            <Button
              class="ml-auto shrink-0"
              color="secondary"
              variant="ghost"
              shape="circle"
              title="Close"
              @click="toggle"
            >
              <IconEllipsis class="h-5 w-5" />
            </Button>
          </template>
          <template #options>
            <DropdownOption @click="() => emit('delete', props.board.id)">
              <template #label>
                Delete Board
              </template>
            </DropdownOption>
          </template>
        </Dropdown>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="() => onSubmit()">
        <FormGroup>
          <template #label>
            Title *
          </template>
          <template #control="{ id }">
            <FormControlText
              :id="id"
              :value="title"
              type="text"
              placeholder="Enter title..."
              @input="(value) => title = value"
            />
          </template>
          <template v-if="form.submitCount.value > 0 && form.errors.value.title" #error>
            {{ form.errors.value.title }}
          </template>
        </FormGroup>
        <FormGroup class="mt-6">
          <template #label>
            Theme
          </template>
          <template #control="{ id }">
            <div class="flex items-center gap-2">
              <FormControlSelect
                :id="id"
                :options="boardsStore.themes"
                :value="themeId || ''"
                @change="(value) => themeId = value.id"
              >
                <template #label="{ selected }">
                  <div class="flex items-center gap-2 truncate">
                    <img class="w-6 h-6 rounded-full object-cover object-center" :src="selected.thumbnail" alt="theme">
                    {{ selected?.title }}
                  </div>
                </template>
                <template #option-start="{ option }">
                  <img class="w-6 h-6 rounded-full object-cover object-center" :src="option.thumbnail" alt="theme">
                </template>
                <template #option-label="{ option }">
                  {{ option.title }}
                </template>
                <template #option-end="{ option }">
                  <Button
                    v-if="option.isCustom"
                    tabindex="-1"
                    size="sm"
                    color="danger"
                    variant="ghost"
                    shape="circle"
                    title="Delete theme (no undo)"
                    @click.stop="handleDeleteTheme(option.id)"
                  >
                    <IconBin class="w-4 h-4" />
                  </Button>
                </template>
              </FormControlSelect>
              <Button
                class="shrink-0"
                color="secondary"
                type="button"
                @click="isCreateThemeDialogOpen = true"
              >
                Add theme
              </Button>
            </div>
          </template>
          <template v-if="form.submitCount.value > 0 && form.errors.value.themeId" #error>
            {{ form.errors.value.themeId }}
          </template>
        </FormGroup>
        <Button
          class="mt-6 w-full"
          color="primary"
          type="submit"
          :disabled="!form.meta.value.valid"
        >
          Save changes
        </Button>
      </form>
    </template>
  </Dialog>
  <DialogCreateTheme
    :open="isCreateThemeDialogOpen"
    @create="(theme: Theme) => onCreateTheme(theme)"
    @close="isCreateThemeDialogOpen = false"
  />
</template>


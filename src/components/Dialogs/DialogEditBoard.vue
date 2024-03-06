<script lang="ts" setup>
import { X, Trash, MoreVertical } from 'lucide-vue-next'
import { ref, unref, watch } from 'vue'
import type { Board, BoardUpdate, Theme } from '@/stores/boards'
import { useBoardsStore } from '../../stores/boards'
import DialogCreateTheme from './DialogCreateTheme.vue'
import DialogConfirm from './DialogConfirm.vue'
import { Button, FormGroup, FormControlSwitch, FormControlText, FormControlSelect, Modal, ModalHeader, ModalFooter, Dropdown, DropdownOption } from '@/lucidui'
import { useEditBoardForm } from '@/composables/useEditBoardForm'

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

const form = useEditBoardForm({
  initialValues: {
    id: unref(props.board.id),
    title: unref(props.board.title),
    themeId: unref(props.board.themeId),
    viewSettings: {
      hideLabels: props.board.viewSettings?.hideLabels || false,
      hideDescription: props.board.viewSettings?.hideDescription || false,
      hideLinks: props.board.viewSettings?.hideLinks || false,
      hideTodos: props.board.viewSettings?.hideTodos || false,
    },
  },
})

const isCreateThemeDialogOpen = ref(false)
const isDeleteBoardDialogOpen = ref(false)

const onSubmit = form.handleSubmit((values) => {
  emit('save', values)
})

const onUpdateViewSettings = (
  key: 'hideLabels' | 'hideDescription' | 'hideLinks' | 'hideTodos',
  value: boolean,
) => {
  if (!form.values.viewSettings.value) {
    form.values.viewSettings.value = {
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }
  }
  form.values.viewSettings.value[key] = value
}

const onCreateTheme = (theme: Theme) => {
  isCreateThemeDialogOpen.value = false
  form.values.themeId.value = theme.id
}

const handleDeleteTheme = (id: string) => {
  // If theme is selected theme, reset themeId
  if (id === form.values.themeId.value)
    form.values.themeId.value = boardsStore.themes[0].id

  // Delete theme image
  const image = boardsStore.getThemeById(id)?.image
  if (image)
    window.api.images.delete(image)

  boardsStore.deleteTheme(id)
}

watch(() => props.open, () => {
  if (props.open) {
    form.resetForm({
      values: {
        id: unref(props.board.id),
        title: unref(props.board.title),
        themeId: unref(props.board.themeId),
        viewSettings: {
          hideLabels: props.board.viewSettings?.hideLabels || false,
          hideDescription: props.board.viewSettings?.hideDescription || false,
          hideLinks: props.board.viewSettings?.hideLinks || false,
          hideTodos: props.board.viewSettings?.hideTodos || false,
        },
      },
    })
  }
})
</script>

<template>
  <Modal
    width="450px"
    :open="props.open"
    @submit="onSubmit"
    @close="emit('close')"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          Edit Board
        </template>
        <template #actions>
          <Dropdown dropdown-width="180px" dropdown-placement="bottom-end">
            <template #trigger="{ toggle }">
              <Button
                class="ml-auto shrink-0"
                color="secondary"
                variant="ghost"
                shape="circle"
                title="Close"
                @click="toggle"
              >
                <MoreVertical class="h-5 w-5" />
              </Button>
            </template>
            <template #options>
              <DropdownOption @click="isDeleteBoardDialogOpen = true">
                <template #label>
                  Delete Board
                </template>
              </DropdownOption>
            </template>
          </Dropdown>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </Button>
        </template>
      </ModalHeader>
    </template>
    <template #body>
      <div class="p-6">
        <FormGroup>
          <template #label>
            Title *
          </template>
          <template #control="{ id }">
            <FormControlText
              :id="id"
              :value="form.values.title.value"
              type="text"
              placeholder="Enter title..."
              @input="(value) => form.values.title.value = value"
            />
          </template>
          <template v-if="form.errorBag.value.title?.[0]" #error>
            {{ form.errorBag.value.title?.[0] }}
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
                :value="form.values.themeId.value || ''"
                @change="(value) => form.values.themeId.value = value.id"
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
                    <Trash class="w-4 h-4" />
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
          <template v-if="form.errorBag.value.themeId?.[0]" #error>
            {{ form.errorBag.value.themeId?.[0] }}
          </template>
        </FormGroup>
        <FormGroup class="mt-6">
          <template #label>
            View settings
          </template>
          <template #control>
            <div class="flex flex-col gap-2 items-start mt-2">
              <FormControlSwitch
                :checked="!(form.values.viewSettings.value?.hideLabels || false)"
                @change="(value: boolean) => onUpdateViewSettings('hideLabels', !value)"
              >
                Show card labels
              </FormControlSwitch>
              <FormControlSwitch
                :checked="!(form.values.viewSettings.value?.hideDescription || false)"
                @change="(value: boolean) => onUpdateViewSettings('hideDescription', !value)"
              >
                Show card description
              </FormControlSwitch>
              <FormControlSwitch
                :checked="!(form.values.viewSettings.value?.hideLinks || false)"
                @change="(value: boolean) => onUpdateViewSettings('hideLinks', !value)"
              >
                Show card links
              </FormControlSwitch>
              <FormControlSwitch
                :checked="!(form.values.viewSettings.value?.hideTodos || false)"
                @change="(value: boolean) => onUpdateViewSettings('hideTodos', !value)"
              >
                Show card todos
              </FormControlSwitch>
            </div>
          </template>
        </FormGroup>
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="primary"
            type="submit"
            :disabled="!form.meta.value.valid"
          >
            Save changes
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
  <DialogCreateTheme
    :open="isCreateThemeDialogOpen"
    @create="(theme) => onCreateTheme(theme)"
    @close="isCreateThemeDialogOpen = false"
  />
  <DialogConfirm
    title="`Delete board"
    message="Are you sure you want to delete this board (no undo)?"
    :open="isDeleteBoardDialogOpen"
    @cancel="isDeleteBoardDialogOpen = false"
    @confirm="emit('delete', props.board.id)"
  />
</template>


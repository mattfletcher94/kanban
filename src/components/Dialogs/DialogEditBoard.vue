<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { ref, unref, watch } from 'vue'
import type { Board, BoardUpdate, Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconBin from '../Icons/IconBin.vue'
import IconEllipsis from '../Icons/IconEllipsis.vue'
import IconClose from '../Icons/IconClose.vue'
import Switch from '../Inputs/Switch.vue'
import DialogCreateTheme from './DialogCreateTheme.vue'
import DialogConfirm from './DialogConfirm.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
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
    viewSettings: unref(props.board.viewSettings || {
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }),
  },
  validationSchema: toTypedSchema(zod.object({
    id: zod.string().min(1, 'Id is required'),
    title: zod.string().min(1, 'Title is required'),
    themeId: zod.string().min(1, 'Theme is required'),
    viewSettings: zod.object({
      hideLabels: zod.boolean().default(false),
      hideDescription: zod.boolean().default(false),
      hideLinks: zod.boolean().default(false),
      hideTodos: zod.boolean().default(false),
    }).optional().default({
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }),
  })),
})

const title = form.useFieldModel('title')
const themeId = form.useFieldModel('themeId')
const viewSettings = form.useFieldModel('viewSettings')

const isCreateThemeDialogOpen = ref(false)
const isDeleteBoardDialogOpen = ref(false)

const onSubmit = form.handleSubmit((values) => {
  emit('save', values)
})

const onUpdateViewSettings = (
  key: 'hideLabels' | 'hideDescription' | 'hideLinks' | 'hideTodos',
  value: boolean,
) => {
  if (!viewSettings.value) {
    viewSettings.value = {
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }
  }

  viewSettings.value[key] = value
}

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
      viewSettings: unref(props.board.viewSettings),
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
                <IconEllipsis class="h-5 w-5" />
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
            <IconClose class="w-5 h-5" />
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
        <FormGroup class="mt-6">
          <template #label>
            View settings
          </template>
          <template #control>
            <div class="flex flex-col gap-2 items-start mt-2">
              <Switch
                :checked="!(viewSettings?.hideLabels || false)"
                @change="(value) => onUpdateViewSettings('hideLabels', !value)"
              >
                Show card labels
              </Switch>
              <Switch
                :checked="!(viewSettings?.hideDescription || false)"
                @change="(value) => onUpdateViewSettings('hideDescription', !value)"
              >
                Show card description
              </Switch>
              <Switch
                :checked="!(viewSettings?.hideLinks || false)"
                @change="(value: boolean) => onUpdateViewSettings('hideLinks', !value)"
              >
                Show card links
              </Switch>
              <Switch
                :checked="!(viewSettings?.hideTodos || false)"
                @change="(value) => onUpdateViewSettings('hideTodos', !value)"
              >
                Show card todos
              </Switch>
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


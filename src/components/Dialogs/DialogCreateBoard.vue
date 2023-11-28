<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { ref, watch } from 'vue'
import type { BoardCreate, Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconBin from '../Icons/IconBin.vue'
import Dialog from './Dialog.vue'
import DialogCreateTheme from './DialogCreateTheme.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'
import FormControlSelect from '@/lucidui/form/FormControlSelect.vue'

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
  props.open && form.handleReset()
})
</script>

<template>
  <Dialog
    title="Create Board"
    width="450px"
    :open="props.open"
    @close="onClose()"
  >
    <template #content>
      <form @submit.prevent="onSubmit()">
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
                :value="themeId"
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
          Create Board
        </Button>
      </form>
    </template>
  </Dialog>
  <DialogCreateTheme
    :open="isCreateThemeDialogOpen"
    @create="(theme) => onCreateTheme(theme)"
    @close="isCreateThemeDialogOpen = false"
  />
</template>

<script lang="ts" setup>
import { Trash, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import type { BoardCreate, Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import DialogCreateTheme from './DialogCreateTheme.vue'
import { Button, FormGroup, FormControlText, FormControlSelect, Modal, ModalHeader, ModalFooter } from '@/lucidui'
import { useCreateBoardForm } from '@/composables/useCreateBoardForm'

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: BoardCreate): void
}>()

const boardsStore = useBoardsStore()

const form = useCreateBoardForm({
  initialValues: {
    title: '',
    themeId: boardsStore.themes[0].id,
  },
})

const isCreateThemeDialogOpen = ref(false)

const onSubmit = form.handleSubmit((values, actions) => {
  emits('create', values)
})

const onCreateTheme = (theme: Theme) => {
  isCreateThemeDialogOpen.value = false
  form.values.themeId.value = theme.id
}

const onClose = () => {
  emits('close')
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
  props.open && form.handleReset()
})
</script>

<template>
  <Modal
    width="450px"
    :open="props.open"
    @close="onClose"
    @submit="onSubmit"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          Create Board
        </template>
        <template #actions>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="onClose"
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
                :value="form.values.themeId.value"
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
            {{ form.errors.value.themeId }}
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
            Create Board
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
</template>

<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, watch } from 'vue'
import type { BoardCreate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import DropdownOption from '../Dropdowns/DropdownOption.vue'
import Dropdown from '../Dropdowns/Dropdown.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

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
  validationSchema: toFormValidator(zod.object({
    title: zod.string().min(1, 'Title is required'),
    themeId: zod.string().min(1, 'Theme is required'),
  })),
})

const title = form.useFieldModel('title')
const themeId = form.useFieldModel('themeId')

const selectedTheme = computed(() => boardsStore.getThemeById(themeId.value))

const onSubmit = form.handleSubmit((values, actions) => {
  emits('create', values)
})

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
                    :style="{ backgroundImage: `url(${selectedTheme?.image})` }"
                  />
                </div>
                <div>
                  {{ selectedTheme?.title || 'Select theme...' }}
                </div>
              </button>
            </template>
            <template #options>
              <DropdownOption
                v-for="theme in boardsStore.themes"
                :key="theme.id"
                :selected="theme.id === themeId"
                @click="() => form.setFieldValue('themeId', theme.id)"
              >
                <div class="flex items-center gap-4 w-full">
                  <div>
                    <div
                      class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
                      :style="{ backgroundImage: `url(${theme.image})` }"
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
        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="btn btn--primary btn--lg" type="submit">
            Create Board
          </button>
        </div>
      </form>
    </template>
  </Dialog>
</template>

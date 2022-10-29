<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import type { Board, BoardUpdate, Theme } from 'src/stores/boards'
import type { PropType } from 'vue'
import { computed, unref } from 'vue'
import FormGroup from '../FormGroup.vue'
import Dropdown from '../Dropdowns/Dropdown.vue'
import DropdownOption from '../Dropdowns/DropdownOption.vue'
import Popover from './Popover.vue'
import PopoverConfirm from './PopoverConfirm.vue'

const props = defineProps({
  triggerClass: {
    type: String,
    default: '',
  },
  board: {
    type: Object as PropType<Board>,
    required: true,
  },
  themes: {
    type: Array as PropType<Theme[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'deleteBoard', boardId: string): void
  (event: 'saveBoard', board: BoardUpdate): void
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
  emit('saveBoard', values)
})

const handleDeleteBoard = () => {
  console.log('deleteBoard')
  emit('deleteBoard', props.board.id)
}
</script>

<template>
  <Popover
    width="300px"
    anchor="bottom-end"
    :trigger-class="props.triggerClass"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #content>
      <div class="block p-4">
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
          <button
            class="btn btn--primary w-full mt-6"
            type="submit"
          >
            Save Changes
          </button>
        </form>
        <div class="mt-6 pt-6 border-t border-t-slate-300">
          <PopoverConfirm
            width="300px"
            anchor="bottom-end"
            message="Are you sure you want to delete this board? This cannot be undone."
            trigger-class="btn btn--danger w-full"
            @confirm="() => handleDeleteBoard()"
          >
            <template #trigger>
              Delete board
            </template>
          </PopoverConfirm>
        </div>
      </div>
    </template>
  </Popover>
</template>

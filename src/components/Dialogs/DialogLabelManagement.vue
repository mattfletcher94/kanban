<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, nextTick, ref, watch } from 'vue'
import { PopoverButton } from '@headlessui/vue'
import type { Label, LabelCreate, LabelUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconBin from '../Icons/IconBin.vue'
import Popover from '../Popovers/Popover.vue'
import Switch from '../Inputs/Switch.vue'
import Checkbox from '../Inputs/Checkbox.vue'
import PopoverConfirm from '../Popovers/PopoverConfirm.vue'
import PopoverColorPicker from '../Popovers/PopoverColorPicker.vue'
import { colors } from '../../data/colors'
import SmoothReflow from '../SmoothReflow.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  open: boolean
  selectedLabels: string[]
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'select', labelId: string): void
  (event: 'unselect', labelId: string): void
  (event: 'create', label: Label): void
  (event: 'update', label: LabelUpdate): void
  (event: 'delete', label: Label): void
}>()

const boardsStore = useBoardsStore()

const labelList = ref<HTMLDivElement>()

const labels = computed(() => boardsStore.labels)

const handleEditLabelTitle = (id: string, title: string) => {
  boardsStore.updateLabel({
    id,
    title,
  })
}

const handleSelectLabelChange = (selected: boolean, labelId: string) => {
  if (selected)
    emits('select', labelId)

  else
    emits('unselect', labelId)
}

const handleDeleteLabel = (labelId: string) => {
  boardsStore.deleteLabel(labelId)
}

const handleCreateLabelClick = async () => {
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const createdLabel = boardsStore.createLabel({
    title: 'New label',
    color: randomColor,
  })

  // Find last input and focus it
  await nextTick()

  if (labelList.value) {
    const lastInput = labelList.value.querySelector<HTMLDivElement>('li:last-child input')
    if (lastInput)
      lastInput.focus()
  }

  emits('create', createdLabel)
}

const onClose = () => {
  emits('close')
}
</script>

<template>
  <Dialog
    title="Label Management"
    width="360px"
    :open="props.open"
    @close="() => onClose()"
  >
    <template #content>
      <div class="block w-full">
        <SmoothReflow>
          <ul ref="labelList" class="flex flex-col gap-2 w-full">
            <li
              v-for="(label) in labels"
              :key="label.id"
              class="flex items-center"
            >
              <div class="w-full flex items-center gap-2 border border-gray-300 p-2 rounded-lg">
                <div class="shrink-0">
                  <Checkbox
                    :checked="props.selectedLabels.includes(label.id)"
                    @change="(value) => handleSelectLabelChange(value, label.id)"
                  />
                </div>
                <div class="shrink-0">
                  <PopoverColorPicker
                    trigger-class="flex items-center cursor-pointer"
                    :selected-color="label.color"
                    @select="(color) => boardsStore.updateLabel({ id: label.id, color })"
                  >
                    <template #trigger>
                      <div
                        v-tooltip="{ content: 'Edit label color' }"
                        type="button"
                        class="w-5 h-5 rounded-full transition-colors"
                        :class="[
                          `bg-${label.color}-500 hover:bg-${label.color}-600 focus:bg-${label.color}-600`,
                        ]"
                      />
                    </template>
                  </PopoverColorPicker>
                </div>
                <div class="w-full">
                  <input
                    placeholder="Edit label title"
                    class="label-textfield"
                    type="text"
                    :value="label.title"
                    @blur="(e: any) => handleEditLabelTitle(label.id, e.target?.value || '')"
                  >
                </div>
                <div class="shrink-0">
                  <PopoverConfirm
                    trigger-class="btn btn--light !px-2 !text-slate-500 !py-0 !h-8"
                    message="Are you sure you want to delete this label?"
                    width="240px"
                    confirm-text="Delete"
                    cancel-text="Cancel"
                    @confirm="() => handleDeleteLabel(label.id)"
                  >
                    <template #trigger>
                      <IconBin class="w-4 h-4" />
                    </template>
                  </PopoverConfirm>
                </div>
              </div>
            </li>
          </ul>
        </SmoothReflow>
        <div class="mt-4">
          <button
            class="btn btn--gray w-full"
            @click="() => handleCreateLabelClick()"
          >
            Create Label
          </button>
        </div>
        <div class="mt-4">
          <button
            class="btn btn--primary w-full"
            @click="() => onClose()"
          >
            Done
          </button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.label-textfield {
  @apply w-full !p-1 border-transparent bg-transparent font-semibold resize-none ring-1 ring-transparent leading-normal rounded-md overflow-hidden;
  @apply hover:bg-gray-100 focus:bg-gray-50 focus:ring-1 focus:ring-primary-500;
}
</style>

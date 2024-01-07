<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import type { Label, LabelCreate, LabelUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconBin from '../Icons/IconBin.vue'
import IconClose from '../Icons/IconClose.vue'
import Checkbox from '../Inputs/Checkbox.vue'
import SmoothReflow from '../SmoothReflow.vue'
import { colors, resolveUserFriendlyColorName } from '../../data/colors'
import Button from '@/lucidui/buttons/Button.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
import Popover from '@/lucidui/popovers/Popover.vue'

const props = defineProps<{
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
  <Popover
    popover-width="320px"
    popover-placement="bottom"
  >
    <template
      #trigger="{
        open: openPopover,
        toggle,
        isOpen,
      }"
    >
      <slot
        name="trigger"
        :open="openPopover"
        :toggle="toggle"
        :is-open="isOpen"
      />
    </template>
    <template #content>
      <div class="block w-full">
        <SmoothReflow>
          <ul ref="labelList" class="flex flex-col w-full p-4 gap-3">
            <li
              v-for="(label) in labels"
              :key="label.id"
              class="flex items-center"
            >
              <div class="w-full flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
                <div class="shrink-0">
                  <Checkbox
                    size="sm"
                    :checked="props.selectedLabels.includes(label.id)"
                    @change="(value) => handleSelectLabelChange(value, label.id)"
                  />
                </div>
                <div class="shrink-0 flex items-center">
                  <Popover
                    class="block"
                    popover-width="210px"
                    popover-placement="bottom"
                  >
                    <template #trigger="{ toggle }">
                      <button
                        v-tooltip="{ content: 'Edit label color' }"
                        type="button"
                        class="block w-5 h-5 rounded-full transition-colors"
                        :class="[
                          `bg-${label.color}-500 hover:bg-${label.color}-600 focus:bg-${label.color}-600`,
                        ]"
                        @click="toggle"
                      />
                    </template>
                    <template #content>
                      <div class="grid grid-cols-6 gap-4 p-4">
                        <div
                          v-for="c in colors"
                          :key="c"
                          v-tooltip="{ content: resolveUserFriendlyColorName(c) }"
                          class="shrink-0"
                        >
                          <button
                            type="button"
                            class="flex items-center justify-center w-6 h-6 rounded-full"
                            :class="`bg-${c}-500`"
                            @click="() => boardsStore.updateLabel({ id: label.id, color: c })"
                          >
                            <svg
                              v-if="c === label.color"
                              class="w-4 h-4 text-white"
                              stroke="currentColor"
                              fill="currentColor"
                              stroke-width="0"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path fill="none" d="M0 0h24v24H0z" /><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </template>
                  </Popover>
                </div>
                <div class="w-full">
                  <FormControlText
                    class="w-full h-8"
                    :value="label.title"
                    @blur="(value) => handleEditLabelTitle(label.id, value)"
                  />
                </div>
                <div class="shrink-0">
                  <Button
                    class="text-slate-600"
                    color="secondary"
                    variant="ghost"
                    shape="circle"
                    size="sm"
                    @click="handleDeleteLabel(label.id)"
                  >
                    <IconBin class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </li>
          </ul>
        </SmoothReflow>
        <Button
          class="w-full mt-4"
          color="secondary"
          type="button"
          @click="handleCreateLabelClick"
        >
          Create new Label
        </Button>
      </div>
    </template>
  </Popover>
</template>

<style scoped>
</style>

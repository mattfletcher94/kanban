<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { marked } from 'marked'
import Multiselect from '@vueform/multiselect'
import type { Card, CardUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import SmoothReflow from '../SmoothReflow.vue'
import IconInfo from '../Icons/IconInfo.vue'
import IconAdd from '../Icons/IconAdd.vue'
import IconPencil from '../Icons/IconPencil.vue'
import IconClose from '../Icons/IconClose.vue'
import IconChevonDown from '../Icons/IconChevonDown.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  card: Card
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'save', column: CardUpdate): void
}>()

const boardsStore = useBoardsStore()

const editMode = ref(false)
const editingDescription = ref(false)
const editingLabels = ref(false)
const descriptionRef = ref<HTMLTextAreaElement>()
const titleRef = ref<HTMLTextAreaElement>()

const form = useForm<CardUpdate>({
  initialValues: {
    id: unref(props.card.id || ''),
    columnId: unref(props.card.columnId || ''),
    title: unref(props.card.title),
    description: unref(props.card.description),
    labelIds: unref(props.card.labelIds || []),
  },
  validationSchema: toFormValidator(zod.object({
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
  })),
})

const title = form.useFieldModel('title')
const description = form.useFieldModel('description')
const labelIds = form.useFieldModel('labelIds')

const parseMarkdown = (markdown: string) => {
  return marked.parse(markdown, {
    headerIds: false,
  })
}

const onSubmit = form.handleSubmit((values, actions) => {
  editMode.value = false
  emits('save', values)
})

const onClose = () => {
  emits('close')
}

const handleEditDescriptionClick = () => {
  editingDescription.value = true
  nextTick(() => {
    if (descriptionRef.value)
      descriptionRef.value.focus()
  })
}

const handleResizeTextarea = async () => {
  if (descriptionRef.value) {
    descriptionRef.value.style.height = '72px'
    await nextTick()
    descriptionRef.value.style.height = `${descriptionRef.value.scrollHeight + 2}px`
  }
}

const handleSelectedLabelsChange = (labelIds: string[]) => {
  console.log(labelIds)
}

const labelsToShow = computed(() => {
  const labels = boardsStore.labels
  const cardLabels = boardsStore.getCardLabels(props.card.id)
  return editingLabels.value ? labels : cardLabels
})

const labelsForSelect = computed(() => {
  return boardsStore.labels.map(label => ({ value: label.id, label: label.title, color: label.color }))
})

onMounted(() => {
  handleResizeTextarea()
})

watch(() => [descriptionRef.value, description.value], () => {
  handleResizeTextarea()
})
</script>

<template>
  <Dialog
    :open="props.open"
    width="720px"
    @close="() => onClose()"
  >
    <!--
    <template #header>
      <div class="flex w-full items-center justify-start mt-2">
        <FormGroup class="">
          <input
            v-model="title"
            spellcheck="false"
            type="text"
            class="!bg-transparent !border-transparent focus:!border-primary-500 hover:!bg-gray-50 focus:!bg-gray-50 !font-bold !text-lg "
            placeholder="Enter card Title..."
          >
        </FormGroup>
      </div>
    </template>
    -->
    <template #content>
      <a href="#" />
      <SmoothReflow>
        <form class="p-4" @submit.prevent="() => onSubmit()">
          <FormGroup class="mb-6">
            <template #label>
              <div class="flex items-center">
                <div class="">
                  Title
                </div>
              </div>
            </template>
            <input
              v-model="title"
              type="text"
              placeholder="Enter card name..."
            >
          </FormGroup>
          <FormGroup class="mb-6">
            <template #label>
              <div class="flex items-center">
                <div class="">
                  Labels
                </div>
                <!--
                <div
                  class="ml-auto"
                >
                  <button
                    class="btn btn--gray h-8 flex items-center gap-2 justify-between font-bold rounded-md"
                    @click="() => editingLabels = !editingLabels"
                  >
                    <div>
                      {{ editingLabels ? 'Confirm Changes' : 'Edit Labels' }}
                    </div>
                  </button>
                </div>
                -->
              </div>
            </template>
            <Multiselect
              v-model="labelIds"
              placeholder="Select labels..."
              no-results-text="All labels are selected"
              mode="tags"
              :close-on-select="false"
              :searchable="false"
              :create-option="false"
              :can-clear="false"
              :caret="true"
              :hide-selected="true"
              :options="labelsForSelect"
              :classes="{
                container: 'relative mx-auto w-full text-slate-700 flex items-center justify-end p-2.5 box-border cursor-pointer border border-gray-300 rounded-md bg-gray-50 text-sm outline-none transition-all',
                containerDisabled: 'cursor-default bg-gray-100',
                containerOpen: 'rounded-b-none ',
                containerActive: 'border border-primary-500 bg-gray-50',
                multipleLabel: 'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5',
                tags: 'flex-grow flex-shrink flex flex-wrap items-center gap-4',
                tag: 'flex items-center whitespace-nowrap',
                placeholder: 'absolute left-0 top-0 h-full flex items-center pointer-events-none bg-transparent px-2.5 text-slate-500',
                dropdown: 'max-h-60 absolute left-[-1px] right-[-1px] bottom-[1px] transform translate-y-full border border-primary-500 border-t-gray-300 overflow-y-auto z-50 bg-gray-50 flex flex-col rounded-b-md',
                dropdownHidden: 'hidden',
                options: 'flex flex-col p-0 m-0 list-none',
                option: 'block w-full transition-all',
                optionPointed: 'bg-gray-100',
                //optionSelected: '',
                noOptions: 'p-2.5 text-slate-700',
                noResults: 'p-2.5 text-slate-700',
                fakeInput: 'bg-transparent absolute left-0 right-0 -bottom-px w-full h-px border-0 p-0 appearance-none outline-none text-transparent',
                spacer: 'h-[20px] py-px box-content',
              }"
            >

              <!-- Caret -->
              <template #caret>
                <IconChevonDown class="w-4 h-4" />
              </template>

              <!-- Tags -->
              <template #tag="{ option, handleTagRemove }">
                <div
                  class="flex items-center text-xs font-bold rounded-md px-2.5 py-1.5 gap-2"
                  :class="{
                    'bg-green-500 text-white': option.color === 'green',
                    'bg-amber-500 text-white': option.color === 'amber',
                    'bg-red-500 text-white': option.color === 'red',
                  }"
                >
                  <div>
                    {{ option.label }}
                  </div>
                  <div>
                    <IconClose
                      class="w-4 h-4"
                      @click="handleTagRemove(option, $event)"
                    />
                  </div>
                </div>
              </template>

              <!-- Dropdown tags -->
              <template #option="{ option }">
                <div class="flex items-center text-xs font-semibold gap-4 p-2.5">
                  <div
                    class="w-5 h-5 rounded-full"
                    :class="{
                      'bg-green-500': option.color === 'green',
                      'bg-amber-500': option.color === 'amber',
                      'bg-red-500': option.color === 'red',
                    }"
                  />
                  <div>
                    {{ option.label }}
                  </div>
                </div>
              </template>
            </Multiselect>
            <!--
            <div
              class="flex gap-2"
            >
              <div
                v-for="label in labelsToShow"
                :key="label.id"
                class="text-xs font-bold rounded-md px-3 py-1.5"
                :class="{
                  'bg-green-100 text-slate-700': label.color === 'green',
                  'bg-amber-100 text-slate-700': label.color === 'amber',
                  'bg-red-100 text-red-500': label.color === 'red',
                }"
              >
                {{ label.title }}
              </div>
            </div>
          -->
            <!--
            <div
              class="flex justify-start items-start gap-4 pl-2.5"
            >
              <template
                v-if="card.labelIds && card.labelIds.length"
              >
                <div
                  v-for="label in boardsStore.getCardLabels(card.id)"
                  :key="label.id"
                  class=""
                >
                  {{ label.title }}
                </div>
              </template>
            </div>
            -->
          </FormGroup>
          <FormGroup>
            <template #label>
              <div class="flex items-center">
                <div class="">
                  Description
                </div>
                <div
                  v-if="editingDescription"
                  class="ml-auto text-blue-500 text-xs font-medium"
                >
                  Markdown is supported. <a class="underline" href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Find out more.</a>
                </div>
              </div>
            </template>
            <textarea
              v-if="editingDescription"
              ref="descriptionRef"
              v-model="description"
              spellcheck="false"
              class="!text-base resize-none"
              placeholder="Enter card description..."
              @blur="() => editingDescription = false"
            />
            <div
              v-else
              class="prose-card p-2.5 min-h-[72px] border border-transparent hover:bg-gray-100 transition-colors rounded-md cursor-pointer"
              :class="{
                'prose-p:!text-slate-500': !description,
              }"
              @click="() => handleEditDescriptionClick()"
              v-html="parseMarkdown(description || 'Click to add card description...')"
            />
          </FormGroup>
          <div class="flex items-center justify-end gap-4 mt-6">
            <button class="btn btn--primary" type="submit">
              Save Card
            </button>
          </div>
        <!--
        <div class="grid grid-cols-12 items-center">
          <div class="col-span-2">
            <label class="font-semibold text-sm">Title</label>
          </div>
          <div class="col-span-10">
            <FormGroup
              state="error"
              label-placement="left"
              :feedback="(form.submitCount.value > 0 && form.errors.value.title) || ''"
            >
              <input
                v-model="title"
                type="text"
                placeholder="Enter card name..."
              >
            </FormGroup>
          </div>
        </div>
        -->
        </form>
      </SmoothReflow>
    </template>
  </Dialog>
</template>


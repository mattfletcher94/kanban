<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card, CardCreate, CardUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconAdd from '../Icons/IconAdd.vue'
import CardLabel from '../CardLabel.vue'
import PopoverConfirm from '../Popovers/PopoverConfirm.vue'
import IconBin from '../Icons/IconBin.vue'
import IconOpen from '../Icons/IconOpen.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'
import DialogLabelManagement from './DialogLabelManagement.vue'

const props = defineProps<{
  columnId: string
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', column: CardCreate): void
}>()

const boardsStore = useBoardsStore()

const descriptionRef = ref<HTMLTextAreaElement>()
const titleRef = ref<HTMLTextAreaElement>()
const linksList = ref<any>()
const dialogLabelManagementOpen = ref(false)

const form = useForm<CardCreate>({
  initialValues: {
    columnId: unref(props.columnId),
    title: '',
    description: '',
    labelIds: [],
    order: 0,
    links: [],
  },
  validationSchema: toFormValidator(zod.object({
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
  })),
})

const title = form.useFieldModel('title')
const description = form.useFieldModel('description')
const labelIds = form.useFieldModel('labelIds')
const links = form.useFieldModel('links')

const onSubmit = form.handleSubmit((values, actions) => {
  // Remove empty links
  if (values.links)
    values.links = values.links.filter(link => link.name || link.url)

  emits('create', values)
})

const onClose = () => {
  emits('close')
}

const handleResizeTextarea = async () => {
  if (titleRef.value) {
    titleRef.value.style.height = '32px'
    await nextTick()
    titleRef.value.style.height = `${titleRef.value.scrollHeight + 1}px`
  }
  if (descriptionRef.value) {
    descriptionRef.value.style.height = '32px'
    await nextTick()
    descriptionRef.value.style.height = `${descriptionRef.value.scrollHeight + 1}px`
  }
}

const handleSelectLabel = (id: string) => {
  if (!labelIds.value)
    labelIds.value = []

  if (!labelIds.value.includes(id))
    labelIds.value.push(id)
}

const handleUnselectLabel = (id: string) => {
  if (!labelIds.value)
    labelIds.value = []

  if (labelIds.value.includes(id))
    labelIds.value = labelIds.value.filter(x => x !== id)
}

const handleClickAddLinkBtn = async () => {
  if (!links.value)
    links.value = []

  links.value.push({
    id: uuidv4(),
    name: '',
    url: '',
  })

  // Find last input and focus it
  await nextTick()

  if (linksList.value && linksList.value.$el) {
    const lastInput = linksList.value.$el.querySelector('li:last-child input')
    if (lastInput)
      lastInput.focus()
  }
}

const handleDeleteLink = (id: string) => {
  if (!links.value)
    links.value = []

  links.value = links.value.filter(x => x.id !== id)
}

const selectedLabels = computed(() => {
  return boardsStore.labels.filter(label => labelIds.value?.includes(label.id))
})

onMounted(() => {
  handleResizeTextarea()
})

watch(() => [titleRef.value, title.value, descriptionRef.value, description.value], () => {
  handleResizeTextarea()
})

watch(() => props.open, () => {
  if (props.open) {
    form.setValues({
      columnId: unref(props.columnId),
      title: '',
      description: '',
      labelIds: [],
      order: 0,
      links: [],
    })
  }
})
</script>

<template>
  <Dialog
    :open="props.open"
    width="660px"
    @close="() => onClose()"
  >
    <template #header>
      <div class="flex items-center py-2">
        <textarea
          ref="titleRef"
          v-model="title"
          :rows="1"
          :spellcheck="false"
          class="textarea--in-place text-lg font-bold mt-1"
          placeholder="Add Title"
        />
      </div>
    </template>
    <template #content>
      <a href="#" />
      <div class="flex flex-col gap-6">

        <!-- Labels -->
        <FormGroup class="px-1">
          <template #label>
            <div class="flex items-center justify-between">
              <div>
                Labels
              </div>
            </div>
          </template>
          <div class="flex items-start gap-4">
            <TransitionGroup
              class="flex flex-wrap gap-2 w-full"
              name="vue-list"
              tag="div"
            >
              <CardLabel
                v-for="label in selectedLabels"
                :key="label.id"
                class="h-8"
                :color="label.color"
                :title="label.title"
              >
                {{ label.title }}
              </CardLabel>
              <button
                key="button"
                class="btn btn--gray h-8 flex items-center gap-2 justify-start"
                @click="() => dialogLabelManagementOpen = true"
              >
                <div>
                  Add Label
                </div>
                <div>
                  <IconAdd class="w-4 h-4" />
                </div>
              </button>
            </TransitionGroup>
          </div>
        </FormGroup>

        <!-- Description -->
        <FormGroup>
          <template #label>
            <div class="flex items-center px-1">
              <div class="">
                Description
              </div>
            </div>
          </template>
          <textarea
            ref="descriptionRef"
            v-model="description"
            :rows="1"
            :spellcheck="false"
            class="textarea--in-place text-base"
            placeholder="No description"
          />
        </FormGroup>

        <!-- Links -->
        <FormGroup>
          <template #label>
            <div class="flex items-center px-1">
              <div class="">
                Links
              </div>
            </div>
          </template>
          <TransitionGroup
            ref="linksList"
            class="flex flex-col gap-2 w-full"
            name="vue-list"
            tag="ul"
          >
            <li
              v-for="(link) in links"
              :key="link.id"
              class="flex items-center gap-2 bg-white border border-gray-300 p-2 rounded-lg"
            >
              <div class="w-full">
                <input
                  v-model="link.name"
                  placeholder="Enter link name..."
                  class="links-textfield links-textfield--name"
                  type="text"
                >
              </div>
              <div class="w-full">
                <input
                  v-model="link.url"
                  placeholder="Enter link URL..."
                  class="links-textfield"
                  type="text"
                >
              </div>
              <div class="ml-auto shrink-0">
                <a
                  v-tooltip="{ content: 'Open link in browser' }"
                  class="btn btn--gray flex items-center !px-2 !text-slate-500 !py-0 !h-8"
                  :href="link.url"
                  target="_blank"
                >
                  <IconOpen class="w-4 h-4" />
                </a>
              </div>
              <div class="shrink-0">
                <PopoverConfirm
                  trigger-class="btn btn--gray !px-2 !text-slate-500 !py-0 !h-8"
                  message="Are you sure you want to delete this link?"
                  width="240px"
                  confirm-text="Delete"
                  cancel-text="Cancel"
                  @confirm="() => handleDeleteLink(link.id)"
                >
                  <template #trigger>
                    <IconBin class="w-4 h-4" />
                  </template>
                </PopoverConfirm>
              </div>
            </li>

          </TransitionGroup>
          <div>
            <button
              class="btn btn--gray h-8 mt-2 flex items-center gap-2 justify-start"
              @click="() => handleClickAddLinkBtn()"
            >
              <div>
                Add Link
              </div>
              <div>
                <IconAdd class="w-4 h-4" />
              </div>
            </button>
          </div>
        </FormGroup>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-4 mt-6">
          <div>
            <button
              class="btn btn--primary"
              type="button"
              :disabled="!form.meta.value.valid"
              @click="() => onSubmit()"
            >
              Create Card
              {{ title.length > 0 ? '' : ' (requires a title)' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
  <DialogLabelManagement
    :open="dialogLabelManagementOpen"
    :selected-labels="labelIds || []"
    @select="(labelId) => handleSelectLabel(labelId)"
    @unselect="(labelId) => handleUnselectLabel(labelId)"
    @create="(label) => handleSelectLabel(label.id)"
    @close="() => dialogLabelManagementOpen = false"
  />
</template>

<style scoped>
.textarea--in-place {
  @apply w-full border-transparent bg-transparent resize-none ring-2 ring-transparent leading-normal rounded-md overflow-hidden;

  @apply !p-1;
  @apply hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-primary-500;
}

.description-field {
  @apply w-full border-transparent bg-transparent resize-none leading-normal rounded-md !p-1 overflow-hidden;
  @apply hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-primary-500;
}

.links-textfield {
  @apply w-full !p-1 border-transparent bg-transparent font-semibold resize-none ring-1 ring-transparent leading-normal rounded-md overflow-hidden;
  @apply hover:bg-gray-100 focus:bg-gray-50 focus:ring-1 focus:ring-primary-500;
}
</style>

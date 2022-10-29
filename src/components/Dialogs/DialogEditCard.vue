<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import type { Card, CardUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconAdd from '../Icons/IconAdd.vue'
import CardLabel from '../CardLabel.vue'
import PopoverConfirm from '../Popovers/PopoverConfirm.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'
import DialogLabelManagement from './DialogLabelManagement.vue'

const props = defineProps<{
  card: Card | null
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'save', column: CardUpdate): void
  (event: 'delete', cardId: string): void
}>()

const boardsStore = useBoardsStore()

const descriptionRef = ref<HTMLTextAreaElement>()
const titleRef = ref<HTMLTextAreaElement>()
const dialogLabelManagementOpen = ref(false)

const form = useForm<CardUpdate>({
  initialValues: {
    id: unref(props.card?.id || ''),
    columnId: unref(props.card?.columnId || ''),
    title: unref(props.card?.title),
    description: unref(props.card?.description),
    labelIds: unref(props.card?.labelIds || []),
  },
  validationSchema: toFormValidator(zod.object({
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
  })),
})

const title = form.useFieldModel('title')
const description = form.useFieldModel('description')
const labelIds = form.useFieldModel('labelIds')

const onSubmit = form.handleSubmit((values, actions) => {
  emits('save', values)
})

const onClose = () => {
  emits('close')
}

const onDeleteCard = () => {
  emits('delete', props.card?.id || '')
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
      id: unref(props.card?.id || ''),
      columnId: unref(props.card?.columnId || ''),
      title: unref(props.card?.title),
      description: unref(props.card?.description),
      labelIds: unref(props.card?.labelIds || []),
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

        <div class="flex items-center justify-between gap-4 mt-6">
          <div>
            <PopoverConfirm
              trigger-class="text-sm text-red-600 font-medium underline"
              message="Are you sure you want to delete this Card? This cannot be undone."
              width="270px"
              confirm-text="Delete"
              cancel-text="Cancel"
              anchor="top-start"
              @confirm="() => onDeleteCard()"
            >
              <template #trigger>
                Delete Card
              </template>
            </PopoverConfirm>
          </div>
          <div>
            <button
              class="btn btn--primary"
              type="button"
              :disabled="!form.meta.value.valid"
              @click="() => onSubmit()"
            >
              Save Changes
            </button>
          </div>

        </div>

        <!--
        <FormGroup>
          <div class="flex items-center justify-center">
            <button type="button" class="btn btn--gray w-full max-w-[200px]" >
              <div class="flex items-center justify-center gap-2 w-full rounded-md">
                <div>
                  Add Section
                </div>
                <div>
                  <IconAdd class="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </FormGroup>
        -->
        <!--
        <div
          class="flex flex-col gap-6 w-full mt-6 text-slate-700 pt-6 border-t border-t-gray-200"
        >
          <div class="flex items-start gap-2">
            <div>
              <IconClock class="w-6 h-6" />
            </div>
            <div>
              <p class="flex items-center gap-1 text-sm tracking-wider font-bold text-slate-700 mb-0">
                Deadline
              </p>
              <p class="font-medium text-sm">
                December 12th 2022
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div>
              <IconClock class="w-6 h-6" />
            </div>
            <div>
              <p class="flex items-center gap-1 text-sm tracking-wider font-bold text-slate-700 mb-0">
                Date Completed
              </p>
              <p class="font-medium text-sm">
                December 12th 2022
              </p>
            </div>
          </div>
        </div>
        -->
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
</style>
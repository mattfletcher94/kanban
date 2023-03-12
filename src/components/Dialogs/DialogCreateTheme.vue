<script lang="ts" setup>
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'
import type { Theme, ThemeCreate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconFolder from '../Icons/IconFolder.vue'
import Dialog from './Dialog.vue'
import FormGroup from './../FormGroup.vue'

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: Theme): void
}>()

const store = useBoardsStore()
const toast = useToast()

const form = useForm<ThemeCreate>({
  initialValues: {
    title: '',
    image: '',
    thumbnail: '',
  },
  validationSchema: toFormValidator(zod.object({
    title: zod.string().min(1, 'Title is required'),
    image: zod.string().min(1, 'Image is required'),
    thumbnail: zod.string(),
  })),
})

const title = form.useFieldModel('title')
const image = form.useFieldModel('image')

const onSubmit = form.handleSubmit(async (values, actions) => {
  const response = await window.api.images.upload(image.value)
  const theme = store.createTheme({
    ...values,
    image: response.path,
    thumbnail: response.path,
  })
  emits('create', theme)
})

const handleSelectImage = async () => {
  const result = await window.api.images.select({
    maxSize: 3 * 1024 * 1024,
  })
  if (result && result.error) {
    toast.error(result.error)
    return
  }
  if (result && result.base64)
    image.value = result.base64
}

watch(() => [props.open], () => {
  if (props.open) {
    form.setValues({
      title: '',
      image: '',
      thumbnail: '',
    })
  }
})
</script>

<template>
  <Dialog
    title="Create Theme"
    width="420px"
    :open="props.open"
    @close="() => emits('close')"
  >
    <template #content>
      <form @submit.prevent="() => onSubmit()">
        <FormGroup
          label="Theme name"
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.title) || ''"
        >
          <input
            v-model="title"
            type="text"
            placeholder="Enter theme name..."
          >
        </FormGroup>
        <FormGroup
          class="mt-6"
          label="Theme image"
          state="error"
          :feedback="(form.submitCount.value > 0 && form.errors.value.image) || ''"
        >
          <template #label>
            <div class="flex items-center justify-between">
              <p>
                Theme image
              </p>
              <p class="font-medium">
                Max file size: 3MB
              </p>
            </div>
          </template>
          <button
            type="button"
            class="btn btn--gray flex items-center gap-2 w-full"
            @click="() => handleSelectImage()"
          >
            <div>
              <IconFolder class="w-4 h-4" />
            </div>
            <div>
              Select an image
            </div>
          </button>
          <!-- Image preview -->
          <div
            v-if="image"
            class="relative block mt-4"
          >
            <img
              alt="Image preview"
              class="relative block w-full h-[210px] object-cover object-center rounded-lg"
              :src="image"
            >
            <!-- Remove image -->
            <div class="flex items-center justify-end mt-2">
              <button
                type="button"
                class="btn btn--danger btn--sm absolute bottom-4 left-4 right-4"
                @click="() => image = ''"
              >
                Remove image
              </button>
            </div>
          </div>
        </FormGroup>
        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="btn btn--primary" type="submit">
            Create Theme
          </button>
        </div>
      </form>
    </template>
  </Dialog>
</template>


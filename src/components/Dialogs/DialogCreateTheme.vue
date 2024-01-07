<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'
import type { Theme, ThemeCreate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconFolder from '../Icons/IconFolder.vue'
import IconClose from '../Icons/IconClose.vue'
import Modal from '@/lucidui/modals/Modal.vue'
import ModalHeader from '@/lucidui/modals/ModalHeader.vue'
import ModalFooter from '@/lucidui/modals/ModalFooter.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlText from '@/lucidui/form/FormControlText.vue'

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
  validationSchema: toTypedSchema(zod.object({
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
    form.resetForm({
      values: {
        title: '',
        image: '',
        thumbnail: '',
      },
    })
  }
})
</script>

<template>
  <Modal
    width="420px"
    :open="props.open"
    @submit="onSubmit()"
    @close="emits('close')"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          Create Theme
        </template>
        <template #actions>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="emits('close')"
          >
            <IconClose class="w-5 h-5" />
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
            Theme image (Max file size: 3MB) *
          </template>
          <template #control="{ id }">
            <Button
              :id="id"
              class="w-full justify-start border border-slate-300"
              color="secondary"
              @click="handleSelectImage()"
            >
              <IconFolder class="w-4 h-4" />
              Select image
            </Button>
          </template>
          <template v-if="form.submitCount.value > 0 && form.errors.value.image" #error>
            {{ form.errors.value.image }}
          </template>
        </FormGroup>
        <div
          v-if="image"
          class="relative block mt-4"
        >
          <img
            alt="Image preview"
            class="relative block w-full h-[210px] object-cover object-center rounded-lg"
            :src="image"
          >
          <div class="flex items-center justify-end mt-2">
            <Button
              type="button"
              color="danger"
              size="sm"
              class="absolute bottom-4 left-4 right-4"
              @click="() => image = ''"
            >
              Remove image
            </Button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            type="submit"
            :disabled="!form.meta.value.valid"
          >
            Create Theme
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
</template>


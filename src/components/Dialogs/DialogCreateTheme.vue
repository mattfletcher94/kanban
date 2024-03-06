<script lang="ts" setup>
import { X, Folder } from 'lucide-vue-next'
import { watch } from 'vue'
import { useToast } from 'vue-toastification'
import type { Theme } from '@/stores/boards'
import { useBoardsStore } from '@/stores/boards'
import { Button, FormGroup, FormControlText, Modal, ModalHeader, ModalFooter } from '@/lucidui'
import { useCreateThemeForm } from '@/composables/useCreateThemeForm'

const props = defineProps<{
  open: boolean
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'create', board: Theme): void
}>()

const store = useBoardsStore()
const toast = useToast()

const form = useCreateThemeForm({
  initialValues: {
    title: '',
    image: '',
    thumbnail: '',
  },
})

const onSubmit = form.handleSubmit(async (values, actions) => {
  const response = await window.api.images.upload(form.values.image.value)
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
    form.values.image.value = result.base64
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
            Theme image (Max file size: 3MB) *
          </template>
          <template #control="{ id }">
            <Button
              :id="id"
              class="w-full justify-start border border-slate-300"
              color="secondary"
              @click="handleSelectImage()"
            >
              <Folder class="w-4 h-4" />
              Select image
            </Button>
          </template>
          <template  v-if="form.errorBag.value.image?.[0]" #error>
            {{ form.errorBag.value.image?.[0] }}
          </template>
        </FormGroup>
        <div
          v-if="form.values.image.value"
          class="relative block mt-4"
        >
          <img
            alt="Image preview"
            class="relative block w-full h-[210px] object-cover object-center rounded-lg"
            :src="form.values.image.value"
          >
          <div class="flex items-center justify-end mt-2">
            <Button
              type="button"
              color="danger"
              size="sm"
              class="absolute bottom-4 left-4 right-4"
              @click="() => form.values.image.value = ''"
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


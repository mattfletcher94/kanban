<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { ref, unref, watch } from 'vue'
import type { Board, BoardUpdate, Theme } from '../../stores/boards'
import Switch from '../Inputs/Switch.vue'
import Dialog from './Dialog.vue'
import Button from '@/lucidui/buttons/Button.vue'

const props = defineProps<{
  open: boolean
  board: Board
}>()

const emit = defineEmits<{
  (event: 'delete', boardId: string): void
  (event: 'save', board: BoardUpdate): void
  (event: 'close'): void
}>()

const form = useForm<BoardUpdate>({
  initialValues: {
    id: unref(props.board.id),
    viewSettings: unref(props.board.viewSettings || {
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }),
  },
  validationSchema: toTypedSchema(zod.object({
    id: zod.string().min(1, 'Id is required'),
    viewSettings: zod.object({
      hideLabels: zod.boolean().default(false),
      hideDescription: zod.boolean().default(false),
      hideLinks: zod.boolean().default(false),
      hideTodos: zod.boolean().default(false),
    }).optional().default({
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }),
  })),
})

const viewSettings = form.useFieldModel('viewSettings')

const onSubmit = form.handleSubmit((values) => {
  emit('save', values)
})

const onUpdateViewSettings = (
  key: 'hideLabels' | 'hideDescription' | 'hideLinks' | 'hideTodos',
  value: boolean,
) => {
  if (!viewSettings.value) {
    viewSettings.value = {
      hideLabels: false,
      hideDescription: false,
      hideLinks: false,
      hideTodos: false,
    }
  }

  viewSettings.value[key] = value
}

watch(() => props.open, () => {
  if (props.open) {
    form.setValues({
      id: unref(props.board.id),
      viewSettings: unref(props.board.viewSettings),
    })
  }
})
</script>

<template>
  <Dialog
    title="View settings"
    width="360px"
    :open="props.open"
    @close="() => emit('close')"
  >
    <template #content>
      <form @submit.prevent="() => onSubmit()">
        <div class="flex flex-col gap-4 items-start">
          <Switch
            :checked="!(viewSettings?.hideLabels || false)"
            @change="(value) => onUpdateViewSettings('hideLabels', !value)"
          >
            Show card labels
          </Switch>
          <Switch
            :checked="!(viewSettings?.hideDescription || false)"
            @change="(value) => onUpdateViewSettings('hideDescription', !value)"
          >
            Show card description
          </Switch>
          <Switch
            :checked="!(viewSettings?.hideLinks || false)"
            @change="(value: boolean) => onUpdateViewSettings('hideLinks', !value)"
          >
            Show card links
          </Switch>
          <Switch
            :checked="!(viewSettings?.hideTodos || false)"
            @change="(value) => onUpdateViewSettings('hideTodos', !value)"
          >
            Show card todos
          </Switch>
        </div>
        <Button class="w-full mt-6" type="submit">
          Save changes
        </Button>
      </form>
    </template>
  </Dialog>
</template>


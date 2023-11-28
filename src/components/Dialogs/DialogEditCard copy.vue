<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card, CardUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconAdd from '../Icons/IconAdd.vue'
import CardLabel from '../CardLabel.vue'
import IconBin from '../Icons/IconBin.vue'
import IconOpen from '../Icons/IconOpen.vue'
import Dialog from './Dialog.vue'
import DialogLabelManagement from './DialogLabelManagement.vue'
import Checkbox from './../Inputs/Checkbox.vue'
import Button from '@/lucidui/buttons/Button.vue'
import FormGroup from '@/lucidui/form/FormGroup.vue'
import FormControlTextarea from '@/lucidui/form/FormControlTextarea.vue'

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

const linksList = ref<any>()
const todosList = ref<any>()
const dialogLabelManagementOpen = ref(false)

const form = useForm<CardUpdate>({
  initialValues: {
    id: unref(props.card?.id || ''),
    columnId: unref(props.card?.columnId || ''),
    title: unref(props.card?.title),
    description: unref(props.card?.description),
    labelIds: unref(props.card?.labelIds || []),
    links: unref(props.card?.links || []),
    todos: unref(props.card?.todos || []),
  },
  validationSchema: toTypedSchema(zod.object({
    id: zod.string().min(1, 'ID is required'),
    columnId: zod.string().min(1, 'Column is required'),
    title: zod.string().min(1, 'Title is required'),
    description: zod.string().optional().default(''),
    labelIds: zod.array(zod.string()).optional().default([]),
    links: zod.array(zod.object({
      id: zod.string().min(1, 'ID is required'),
      name: zod.string().optional().default(''),
      url: zod.string().optional().default(''),
    })).optional().default([]),
    todos: zod.array(zod.object({
      id: zod.string().min(1, 'ID is required'),
      description: zod.string().optional().default(''),
      completed: zod.boolean().optional().default(false),
    })).optional().default([]),
  })),
})

const title = form.useFieldModel('title')
const description = form.useFieldModel('description')
const labelIds = form.useFieldModel('labelIds')
const links = form.useFieldModel('links')
const todos = form.useFieldModel('todos')

const onSubmit = form.handleSubmit((values, actions) => {
  // Remove empty links
  if (values.links)
    values.links = values.links.filter(link => link.name || link.url)

  // Remove empty todos and trim description
  if (values.todos) {
    values.todos = values.todos
      .filter(todo => todo.description)
      .map((todo) => {
        todo.description = todo.description.trim()
        return todo
      })
  }

  emits('save', values)
})

const onClose = () => {
  emits('close')
}

const onDeleteCard = () => {
  emits('delete', props.card?.id || '')
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

const handleClickAddTodoBtn = async () => {
  if (!todos.value)
    todos.value = []

  todos.value.push({
    id: uuidv4(),
    description: '',
    completed: false,
  })

  // Find last input and focus it
  await nextTick()

  if (todosList.value && todosList.value.$el) {
    const lastInput = todosList.value.$el.querySelector('li:last-child input')
    if (lastInput)
      lastInput.focus()
  }
}

const handleDeleteTodo = (id: string) => {
  if (!todos.value)
    todos.value = []

  todos.value = todos.value.filter(x => x.id !== id)
}

const handleToggleTodoCompleted = (id: string) => {
  if (!todos.value)
    todos.value = []

  const todo = todos.value.find(x => x.id === id)
  if (todo)
    todo.completed = !todo.completed
}

const selectedLabels = computed(() => {
  return boardsStore.labels.filter(label => labelIds.value?.includes(label.id))
})

watch(() => props.open, () => {
  if (props.open) {
    form.setValues({
      id: unref(props.card?.id || ''),
      columnId: unref(props.card?.columnId || ''),
      title: unref(props.card?.title),
      description: unref(props.card?.description),
      labelIds: unref(props.card?.labelIds || []),
      links: unref(props.card?.links || []),
      todos: unref(props.card?.todos || []),
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
        <resize-textarea
          v-model="title"
          :rows="1"
          :min-height="32"
          :spellcheck="false"
          class="textarea--in-place text-lg font-bold mt-1"
          placeholder="Add Title"
        />
      </div>
    </template>
    <template #content>
      <a href="#" />
      <div class="flex flex-col gap-8">

        <!-- Labels -->
        <FormGroup>
          <template #label>
            <div class="">
              Labels
            </div>
          </template>
          <div
            class="flex flex-wrap gap-2 w-full"
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
          </div>
        </FormGroup>

        <!-- Description -->
        <FormGroup>
          <template #label>
            Description
          </template>
          <resize-textarea
            v-model="description"
            :spellcheck="false"
            :rows="1"
            :min-height="32"
            class="textarea--in-place text-base"
            placeholder="No description"
          />
        </FormGroup>

        <!-- Todos -->
        <FormGroup>
          <template #label>
            <div class="flex items-center px-1">
              <div class="">
                To Do List
                <span v-if="todos && todos.length > 0">
                  ({{ todos.filter(x => x.completed).length }}/{{ todos.length }})
                </span>
              </div>
            </div>
          </template>
          <ul
            v-if="todos && todos.length"
            ref="todosList"
            class="flex flex-col divide-y divide-gray-300 w-full rounded-lg border border-gray-300 overflow-hidden"
          >
            <li
              v-for="(todo) in todos"
              :key="todo.id"
              class="flex items-center gap-2 bg-white p-3"
            >
              <div class="shrink-0">
                <Checkbox
                  :checked="todo.completed"
                  @change="() => handleToggleTodoCompleted(todo.id)"
                />
              </div>
              <div class="w-full">
                <resize-textarea
                  v-model="todo.description"
                  :class="{
                    'line-through': todo.completed,
                  }"
                  :rows="1"
                  :min-height="32"
                  :spellcheck="false"
                  class="textarea--in-place"
                  placeholder="Enter description..."
                />
              </div>
              <div class="shrink-0">
                <Button color="secondary" variant="ghost" size="sm" @click="handleDeleteTodo(todo.id)">
                  <IconBin class="w-4 h-4" />
                </Button>
              </div>
            </li>
          </ul>
          <div>
            <button
              class="btn btn--gray h-8 mt-2 flex items-center gap-2 justify-start"
              @click="() => handleClickAddTodoBtn()"
            >
              <div>
                Add Todo
              </div>
              <div>
                <IconAdd class="w-4 h-4" />
              </div>
            </button>
          </div>
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
          <ul
            v-if="links && links.length"
            ref="linksList"
            class="flex flex-col divide-y divide-gray-300 w-full rounded-lg border border-gray-300 overflow-hidden"
          >
            <li
              v-for="(link) in links"
              :key="link.id"
              class="flex items-center gap-2 bg-white p-3"
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
                <Button color="secondary" variant="ghost" size="sm" @click="handleDeleteLink(link.id)">
                  <IconBin class="w-4 h-4" />
                </Button>
              </div>
            </li>
          </ul>
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
      </div>
    </template>

    <template #footer>
      <!-- Buttons -->
      <div class="flex items-center justify-between gap-4 px-6 py-4">
        <Button color="danger" variant="ghost" @click="onDeleteCard()">
          Delete card
        </Button>
        <Button
          :disabled="!form.meta.value.valid"
          @click="onSubmit()"
        >
          Save changes
        </Button>
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

.todo-description-textfield {
  @apply w-full !p-1 border-transparent bg-transparent font-semibold resize-none ring-1 ring-transparent leading-normal rounded-md overflow-hidden;
  @apply hover:bg-gray-100 focus:bg-gray-50 focus:ring-1 focus:ring-primary-500;
}
</style>

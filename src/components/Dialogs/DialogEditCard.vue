<script lang="ts" setup>
import { X, Trash, MoreVertical, Plus, ExternalLink } from 'lucide-vue-next'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card, CardUpdate } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import CardLabel from '../CardLabel.vue'
import DialogLabelManagement from './DialogLabelManagement.vue'
import DialogConfirm from './DialogConfirm.vue'
import { Button, FormGroup, FormControlCheckbox, FormControlTextarea, Modal, ModalHeader, ModalFooter, Dropdown, DropdownOption } from '@/lucidui'
import { useEditCardForm } from '@/composables/useEditCardForm'

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
const dialogConfirmDeleteOpen = ref(false)

const form = useEditCardForm({
  initialValues: {
    id: unref(props.card?.id || ''),
    columnId: unref(props.card?.columnId || ''),
    title: unref(props.card?.title),
    description: unref(props.card?.description),
    labelIds: unref(props.card?.labelIds || []),
    links: unref(props.card?.links || []),
    todos: unref(props.card?.todos || []),
  },
})

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
  dialogConfirmDeleteOpen.value = false
  emits('delete', props.card?.id || '')
}

const handleSelectLabel = (id: string) => {
  if (!form.values.labelIds.value)
    form.values.labelIds.value = []

  if (!form.values.labelIds.value.includes(id))
    form.values.labelIds.value.push(id)
}

const handleUnselectLabel = (id: string) => {
  if (!form.values.labelIds.value)
    form.values.labelIds.value = []

  if (form.values.labelIds.value.includes(id))
    form.values.labelIds.value = form.values.labelIds.value.filter(x => x !== id)
}

const handleClickAddLinkBtn = async () => {
  if (!form.values.links.value)
    form.values.links.value = []

  form.values.links.value.push({
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
  if (!form.values.links.value)
  form.values.links.value = []

  form.values.links.value = form.values.links.value.filter(x => x.id !== id)
}

const handleClickAddTodoBtn = async () => {
  if (!form.values.todos.value)
  form.values.todos.value = []

  form.values.todos.value.push({
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
  if (!form.values.todos.value)
    form.values.todos.value = []

  form.values.todos.value = form.values.todos.value.filter(x => x.id !== id)
}

const handleToggleTodoCompleted = (id: string) => {
  if (!form.values.todos.value)
    form.values.todos.value = []

  const todo = form.values.todos.value.find(x => x.id === id)
  if (todo)
    todo.completed = !todo.completed
}

const selectedLabels = computed(() => {
  return boardsStore.labels.filter(label => form.values.labelIds.value?.includes(label.id))
})

watch(() => props.open, () => {
  if (props.open) {
    form.resetForm({
      values: {
        id: unref(props.card?.id || ''),
        columnId: unref(props.card?.columnId || ''),
        title: unref(props.card?.title),
        description: unref(props.card?.description),
        labelIds: unref(props.card?.labelIds || []),
        links: unref(props.card?.links || []),
        todos: unref(props.card?.todos || []),
      },
    })
  }
})
</script>

<template>
  <Modal
    :open="props.open"
    width="660px"
    appearance="slideout"
    @submit="onSubmit"
    @close="onClose"
  >
    <template #header>
      <ModalHeader>
        <template #title>
          <FormGroup class="py-2">
            <template #control="{ id }">
              <FormControlTextarea
                :id="id"
                class="text-lg font-bold"
                :inline="true"
                :value="form.values.title.value"
                :spellcheck="false"
                placeholder="No title"
                @change="(value) => form.values.title.value = value"
              />
            </template>
          </FormGroup>
        </template>
        <template #actions>
          <Dropdown dropdown-width="180px" dropdown-placement="bottom-end">
            <template #trigger="{ toggle }">
              <Button
                class="ml-auto shrink-0"
                color="secondary"
                variant="ghost"
                shape="circle"
                title="Close"
                @click="toggle"
              >
                <MoreVertical class="h-5 w-5" />
              </Button>
            </template>
            <template #options>
              <DropdownOption @click="dialogConfirmDeleteOpen = true">
                <template #label>
                  Delete Card
                </template>
              </DropdownOption>
            </template>
          </Dropdown>
          <Button
            color="secondary"
            variant="ghost"
            shape="circle"
            type="button"
            @click="onClose"
          >
            <X class="w-5 h-5" />
          </Button>
        </template>
      </ModalHeader>
    </template>
    <template #body>
      <div class="p-6 w-full flex flex-col gap-6">
        <!-- Labels -->
        <FormGroup>
          <template #label>
            Labels
          </template>
          <template #control>
            <div class="flex flex-wrap gap-2 w-full">
              <CardLabel
                v-for="label in selectedLabels"
                :key="label.id"
                class="min-h-[32px]"
                :color="label.color"
                :title="label.title"
              >
                {{ label.title }}
              </CardLabel>
              <Button
                key="button"
                color="secondary"
                size="sm"
                class="justify-start"
                @click="() => dialogLabelManagementOpen = true"
              >
                <Plus class="w-4 h-4" />
                Add Label
              </Button>
            </div>
          </template>
        </FormGroup>

        <!-- Description -->
        <FormGroup>
          <template #label>
            Description
          </template>
          <template #control="{ id }">
            <FormControlTextarea
              :id="id"
              :value="form.values.description.value"
              :inline="true"
              :spellcheck="false"
              class="text-sm -ml-1"
              placeholder="No description"
              @change="(value) => form.values.description.value = value"
            />
          </template>
        </FormGroup>

        <!-- Todos -->
        <FormGroup>
          <template #label>
            <div class="flex justify-between items-center">
              To-do's
              <Button
                v-if="form.values.todos.value && form.values.todos.value.length"
                key="button"
                color="secondary"
                size="sm"
                variant="tonal"
                @click="handleClickAddTodoBtn"
              >
                Add Todo
                <Plus class="w-4 h-4" />
              </Button>
            </div>
          </template>
          <template #control>
            <ul
            v-if="form.values.todos.value && form.values.todos.value.length"
              ref="todosList"
              class="flex flex-col mt-1 divide-y divide-slate-200 w-full rounded-lg border border-slate-200 overflow-hidden"
            >
              <li
                v-for="(todo) in form.values.todos.value"
                :key="todo.id"
                class="flex items-center gap-2 bg-white p-2"
              >
                <div class="shrink-0">
                  <FormControlCheckbox
                    size="sm"
                    :checked="todo.completed"
                    @change="() => handleToggleTodoCompleted(todo.id)"
                  />
                </div>
                <div class="w-full">
                  <FormControlTextarea
                    :value="todo.description"
                    :class="todo.completed ? 'line-through' : ''"
                    :spellcheck="false"
                    :inline="true"
                    placeholder="Enter description..."
                    @change="(value) => todo.description = value"
                  />
                </div>
                <div class="shrink-0">
                  <Button
                    v-tooltip="{ content: 'Delete todo' }"
                    class="text-slate-600"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    @click="handleDeleteTodo(todo.id)"
                  >
                    <Trash class="w-4 h-4" />
                  </Button>
                </div>
              </li>
            </ul>
            <div v-else>
              <Button
                key="button"
                color="secondary"
                size="sm"
                @click="handleClickAddTodoBtn"
              >
                <Plus class="w-4 h-4" />
                Add Todo
              </Button>
            </div>
          </template>
        </FormGroup>

        <!-- Links -->
        <FormGroup>
          <template #label>
            <div class="flex justify-between items-center">
              Links
              <Button
                v-if="form.values.links.value && form.values.links.value.length"
                key="button"
                color="secondary"
                size="sm"
                variant="tonal"
                @click="handleClickAddLinkBtn"
              >
                Add Link
                <Plus class="w-4 h-4" />
              </Button>
            </div>
          </template>
          <template #control>
            <ul
            v-if="form.values.links.value && form.values.links.value.length"
              ref="linksList"
              class="flex flex-col mt-1 divide-y divide-slate-200 w-full rounded-lg border border-slate-200 overflow-hidden"
            >
              <li
                v-for="(link) in form.values.links.value"
                :key="link.id"
                class="flex items-center gap-2 bg-white p-2"
              >
                <div class="w-full">
                  <FormControlTextarea
                    :value="link.name"
                    :spellcheck="false"
                    :inline="true"
                    placeholder="Enter link name..."
                    @change="(value) => link.name = value"
                  />
                </div>
                <div class="w-full">
                  <FormControlTextarea
                    :value="link.url"
                    :spellcheck="false"
                    :inline="true"
                    placeholder="Enter link URL..."
                    @change="(value) => link.url = value"
                  />
                </div>
                <div class="ml-auto shrink-0">
                  <Button
                    v-tooltip="{ content: 'Open link in browser' }"
                    class="text-slate-600"
                    as="a"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    :href="link.url"
                    target="_blank"
                  >
                    <ExternalLink class="w-4 h-4" />
                  </Button>
                </div>
                <div class="shrink-0">
                  <Button
                    v-tooltip="{ content: 'Delete link' }"
                    class="text-slate-600"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    @click="handleDeleteLink(link.id)"
                  >
                    <Trash class="w-4 h-4" />
                  </Button>
                </div>
              </li>
            </ul>
            <div v-else>
              <Button
                key="button"
                color="secondary"
                size="sm"
                @click="handleClickAddLinkBtn"
              >
                <Plus class="w-4 h-4" />
                Add Link
              </Button>
            </div>
          </template>
        </FormGroup>
      </div>
    </template>
    <template #footer>
      <ModalFooter>
        <template #actions>
          <Button
            class="w-full"
            color="primary"
            type="submit"
            :disabled="!form.meta.value.valid"
          >
            Save changes
          </Button>
        </template>
      </ModalFooter>
    </template>
  </Modal>
  <DialogLabelManagement
    :open="dialogLabelManagementOpen"
    :selected-labels="form.values.labelIds.value || []"
    @select="(labelId) => handleSelectLabel(labelId)"
    @unselect="(labelId) => handleUnselectLabel(labelId)"
    @create="(label) => handleSelectLabel(label.id)"
    @close="dialogLabelManagementOpen = false"
  />
  <DialogConfirm
    title="Delete Card"
    message="Are you sure you want to delete this card (no undo)?"
    :open="dialogConfirmDeleteOpen"
    @cancel="dialogConfirmDeleteOpen = false"
    @confirm="onDeleteCard"
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

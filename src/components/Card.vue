<script lang="ts" setup>
import { ExternalLink } from 'lucide-vue-next';
import { Card, Label } from '@/stores/boards';
import CardLabel from '@/components/CardLabel.vue';
import { Button, FormControlCheckbox } from '@/lucidui'

defineProps<{
  card: Card,
  labels: Label[],
  isFiltered?: boolean,
  hideLabels?: boolean,
  hideDescription?: boolean,
  hideTodos?: boolean,
  hideLinks?: boolean,
}>();

const emits = defineEmits<{
  click: [],
  toggleTodoCompleted: [cardId: string, todoId: string],
}>();
</script>
<template>
  <button
      :id="card.id"
      :key="card.id"
      :data-card-id="card.id"
      class="rounded-lg relative p-4 bg-white shadow-sm text-slate-700 outline-2 outline-dashed outline-transparent cursor-grab text-left transition-opacity"
      @click="emits('click')"
    >

      <!-- Card title -->
      <div class="flex w-full items-start justify-start font-medium gap-4">
        <div class="min-w-0">
          <h4
            :key="card.title"
            class="min-w-0 mt-[3px] text-base font-bold"
            v-html="card.title"
          />
        </div>
      </div>

      <!-- Card Labels -->
      <div
        v-if="card.labelIds && card.labelIds.length && hideLabels !== true"
        class="flex flex-wrap gap-2 w-full items-center mt-2"
        name="vue-list"
        tag="div"
      >
        <CardLabel
          v-for="label in labels"
          :key="label.id"
          :color="label.color"
          :title="label.title"
        >
          {{ label.title }}
        </CardLabel>
      </div>

      <!-- Card body -->
      <div class="flex flex-col gap-4 mt-4">
        <!-- Card description -->
        <div
          v-if="card.description && hideDescription !== true"
        >
          <div
            class="prose-card--sm line-clamp-6"
            v-html="card.description"
          />
        </div>

        <ul
          v-if="card.todos && card.todos.length && hideTodos !== true"
          ref="todosList"
          class="flex flex-col divide-y divide-gray-200 w-full rounded-lg border border-gray-200 bg-slate-50 overflow-hidden max-h-[300px] overflow-x-hidden overflow-y-auto"
        >
          <li
            v-for="(todo) in card.todos"
            :key="todo.id"
            class="flex items-center"
            @click="(e) => e.stopPropagation()"
          >
            <div class="w-full">
              <FormControlCheckbox
                class="p-2 w-full hover:bg-primary-50 transition-colors"
                size="sm"
                :checked="todo.completed"
                @change="() => emits('toggleTodoCompleted', card.id, todo.id)"
              >
                <span :class="{ 'line-through': todo.completed }">
                  {{ todo.description }}
                </span>
              </FormControlCheckbox>
            </div>
          </li>
        </ul>

        <!-- Card links -->
        <div
          v-if="card.links && card.links.length > 0 && hideLinks !== true"
          class="flex flex-wrap gap-2 w-full"
        >
          <Button
            v-for="link in card.links"
            :key="link.id"
            as="a"
            size="sm"
            color="secondary"
            :href="link.url"
            target="_blank"
          >
            <ExternalLink class="w-4 h-4" />
            {{ link.name }}
          </Button>
        </div>
      </div>
    </button>
</template>
<script lang='ts' setup>
import { computed } from 'vue'
import type { Theme } from '../../stores/boards'
import { useBoardsStore } from '../../stores/boards'
import IconChevonDown from '../Icons/IconChevonDown.vue'
import IconBin from '../Icons/IconBin.vue'
import DropdownOption from './DropdownOption.vue'
import Dropdown from './Dropdown.vue'

const props = defineProps<{
  selected: string
  allowDelete?: boolean
}>()

const emit = defineEmits<{
  (event: 'select', themeId: string): void
}>()

const store = useBoardsStore()

const themes = computed(() => store.getThemes)
const selectedTheme = computed(() => themes.value.find(t => t.id === props.selected))

const handleDeleteTheme = (id: string) => {
  // If theme is selected theme, reset themeId
  if (id === props.selected)
    emit('select', store.getThemes[0].id)

  // Delete theme image
  const image = store.getThemeById(id)?.image
  if (image)
    window.api.images.delete(image)

  store.deleteTheme(id)
}

const resovleImageThumbnail = (theme?: Theme) => {
  if (!theme)
    return ''
  if (theme.thumbnail)
    return theme.thumbnail
  return theme.image
}
</script>

<template>
  <Dropdown>
    <template #trigger>
      <button type="button" class="select flex items-center gap-4 w-full">
        <div>
          <div
            class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
            :style="{ backgroundImage: `url(${resovleImageThumbnail(selectedTheme)})` }"
          />
        </div>
        <div>
          {{ selectedTheme?.title || 'Select theme...' }}
        </div>
        <div class="ml-auto">
          <IconChevonDown class="w-4 h-4" />
        </div>
      </button>
    </template>
    <template #options>
      <DropdownOption
        v-for="theme in themes"
        :key="theme.id"
        :selected="theme.id === selected"
        @click="() => emit('select', theme.id)"
      >
        <div class="flex items-center gap-4 w-full">
          <div>
            <div
              class="w-6 h-6 rounded-full bg-no-repeat bg-cover bg-center"
              :style="{ backgroundImage: `url(${resovleImageThumbnail(theme)})` }"
            />
          </div>
          <div class="min-w-0 truncate">
            {{ theme.title }}
          </div>
          <div
            v-if="theme.isCustom && props.allowDelete"
            class="ml-auto"
          >
            <button
              v-tooltip="{ content: 'Delete theme (cannot be undone)' }"
              type="button"
              class="btn btn--light !px-2 !text-slate-500 !py-0 !h-8"
              @click.stop="() => handleDeleteTheme(theme.id)"
            >
              <IconBin class="w-4 h-4" />
            </button>
          </div>
        </div>
      </DropdownOption>
    </template>
  </Dropdown>
</template>

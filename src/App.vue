<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="app relative block w-full min-h-screen">
    <div
      class="
      hidden
      bg-red-100 bg-red-500 bg-red-600 text-red-600
      bg-orange-100 bg-orange-500 bg-orange-600 text-orange-600
      bg-yellow-100 bg-yellow-500 bg-yellow-600 text-yellow-600
      bg-amber-100 bg-amber-500 bg-amber-600 text-amber-600
      bg-lime-100 bg-lime-500 bg-lime-600 text-lime-600
      bg-green-100 bg-green-500 bg-green-600 text-green-600
      bg-emerald-100 bg-emerald-500 bg-emerald-600 text-emerald-600
      bg-teal-100 bg-teal-500 bg-teal-600 text-teal-600
      bg-cyan-100 bg-cyan-500 bg-cyan-600 text-cyan-600
      bg-sky-100 bg-sky-500 bg-sky-600 text-sky-600
      bg-blue-100 bg-blue-500 bg-blue-600 text-blue-600
      bg-indigo-100 bg-indigo-500 bg-indigo-600 text-indigo-600
      bg-violet-100 bg-violet-500 bg-biolet-600 text-violet-600
      bg-purple-100 bg-purple-500 bg-purple-600 text-purple-600
      bg-fuchsia-100 bg-fuchsia-500 bg-fuchsia-600 text-fuchsia-600
      bg-pink-100 bg-pink-500 bg-pink-600 text-pink-600
      bg-rose-100 bg-rose-500 bg-rose-600 text-rose-600
    "
    />
    <RouterView v-slot="{ Component }" :key="route.fullPath">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 50ms ease, transform 50ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

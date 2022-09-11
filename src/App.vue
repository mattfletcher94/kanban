<script setup lang="ts">
</script>

<template>
  <main class="relative block w-full min-h-screen">
    <RouterView v-slot="{ Component }">
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

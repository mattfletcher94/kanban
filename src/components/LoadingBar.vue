<script lang="ts" setup>

</script>

<template>
  <div class="loading-bar">
    <div class="loading-bar__bar" />
  </div>
</template>

<style scoped>
.loading-bar {
  @apply
    relative
    block
    w-full
    rounded-md
    bg-gray-100
    overflow-hidden;
  height: 4px;
}

.loading-bar__bar {
  @apply
    absolute
    block;
  left: -50%;
  width: 50%;
  height: 4px;
  animation: loadingBarAnimation 1500ms linear infinite;
  @apply bg-primary-500;
}

@keyframes loadingBarAnimation {
  from {
    left: -50%;
    width: 50%;
  }
  50% {
    width: 30%;
  }
  70% {
    width: 70%;
  }
  80% {
    left: 50%;
  }
  95% {
    left: 120%;
  }
  to {
    left: 100%;
  }
}
</style>

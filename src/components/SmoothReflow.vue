<script lang="ts">
import smoothReflow from 'vue-smooth-reflow'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SmoothReflow',
  mixins: [smoothReflow],
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    options: {
      type: Object,
      default: () => ({
        property: ['height', 'width'],
        transition: 'height 300ms ease, width 300ms ease',
      }),
    },
  },
  mounted() {
    const smoothreflow = this.$smoothReflow as any
    smoothreflow(this.options)
  },
})
</script>

<template>
  <component :is="tag">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { LoCha, ObjType } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  loChas: LoCha[]
}>()

defineEmits<{
  (e: 'accept', id: { id: number, objtype: ObjType }): void
}>()

const scrollCount = ref<number>(10)
function scrollLoad() {
  scrollCount.value += 10
}

const lazyLoChas = computed(() => {
  return props.loChas.slice(0, scrollCount.value)
})
</script>

<template>
  <div>
    <el-space v-infinite-scroll="scrollLoad" fill :size="20">
      <lo-cha-item
        v-for="loCha in lazyLoChas"
        :key="loCha.id"
        :item="loCha"
        :project-slug="projectSlug"
        @accept="$emit('accept', $event)"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

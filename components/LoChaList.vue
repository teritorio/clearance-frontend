<script setup lang="ts">
import type { LoCha } from '~/libs/types'

//
// Props
//
const props = defineProps<{
  projectSlug: string
  loChas: LoCha[]
}>()

//
// Emits
//
defineEmits<{
  (e: 'accept', id: number): void
}>()

//
// Data
//
const scrollCount = ref(10)
const borderColors = ['#363637', '#636466', '#A3A6AD', '#E5EAF3']

//
// Computed
//
const lazyLoChas = computed(() => props.loChas.slice(0, scrollCount.value))

//
// Methods
//
function scrollLoad() {
  scrollCount.value += 10
}
</script>

<template>
  <div>
    <el-space v-infinite-scroll="scrollLoad" fill :size="20">
      <lo-cha-item
        v-for="(loCha, index) in lazyLoChas"
        :key="loCha.id"
        :border-color="loCha.objects.length > 1 ? borderColors[index % borderColors.length] : undefined"
        :item="loCha"
        :project-slug="projectSlug"
        @accept="$emit('accept', $event)"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

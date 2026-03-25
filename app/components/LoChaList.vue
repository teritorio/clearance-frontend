<script setup lang="ts">
import type { LoCha } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
  loChas: LoCha[]
}>()

defineEmits<{
  (e: 'accept', id: number): void
}>()

const scrollCount = ref(10)
const borderColors = ['#363637', '#636466', '#A3A6AD', '#E5EAF3']

const lazyLoChas = computed((): LoCha[] => props.loChas.slice(0, scrollCount.value))

function scrollLoad() {
  scrollCount.value += 10
}

function getBorderColor(loCha: LoCha, index: number): string | undefined {
  return loCha.objects.length > 1 ? borderColors[index % borderColors.length] : undefined
}
</script>

<template>
  <div>
    <el-space v-infinite-scroll="scrollLoad" fill :size="20">
      <lo-cha-item
        v-for="(loCha, index) in lazyLoChas"
        :key="loCha.id"
        :border-color="getBorderColor(loCha, index)"
        :item="loCha"
        :project-slug="projectSlug"
        @accept="$emit('accept', $event)"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

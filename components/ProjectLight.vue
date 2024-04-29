<script setup lang="ts">
import type { Project } from '~/libs/types'

defineProps<{
  project: Project
}>()
</script>

<template>
  <span>
    <span class="title">{{ $i18nHash(project.title) }}</span>
    <el-tag
      v-for="tag in project.project_tags"
      :key="tag"
      class="item"
      size="small"
    >{{ tag }}</el-tag>
    <br />
    <el-text class="mx-1" type="info">
      {{ $i18nHash(project.description) }}
    </el-text>
  </span>
  <el-button-group>
    <nuxt-link class="el-button" :to="`/${project.id}/validators/`">
      {{ $t('project.settings') }}
    </nuxt-link>
    <nuxt-link class="el-button el-button--primary" :to="`/${project.id}`">
      {{ $t('project.details') }}
    </nuxt-link>
  </el-button-group>
</template>

<style scoped>
.title {
  font-weight: 600;
  padding-right: 1em;
}

.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>

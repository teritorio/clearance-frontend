<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { Link } from '@element-plus/icons-vue'

const props = defineProps<{
  project: InitializedProject
}>()

const config = useRuntimeConfig()

const overpassUrl = computed(() => `${config.public.api}/projects/${props.project.id}/overpasslike/`)
const atomUrl = computed(() => `${config.public.api}/projects/${props.project.id}/changes_logs.atom`)
const userGroups = computed(() => Object.values(props.project.user_groups))
</script>

<template>
  <div class="project-info">
    <LazyUserGroups v-if="userGroups.length" :user-groups="userGroups" :show-map="false" />

    <div class="info-section">
      <ul class="link-list">
        <li>
          <el-icon><Link /></el-icon>
          <span class="link-label">{{ $t('project.overpassUrl') }}</span>
          <a :href="overpassUrl">{{ overpassUrl }}</a>
        </li>
        <li>
          <el-icon><Link /></el-icon>
          <span class="link-label">{{ $t('project.extract') }}</span>
          <a :href="`${config.public.api}/${project.id}/export/${project.id}.osm.pbf`">
            {{ `${project.id}.osm.pbf` }}
          </a>
        </li>
        <li>
          <el-icon><Link /></el-icon>
          <a :href="`${config.public.api}/${project.id}/export/update/`">{{ $t('project.diff') }}</a>
        </li>
        <li>
          <el-icon><Link /></el-icon>
          <a :href="atomUrl" target="_blank">{{ $t('atomFeed') }}</a>
        </li>
      </ul>
    </div>

    <div v-if="project.main_contacts?.length" class="info-section contacts-section">
      <span class="contacts-label">{{ $t('app.project.mainContacts') }}</span>
      <div class="contacts-list">
        <a
          v-for="user in project.main_contacts"
          :key="user"
          :href="`https://www.openstreetmap.org/user/${user}`"
          target="_blank"
          class="user-chip"
        >{{ user }}</a>
      </div>
    </div>

    <div class="info-section">
      <p class="join-text">
        {{ $t('app.project.join') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.info-section {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
}

.link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.link-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  min-width: 0;
}

.link-list a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.link-list .el-icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}

.link-label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.contacts-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.contacts-label {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
}

.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-chip {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.user-chip:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.join-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}
</style>

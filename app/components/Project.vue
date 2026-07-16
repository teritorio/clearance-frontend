<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { ArrowDown, Link, Setting } from '@element-plus/icons-vue'

const props = defineProps<{
  project: InitializedProject
}>()

const expanded = ref(false)
const config = useRuntimeConfig()

const overpassUrl = computed(() => `${config.public.api}/projects/${props.project.id}/overpasslike/`)
const atomUrl = computed(() => `${config.public.api}/projects/${props.project.id}/changes_logs.atom`)
</script>

<template>
  <el-card shadow="hover" class="project-card">
    <template #header>
      <div class="card-header">
        <project-light :project="project" title-tag="h3" />
        <nuxt-link :to="`/${project.id}/validators`" class="settings-icon" :title="$t('project.settings')">
          <el-icon><Setting /></el-icon>
        </nuxt-link>
        <button class="expand-trigger" @click="expanded = !expanded">
          <el-icon class="expand-icon" :class="{ 'is-expanded': expanded }">
            <ArrowDown />
          </el-icon>
        </button>
      </div>
    </template>

    <div v-show="expanded" class="card-body">
      <div class="stats-row">
        <project-stats :last-update="project.date_last_update" :to-be-validated="project.to_be_validated" />
      </div>

      <LazyUserGroups v-if="expanded" :user-groups="Object.values(project.user_groups)" />

      <div class="collapse-section">
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

      <div v-if="project.main_contacts?.length" class="collapse-section contacts-section">
        <span class="contacts-label">{{ $t('app.project.mainContacts') }}</span>
        <div class="contacts-list">
          <a
            v-for="user in project.main_contacts"
            :key="user"
            :href="`https://www.openstreetmap.org/user/${user}`"
            target="_blank"
            class="contact"
          >
            <span class="contact-avatar">{{ user.charAt(0).toUpperCase() }}</span>
            {{ user }}
          </a>
        </div>
      </div>

      <div class="collapse-section">
        <p class="join-text">
          {{ $t('app.project.join') }}
        </p>
      </div>
    </div>

    <template #footer>
      <nuxt-link class="el-button el-button--primary details-btn" :to="`/${project.id}/changes_logs`">
        {{ $t('project.details') }}
      </nuxt-link>
    </template>
  </el-card>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  background-color: var(--el-fill-color-lighter);
  padding-bottom: 0;
}

:deep(.el-card__body) {
  padding: 0;
  flex: 1;
}

:deep(.el-card__footer) {
  padding: 8px 12px;
}

.card-header {
  position: relative;
  padding-right: 1.5rem;
}

.settings-icon {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--el-text-color-placeholder);
  text-decoration: none;
  font-size: 1.25rem;
  line-height: 1;
  transition: color 0.15s;
}

.settings-icon:hover {
  color: var(--el-text-color-regular);
}

.expand-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% + 2 * 16px);
  margin: 8px -16px 0;
  padding: 4px 0;
  background: none;
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  transition: color 0.15s, background 0.15s;
}

.expand-trigger:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.expand-icon {
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.collapse-section {
  background-color: var(--el-fill-color-light);
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

.contact {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--el-text-color-regular);
}

.contact:hover {
  color: var(--el-text-color-primary);
  text-decoration: underline;
}

.contact-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.join-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.details-btn {
  width: 100%;
  justify-content: center;
  text-decoration: none;
}
</style>

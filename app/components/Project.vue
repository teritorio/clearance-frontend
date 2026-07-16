<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { ArrowDown, CircleCheck, Clock, Link, Setting } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import en from 'dayjs/locale/en-gb'
import es from 'dayjs/locale/es'
import fr from 'dayjs/locale/fr'
import relativeTime from 'dayjs/plugin/relativeTime'

const props = defineProps<{
  project: InitializedProject
}>()

dayjs.extend(relativeTime)

const _daysjsLocale = { en, fr, es }

const expanded = ref(false)
const config = useRuntimeConfig()
const { locale } = useI18n()

const overpassUrl = computed(() => `${config.public.api}/projects/${props.project.id}/overpasslike/`)
const atomUrl = computed(() => `${config.public.api}/projects/${props.project.id}/changes_logs.atom`)

const lastUpdateCompact = computed(() => {
  if (!props.project.date_last_update) {
    return null
  }
  const diff = dayjs().diff(dayjs(props.project.date_last_update), 'minute')
  if (diff < 60) {
    return `${diff}m`
  }
  if (diff < 60 * 24) {
    return `${Math.floor(diff / 60)}h`
  }
  if (diff < 60 * 24 * 30) {
    return `${Math.floor(diff / (60 * 24))}d`
  }
  return `${Math.floor(diff / (60 * 24 * 30))}mo`
})

const lastUpdateTitle = computed(() => {
  if (!props.project.date_last_update) {
    return undefined
  }
  return dayjs(props.project.date_last_update).locale(locale.value).fromNow()
})
</script>

<template>
  <el-card shadow="hover" class="project-card">
    <template #header>
      <div class="card-header">
        <div class="card-header-row">
          <nuxt-link :to="`/${project.id}/changes_logs`" class="title-link">
            <project-light :project="project" title-tag="h3" />
          </nuxt-link>
          <div class="header-stats">
            <span v-if="lastUpdateCompact" class="stat-badge" :title="lastUpdateTitle">
              <el-icon><Clock /></el-icon>{{ lastUpdateCompact }}
            </span>
            <span v-if="project.to_be_validated" class="stat-badge stat-pending" :title="$t('project.toBeValidated')">
              <el-icon><CircleCheck /></el-icon>{{ project.to_be_validated }}
            </span>
          </div>
          <nuxt-link :to="`/${project.id}/validators`" class="settings-icon" :title="$t('project.settings')">
            <el-icon><Setting /></el-icon>
          </nuxt-link>
        </div>
        <button class="expand-trigger" @click="expanded = !expanded">
          <el-icon class="expand-icon" :class="{ 'is-expanded': expanded }">
            <ArrowDown />
          </el-icon>
        </button>
      </div>
    </template>

    <div v-show="expanded" class="card-body">
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

.card-header {
  display: flex;
  flex-direction: column;
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding-top: 2px;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;
  padding: 3px 8px;
  white-space: nowrap;
}

.stat-badge .el-icon {
  font-size: 0.9rem;
}

.stat-pending {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.settings-icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  text-decoration: none;
  font-size: 1.25rem;
  line-height: 1;
  transition: color 0.15s;
  padding-top: 2px;
}

.settings-icon:hover {
  color: var(--el-text-color-regular);
}

.expand-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: calc(100% + 2 * 16px);
  margin: 8px -16px 0;
  padding: 10px 0;
  background: none;
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  transition: color 0.15s, background 0.15s;
}

.expand-trigger::after {
  content: '';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-border-color-light);
  transition: background 0.15s;
}

.expand-trigger:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.expand-trigger:hover::after {
  background: var(--el-color-primary-light-5);
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

.title-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.title-link:hover :deep(.title) {
  color: var(--el-color-primary);
}
</style>

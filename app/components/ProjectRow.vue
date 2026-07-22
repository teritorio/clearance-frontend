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
  <div class="project-row-wrapper" :class="{ 'is-expanded': expanded }">
    <div class="project-row">
      <nuxt-link :to="`/${project.id}/changes_logs`" class="row-main">
        <span class="row-title">
          {{ useI18nHash(project.title) }}
          <span
            v-for="tag in project.project_tags"
            :key="tag"
            class="tag"
            :style="{
              background: useTagColor(tag).bg,
              color: useTagColor(tag).color,
              borderColor: useTagColor(tag).border,
            }"
          >{{ tag }}</span>
        </span>
        <span class="row-stats">
          <span v-if="lastUpdateCompact" class="stat-badge stat-time" :title="lastUpdateTitle">
            <el-icon><Clock /></el-icon>{{ lastUpdateCompact }}
          </span>
          <span v-if="project.to_be_validated" class="stat-badge stat-pending" :title="$t('project.toBeValidated')">
            <el-icon><CircleCheck /></el-icon>{{ project.to_be_validated }}
          </span>
        </span>
      </nuxt-link>
      <nuxt-link :to="`/${project.id}/validators`" class="row-settings" :title="$t('project.settings')">
        <el-icon><Setting /></el-icon>
      </nuxt-link>
      <button class="row-expand" :title="expanded ? $t('project.details') : $t('project.seeMore')" @click="expanded = !expanded">
        <el-icon class="expand-icon" :class="{ 'is-expanded': expanded }">
          <ArrowDown />
        </el-icon>
      </button>
    </div>

    <div v-show="expanded" class="row-detail">
      <LazyProjectsOverviewMap v-if="expanded" :projects="[project]" />
      <LazyUserGroups v-if="expanded" :user-groups="Object.values(project.user_groups)" />

      <div class="detail-section">
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

      <div v-if="project.main_contacts?.length" class="detail-section contacts-section">
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

      <div class="detail-section">
        <p class="join-text">
          {{ $t('app.project.join') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-row-wrapper {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}

.project-row-wrapper:hover,
.project-row-wrapper.is-expanded {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.project-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
}

.row-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.row-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
  min-width: 0;
}

.row-main:hover .row-title {
  color: var(--el-color-primary);
}

.tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 11px;
  line-height: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.row-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
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

.stat-time {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}

.stat-pending {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.row-settings {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  font-size: 1.1rem;
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1;
}

.row-settings:hover {
  color: var(--el-text-color-regular);
}

.row-expand {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  line-height: 1;
  transition: color 0.15s;
}

.row-expand:hover {
  color: var(--el-text-color-secondary);
}

.expand-icon {
  transition: transform 0.2s;
  font-size: 0.9rem;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.row-detail {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section {
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
</style>

<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { Link } from '@element-plus/icons-vue'

const props = defineProps<{
  project: InitializedProject
}>()

const activeName = ref('')
const config = useRuntimeConfig()

const overpassUrl = computed(() => {
  return `${config.public.api}/projects/${props.project.id}/overpasslike/`
})

const atomUrl = computed(() => `${config.public.api}/projects/${props.project.id}/changes_logs.atom`)
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <project-light :project="project" title-tag="h3" />
    </template>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item :title="$t('project.seeMore')" name="1">
        <LazyUserGroups v-if="activeName === '1'" :user-groups="Object.values(project.user_groups)" />
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
              <span class="contact-avatar" :aria-label="user">{{ user.charAt(0).toUpperCase() }}</span>
              {{ user }}
            </a>
          </div>
        </div>
        <div class="collapse-section">
          <p class="join-text">
            {{ $t('app.project.join') }}
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
:deep(.el-card__header) {
  background-color: #fafafa;
}

.collapse-section {
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  margin-top: 0.5rem;
  font-size: initial;
  line-height: initial;
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
  color: var(--el-color-info);
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
  color: var(--el-color-primary);
}

.contact:hover {
  text-decoration: underline;
}

.contact-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
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

<script setup lang="ts">
import type { IFeature } from '@teritorio/openstreetmap-logical-history-component'

defineProps<{
  before: IFeature | undefined
  after: IFeature
}>()

const OSM_TYPE: Record<string, string> = { n: 'node', w: 'way', r: 'relation' }

function historyUrl(f: IFeature): string {
  return `https://www.openstreetmap.org/${OSM_TYPE[f.properties.objtype] ?? f.properties.objtype}/${f.properties.id}/history`
}

function userUrl(username: string): string {
  return `https://www.openstreetmap.org/user/${encodeURIComponent(username)}`
}

function featureRef(f: IFeature): string {
  return `${f.properties.objtype}${f.properties.id}-v${f.properties.version}`
}
</script>

<template>
  <div class="diff-feature-header">
    <div v-if="before" class="diff-feature-header__side">
      <a :href="historyUrl(before)" target="_blank" class="diff-feature-header__ref" @click.stop>
        {{ featureRef(before) }}
      </a>
      <span class="diff-feature-header__meta">
        📅 {{ before.properties.created }}
      </span>
      <a
        v-if="before.properties.username"
        :href="userUrl(before.properties.username)"
        target="_blank"
        class="diff-feature-header__user"
        @click.stop
      >
        👤 {{ before.properties.username }}
      </a>
    </div>
    <span class="diff-feature-header__arrow">→</span>
    <div class="diff-feature-header__side">
      <a :href="historyUrl(after)" target="_blank" class="diff-feature-header__ref" @click.stop>
        {{ featureRef(after) }}
      </a>
      <span class="diff-feature-header__meta">
        📅 {{ after.properties.created }}
      </span>
      <a
        v-if="after.properties.username"
        :href="userUrl(after.properties.username)"
        target="_blank"
        class="diff-feature-header__user"
        @click.stop
      >
        👤 {{ after.properties.username }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.diff-feature-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.25rem 5rem 0.25rem 0;
}

.diff-feature-header__side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.diff-feature-header__ref {
  font-size: 0.85em;
  color: #0066cc;
  font-weight: 600;
  text-decoration: underline;
  white-space: nowrap;
}

.diff-feature-header__meta {
  font-size: 0.75em;
  color: grey;
}

.diff-feature-header__user {
  font-size: 0.75em;
  color: #333;
  text-decoration: none;
}

.diff-feature-header__user:hover {
  text-decoration: underline;
}

.diff-feature-header__arrow {
  align-self: center;
  flex-shrink: 0;
  color: #666;
}
</style>

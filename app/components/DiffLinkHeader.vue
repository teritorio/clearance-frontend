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
  <div class="diff-link-header">
    <div v-if="before" class="part-before">
      <a :href="historyUrl(before)" target="_blank" @click.stop>{{ featureRef(before) }}</a>
      <p class="date">
        📅 {{ before.properties.created }}
      </p>
      <a
        v-if="before.properties.username"
        class="user-link"
        :href="userUrl(before.properties.username)"
        target="_blank"
        @click.stop
      >
        👤 {{ before.properties.username }}
      </a>
    </div>
    <span class="arrow">→</span>
    <div class="part-after">
      <a :href="historyUrl(after)" target="_blank" @click.stop>{{ featureRef(after) }}</a>
      <p class="date">
        📅 {{ after.properties.created }}
      </p>
      <a
        v-if="after.properties.username"
        class="user-link"
        :href="userUrl(after.properties.username)"
        target="_blank"
        @click.stop
      >
        👤 {{ after.properties.username }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.diff-link-header {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.part-before,
.part-after {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-link {
  font-size: 0.75em;
  color: #333333;
}

.date {
  font-size: 0.75em;
  color: grey;
  margin: 0;
}

.arrow {
  flex-shrink: 0;
  align-self: flex-start;
  padding-top: 0.1em;
  color: #666;
}
</style>

<script setup lang="ts">
import { compact, uniq } from 'underscore'
import LazyComponent from 'v-lazy-component'
import type { Log, ObjType } from '~/libs/types'
import { objTypeFull } from '~/libs/types'

const props = defineProps<{
  log: Log
  project: string
}>()

const logSorted = computed(() => {
  const sorted = props.log
  return sorted.matches.sort()
})

function objtypeFull(objtype: ObjType) {
  return objTypeFull(objtype)
}

function uniqHistoryIds(log: Log) {
  return uniq(
    compact([log.base, log.change])
      .map((object) => ({ objtype: object.objtype, id: object.id })),
    (object) => `${object.objtype}${object.id}`,
  )
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <template v-for="object in uniqHistoryIds(log)">
          <span v-if="object" :key="`${object.objtype}${object.id}`">
            <a
              :href="`https://www.openstreetmap.org/${objtypeFull(object.objtype)}/${object.id}/history`"
              target="_blank"
            >
              {{ object.objtype }}{{ object.id }}
            </a>
            -
            {{ log.base?.tags.name || log.change.tags.name }}
          </span>
        </template>
        <span v-if="!log.base">
          <el-tag type="success" size="small" :disable-transitions="true" class="item">
            {{ $t('logs.created') }}
          </el-tag>
        </span>
        <span v-if="log.diff_attribs && log.diff_attribs.deleted?.length">
          <el-tag
            type="danger"
            size="small"
            :disable-transitions="true"
            class="item"
          >
            {{ $t('logs.deleted') }}
          </el-tag>
        </span>
        <span>
          <el-tag
            v-for="text in [
              ...new Set(log.matches.map((m) => m.user_groups).flat()),
            ].sort()" :key="text" size="small" class="item"
          >
            📌 {{ text }}
          </el-tag>
          <el-tag v-for="match in logSorted" :key="match.selectors.join(';')" size="small" type="warning" class="item">
            <div>
              🏷️ {{ useI18nHash(match.name) }}
              <br v-if="useI18nHash(match.name) !== undefined" />
              <span v-for="selector in match.selectors" :key="selector">
                {{ selector }}
                <br />
              </span>
            </div>
          </el-tag>
        </span>
        <template v-for="object in uniqHistoryIds(log)">
          <el-button-group v-if="object" :key="`${object.objtype}${object.id}`">
            <el-button
              tag="a" size="small" :href="`https://www.openstreetmap.org/edit?editor=id&${objtypeFull(
                object.objtype,
              )}=${object.id}`" target="_blank"
            >
              OSM iD
            </el-button>

            <el-button
              tag="a" size="small"
              :href="`http://127.0.0.1:8111/load_object?objects=${object.objtype}${object.id}`"
              target="hidden_josm_target"
            >
              JOSM
            </el-button>

            <el-button
              tag="a" size="small" target="_blank" :href="`https://osmlab.github.io/osm-deep-history/#/${objtypeFull(
                object.objtype,
              )}/${object.id}`" title="OSM Deep History"
            >
              Deep H
            </el-button>

            <el-button
              tag="a"
              size="small"
              target="_blank"
              :href="`https://pewu.github.io/osm-history/#/${objtypeFull(
                object.objtype,
              )}/${object.id}`"
              title="OSM History Viewer"
            >
              OSM H
            </el-button>
          </el-button-group>
        </template>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col :span="7">
        <template v-if="log.base">
          v{{ log.base.version }} ⮞
        </template>v{{
          log.change.version
        }}
        <changesets v-if="log.changesets" :changesets="log.base ? log.changesets.slice(1) : log.changesets" />
      </el-col>
      <el-col :span="7">
        <diff
          :src="log.base"
          :dst="log.change"
          :diff="log.diff_attribs || {}"
          :exclude="[
            'objtype',
            'id',
            'tags',
            'version',
            'changeset_id',
            'created',
            'uid',
            'username',
            'deleted',
            'geom',
            'members',
          ]"
          :clear="['members', 'geom']"
        />
        <LazyComponent
          v-if="log.base?.geom || log.change.geom"
          style="border: 1px solid lightgrey"
        >
          <diff-map
            v-if="log.base || !log.change.deleted"
            :base-geom="log.base ? [log.base.geom] : undefined"
            :change-geom="!log.change.deleted ? [log.change.geom] : undefined"
          />
        </LazyComponent>
      </el-col>
      <el-col :span="10">
        <diff
          :src="log.base?.tags"
          :dst="log.change.tags"
          :diff="log.diff_tags || {}"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<script setup lang="ts">
import LazyComponent from 'v-lazy-component'
import type { Log, ObjType, ObjTypeFull, ObjectId } from '~/libs/types'
import { objTypeFull } from '~/libs/types'

const props = defineProps<{
  log: Log
  project: string
  projectUser: boolean
}>()

defineEmits<{
  (e: 'accept', objectId: ObjectId): void
}>()

const logSorted = computed(() => {
  const sorted = props.log
  return sorted.matches.sort()
})

function objtypeFull(objtype: ObjType): ObjTypeFull {
  return objTypeFull(objtype)
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>
          <a
            :href="`https://www.openstreetmap.org/${objtypeFull(log.objtype)}/${log.id}/history`"
            target="_blank"
          >
            {{ log.objtype }}{{ log.id }}
          </a>
          -
          {{ log.base?.tags.name || log.change.tags.name }}
        </span>
        <span v-if="!log.base">
          <el-tag
            type="success"
            size="small"
            :disable-transitions="true"
            class="item"
          >
            {{ $t('logs.created') }}
          </el-tag>
        </span>
        <span v-if="log.diff_attribs && log.diff_attribs.deleted">
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
            ].sort()"
            :key="text"
            size="small"
            class="item"
          >
            📌 {{ text }}
          </el-tag>
          <el-tag
            v-for="match in logSorted"
            :key="match.selectors.join(';')"
            size="small"
            type="warning"
            class="item"
          >
            <div>
              🏷️ {{ $i18nHash(match.name) }}
              <br v-if="$i18nHash(match.name) !== undefined" />
              <span v-for="selector in match.selectors" :key="selector">
                {{ selector }}
                <br />
              </span>
            </div>
          </el-tag>
        </span>
        <el-button-group>
          <el-button
            tag="a"
            size="small"
            :href="`https://www.openstreetmap.org/edit?editor=id&${objtypeFull(
              log.objtype,
            )}=${log.id}`"
            target="_blank"
          >
            OSM iD
          </el-button>

          <el-button
            tag="a"
            size="small"
            :href="`http://127.0.0.1:8111/load_object?objects=${log.objtype}${log.id}`"
            target="hidden_josm_target"
          >
            JOSM
          </el-button>

          <el-button
            tag="a"
            size="small"
            target="_blank"
            :href="`https://osmlab.github.io/osm-deep-history/#/${objtypeFull(
              log.objtype,
            )}/${log.id}`"
            title="OSM Deep History"
          >
            Deep H
          </el-button>

          <el-button
            tag="a"
            size="small"
            target="_blank"
            :href="`https://pewu.github.io/osm-history/#/${objtypeFull(
              log.objtype,
            )}/${log.id}`"
            title="OSM History Viewer"
          >
            OSM H
          </el-button>
        </el-button-group>

        <el-button-group v-if="projectUser">
          <el-button
            type="primary"
            @click="
              $emit('accept', {
                objtype: log.objtype,
                id: log.id,
                version: log.change.version,
                deleted: log.change.deleted,
              })
            "
          >
            ✓
          </el-button>
        </el-button-group>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col :span="7">
        <template v-if="log.base">
          v{{ log.base.version }} ⮞
        </template>v{{
          log.change.version
        }}
        <changesets :changesets="log.base ? log.changesets.slice(1) : log.changesets" />
      </el-col>
      <el-col :span="7">
        <diff
          :src="log.base"
          :dst="log.change"
          :diff="log.diff_attribs || {}"
          :exclude="[
            'tags',
            'version',
            'changeset_id',
            'created',
            'uid',
            'username',
            'deleted',
            'geom',
            ...(log.objtype !== 'r' ? ['members'] : []),
          ]"
          :clear="['members', 'geom']"
        />
        <LazyComponent
          v-if="log.base?.geom || log.change.geom"
          style="border: 1px solid lightgrey"
        >
          <DiffMap
            :base-geom="(log.base?.geom && [log.base?.geom]) || []"
            :change-geom="[log.change.geom]"
          />
        </LazyComponent>
      </el-col>
      <el-col :span="10">
        <Diff
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

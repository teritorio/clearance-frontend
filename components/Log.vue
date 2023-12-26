<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>
          <a
            :href="`https://www.openstreetmap.org/${objtypeFull(log.objtype)}/${
              log.id
            }/history`"
            target="_blank"
          >
            {{ log.objtype }}{{ log.id }}
          </a>
          -
          {{ log.base.tags.name || log.change.tags.name }}
        </span>
        <span>
          <el-tag
            v-if="log.diff_attribs && log.diff_attribs['deleted']"
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
            :effect="filterByUserGroups == text ? 'dark' : undefined"
          >
            📌 {{ text }}
          </el-tag>
          <el-tag
            v-for="text in [
              ...new Set(log.matches.map((m) => m.selectors).flat()),
            ].sort()"
            :key="text"
            size="small"
            type="warning"
            class="item"
            :effect="filterBySelectors == text ? 'dark' : undefined"
          >
            🏷️ {{ text }}
          </el-tag>
        </span>
        <el-button-group>
          <el-button
            tag="a"
            size="small"
            :href="`https://www.openstreetmap.org/edit?editor=id&${objtypeFull(
              log.objtype
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
              log.objtype
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
              log.objtype
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
            >✓</el-button
          >
        </el-button-group>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col :span="7">
        <template v-if="log.base">v{{ log.base['version'] }} ⮞ </template>v{{
          log.change['version']
        }}
        <Changesets
          :changesets="
            log.changesets.length === 1
              ? log.changesets.slice(0, 0)
              : log.changesets.slice(1)
          "
        />
      </el-col>
      <el-col :span="7">
        <Diff
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
          v-if="log.base.geom || log.change.geom"
          style="border: 1px solid lightgrey"
        >
          <DiffMap
            :id="log.id"
            :objtype="log.objtype"
            :base-geom="log.base.geom"
            :change-geom="log.change.geom"
          />
        </LazyComponent>
      </el-col>
      <el-col :span="10">
        <Diff
          :src="log.base.tags"
          :dst="log.change.tags"
          :diff="log.diff_tags || {}"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts">
import { PropType } from 'vue'
import LazyComponent from 'v-lazy-component'
import Diff from '~/components/Diff.vue'
import { ObjTypeFull, objTypeFull } from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  components: {
    Diff,
    LazyComponent,
  },

  props: {
    log: {
      type: Object as PropType<Log>,
      required: true,
    },
    project: {
      type: String,
      required: true,
    },
    projectUser: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    accept: (_objectId: ObjectId) => true,
  },

  data(): {
    filterByAction?: string
    filterByUserGroups?: string
    filterBySelectors?: string
  } {
    return {
      filterByAction: undefined,
      filterByUserGroups: undefined,
      filterBySelectors: undefined,
    }
  },

  methods: {
    objtypeFull(objtype: ObjType): ObjTypeFull {
      return objTypeFull(objtype)
    },
  },
})
</script>

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

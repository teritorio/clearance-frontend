<script setup lang="ts">
import type { Action, Actions, ActionType, IFeature } from '@teritorio/openstreetmap-logical-history-component'
import { groupBy, sortBy, uniq } from 'underscore'

const props = defineProps<{
  diff: Actions
  src?: IFeature['properties']
  dst?: IFeature['properties']
}>()

const EXCLUDE_KEYS = ['deleted']
const CLEAR_KEYS = ['members', 'geom']

const loChaColors = {
  new: '#52c41a',
  delete: '#FF0000',
  updateAfter: '#F2BE00',
}

function actionPriority(actionType: ActionType | null): number {
  if (!actionType) {
    return 1
  }
  return { reject: 2, accept: 0 }[actionType] ?? 1
}

function maxActionPriority(actions: Action[]): number {
  return Math.max(...actions.map((action) => actionPriority(action[1])))
}

const groupedKeys = computed((): string[][] => {
  const keys = sortBy(
    uniq(Object.keys(props.diff).filter((k) => !EXCLUDE_KEYS.includes(k))),
    (key) => (props.diff[key] ? -maxActionPriority(props.diff[key]) : 0),
  )
  return Object.values(
    groupBy(keys, (key) => props.diff[key]?.map((d) => `${d}`).join('||') ?? ''),
  )
})

function getGroupActions(groupedKey: string[]): Action[] | undefined {
  const key = groupedKey[0]
  if (!key) {
    return undefined
  }
  return props.diff[key] as Action[] | undefined
}

function backgroundClass(key: string): string | undefined {
  if (!props.diff[key]) {
    return undefined
  }
  if (!props.src || !(key in props.src)) {
    return 'attribute-new'
  }
  if (props.dst && !(key in props.dst)) {
    return 'attribute-deleted'
  }
  return 'attribute-changed'
}

function actionIcon(key: string): string | undefined {
  if (!props.diff[key]) {
    return undefined
  }
  if (!props.src || !(key in props.src)) {
    return '➕'
  }
  if (props.dst && !(key in props.dst)) {
    return '✖'
  }
  return '~'
}

function isRejected(key: string): boolean {
  const actions = props.diff[key]
  if (!actions?.[0]) {
    return false
  }
  return actions[0][1] === 'reject'
}

function getValue(obj: IFeature['properties'] | undefined, key: string): unknown {
  if (!obj) {
    return undefined
  }
  return (obj as Record<string, unknown>)[key]
}
</script>

<template>
  <div v-if="groupedKeys.length" class="attribs-diff">
    <template v-for="(groupedKey, groupIndex) in groupedKeys" :key="groupIndex">
      <table>
        <colgroup>
          <col class="col-icon" />
          <col class="col-key" />
          <col />
        </colgroup>
        <thead v-if="dst">
          <template v-for="(actions, ai) in [getGroupActions(groupedKey)]" :key="ai">
            <tr v-if="actions">
              <th colspan="3">
                <el-tag
                  v-if="actions.length === 0"
                  type="warning"
                  size="small"
                  :disable-transitions="true"
                >
                  ?
                </el-tag>
                <template v-else>
                  <template v-for="(action, actionIndex) in actions" :key="actionIndex">
                    <el-dropdown
                      v-if="action[2]"
                      :show-timeout="0"
                      class="action-tag"
                    >
                      <span class="el-dropdown-link">
                        <el-badge
                          :value="Object.keys(action[2]).length || undefined"
                          :type="action[1] === 'reject' ? 'danger' : 'info'"
                        >
                          <el-tag
                            :type="action[1] === 'reject' ? 'danger' : 'info'"
                            size="small"
                            :disable-transitions="true"
                          >
                            {{ action[0] }} ⮟
                          </el-tag>
                        </el-badge>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-for="(option, i) in action[2]" :key="i">
                            {{ i }}
                            <template v-if="Array.isArray(option)">
                              <ul>
                                <li v-for="op in option" :key="op">
                                  {{ op }}
                                </li>
                              </ul>
                            </template>
                            <template v-else>
                              {{ option }}
                            </template>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-tag
                      v-else
                      :type="action[1] === 'reject' ? 'danger' : 'info'"
                      size="small"
                      :disable-transitions="true"
                      class="action-tag"
                    >
                      {{ action[0] }}
                    </el-tag>
                  </template>
                </template>
              </th>
            </tr>
          </template>
        </thead>
        <tbody>
          <tr v-for="key in groupedKey" :key="key" :class="isRejected(key) ? undefined : 'no-changes'">
            <td class="key" :class="[backgroundClass(key)]">
              {{ actionIcon(key) }}
            </td>
            <td :class="isRejected(key) && [backgroundClass(key), 'key']">
              {{ key }}
            </td>
            <td :class="isRejected(key) && [backgroundClass(key), 'value']">
              <template v-if="CLEAR_KEYS.includes(key)">
                [...]
              </template>
              <template v-else-if="dst && src">
                <span class="diff-text-removed">{{ getValue(src, key) }}</span>
                <br />
                <span class="diff-text-added">{{ getValue(dst, key) }}</span>
              </template>
              <template v-else-if="dst">
                {{ getValue(dst, key) }}
              </template>
              <template v-else>
                {{ getValue(src, key) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.attribs-diff {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

table {
  table-layout: fixed;
  width: 100%;
}

.col-icon {
  width: 25px;
}

.col-key {
  width: 130px;
}

table,
th,
td {
  border: 1px solid #000000;
  border-collapse: collapse;
  padding: 0.15rem;
}

.diff-text-removed {
  color: v-bind('loChaColors.delete');
}

.diff-text-added {
  color: v-bind('loChaColors.new');
}

.attribute-deleted {
  background-color: color-mix(in srgb, v-bind('loChaColors.delete') 20%, #ffffff 80%);
}

.attribute-new {
  background-color: color-mix(in srgb, v-bind('loChaColors.new') 20%, #ffffff 80%);
}

.attribute-changed {
  background-color: color-mix(in srgb, v-bind('loChaColors.updateAfter') 20%, #ffffff 80%);
}

.no-changes {
  background-color: #f4f4f5;
  font-size: 70%;
}

td {
  vertical-align: top;
}

td.key {
  white-space: nowrap;
}

.action-tag {
  margin-right: 0.3em;
}
</style>

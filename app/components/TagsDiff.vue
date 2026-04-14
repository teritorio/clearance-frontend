<script setup lang="ts">
import type { Action, Actions, IFeature } from '@teritorio/openstreetmap-logical-history-component'
import type { Change } from 'diff'
import { diffChars } from 'diff'
import { groupBy, sortBy, uniq } from 'underscore'

const props = defineProps<{
  diff?: Actions
  dst?: IFeature['properties']
  src?: IFeature['properties']
}>()

const loChaColors = {
  new: '#52c41a',
  delete: '#FF0000',
  updateBefore: '#FFA479',
  updateAfter: '#F2BE00',
}

const groupedTagKeys = computed((): string[][] => {
  if (props.src && !props.dst) {
    return [Object.keys(props.src.tags)]
  }

  const keys: string[] = sortBy(
    uniq([
      ...Object.keys(props.src?.tags || {}),
      ...Object.keys(props.dst?.tags || {}),
    ]),
    (key: string) => {
      return props.diff?.[key]
        && (
          !props.src?.tags || !(key in props.src.tags)
            ? 0
            : props.dst && !props.dst.tags[key]
              ? 2
              : 1)
    },
  )

  return Object.values(
    groupBy(
      keys,
      (key) => props.diff?.[key]?.map((diff) => `${diff}`).join('||') || '',
    ),
  )
})

function actionIcon(key: string): string | undefined {
  if (props.src && !props.dst) {
    return undefined
  }

  if (!props.diff?.[key]) {
    return undefined
  }

  if (!props.src?.tags || !(key in props.src.tags)) {
    return '➕'
  }

  if (props.dst && !props.dst.tags[key]) {
    return '✖'
  }

  return '~'
}

function backgroundClass(key: string): string | undefined {
  if (props.src && !props.dst) {
    return undefined
  }

  if (!props.diff?.[key]) {
    return undefined
  }

  if (!props.src?.tags || !(key in props.src.tags)) {
    return 'attribute-new'
  }

  if (props.dst && !props.dst.tags[key]) {
    return 'attribute-deleted'
  }

  return 'attribute-changed'
}

function isRejected(key: string): boolean {
  const actions = props.diff?.[key]
  if (!actions || !actions[0]) {
    return false
  }
  return actions[0][1] === 'reject'
}

function getRowClass(key: string): string | undefined {
  if (props.src && !props.dst) {
    return 'no_changes'
  }
  return isRejected(key) ? undefined : 'no_changes'
}

function getGroupActions(groupedKey: string[]): Action[] | undefined {
  const key = groupedKey[0]
  if (!key) {
    return undefined
  }
  return props.diff?.[key] as Action[] | undefined
}

function showTextDiff(before: string, after: string): boolean {
  return diffText(before, after).length <= 2
}

function diffText(before: string, after: string): Change[] {
  return diffChars(before, after)
}
</script>

<template>
  <div class="locha-diff">
    <template
      v-for="(groupedKey, groupIndex) in groupedTagKeys"
      :key="groupIndex"
    >
      <table v-if="groupedTagKeys.length">
        <thead v-if="dst && getGroupActions(groupedKey)">
          <tr>
            <th colspan="3">
              <el-tag
                v-if="getGroupActions(groupedKey)?.length === 0"
                type="warning"
                size="small"
                :disable-transitions="true"
              >
                ?
              </el-tag>
              <template v-else>
                <el-tag
                  v-for="(action, actionIndex) in getGroupActions(groupedKey)"
                  :key="actionIndex"
                  :type="action[1] === 'reject' ? 'danger' : 'info'"
                  size="small"
                  :disable-transitions="true"
                  class="action-tag"
                >
                  {{ action[0] }}
                </el-tag>
              </template>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="key in groupedKey" :key="key">
            <tr :class="getRowClass(key)">
              <td class="key" :class="[backgroundClass(key)]">
                {{ actionIcon(key) }}
              </td>
              <td
                :class="isRejected(key) && [backgroundClass(key), 'key']"
              >
                {{ key }}
              </td>
              <td
                :class="isRejected(key) && [backgroundClass(key), 'value']"
              >
                <template v-if="diff?.[key]">
                  <span v-if="!src?.tags || !(key in src.tags)">{{ dst?.tags?.[key] }} </span>
                  <span v-else-if="!(key in (dst?.tags || {}))">{{ src.tags[key] }} </span>
                  <span
                    v-else-if="typeof src.tags[key] === 'string'
                      && showTextDiff(src.tags[key], dst?.tags?.[key] || '')
                    "
                    class="attribute-changed"
                  >
                    <span
                      v-for="(part, i) in diffText(src.tags[key], dst?.tags?.[key] || '')"
                      :key="i"
                    >
                      <span
                        :class="
                          part.removed
                            ? 'diff-text-removed'
                            : part.added
                              ? 'diff-text-added'
                              : 'diff-text-same'
                        "
                      >{{ part.value }}</span>
                    </span>
                  </span>
                  <span v-else>
                    <span class="diff-text-removed">{{ src.tags[key] }}</span>
                    <br />
                    <span class="diff-text-added">{{ dst?.tags?.[key] }}</span>
                  </span>
                </template>
                <template v-else-if="!dst && src">
                  {{ src.tags?.[key] }}
                </template>
                <template v-else>
                  {{ dst?.tags?.[key] }}
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.locha-diff {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: fit-content;
}

table {
  table-layout: fixed;
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

.diff-text-same {
  text-decoration: underline;
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

.no_changes {
  background-color: #f4f4f5;
}

td {
  vertical-align: top;
}

td.key {
  white-space: nowrap;
}

tr.no_changes {
  font-size: 70%;
}

.action-tag {
  margin-right: 0.3em;
}
</style>

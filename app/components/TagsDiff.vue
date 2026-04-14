<script setup lang="ts">
import type { Action, Actions } from '@teritorio/openstreetmap-logical-history-component'
import type { Change } from 'diff'
import { diffChars } from 'diff'
import { groupBy, sortBy, uniq } from 'underscore'

const props = defineProps<{
  srcTags?: Record<string, string>
  dstTags?: Record<string, string>
  diff: Actions
}>()

function action2priority(logAction: string | null): number {
  if (!logAction) {
    return 1
  }
  return { reject: 2, accept: 0 }[logAction] ?? 1
}

function maxActionPriority(actions: Action[]): number {
  return Math.max(...actions.map((action) => action2priority(action[1])))
}

const groupedKeys = computed((): [string, ...string[]][] => {
  const keys: string[] = sortBy(
    uniq([...Object.keys(props.srcTags || {}), ...Object.keys(props.dstTags || {})]),
    (key) => (props.diff[key] ? -maxActionPriority(props.diff[key] as Action[]) : 0),
  )

  return Object.values(
    groupBy(keys, (key) =>
      (props.diff[key] as Action[] | undefined)?.map((d: Action) => `${d}`)?.join('||') ?? ''),
  ) as [string, ...string[]][]
})

function backgroundClass(key: string): string {
  if (!props.diff[key]) {
    return ''
  }
  if (!props.srcTags || !(key in props.srcTags)) {
    return 'attribute-added'
  }
  if (!props.dstTags || !(key in props.dstTags)) {
    return 'attribute-removed'
  }
  if (props.srcTags[key] === props.dstTags[key]) {
    return ''
  }
  return 'attribute-changed'
}

function actionIcon(key: string): string {
  if (!props.diff[key]) {
    return ''
  }
  if (!props.srcTags || !(key in props.srcTags)) {
    return '➕'
  }
  if (!props.dstTags || !(key in props.dstTags)) {
    return '✖'
  }
  if (props.srcTags[key] === props.dstTags[key]) {
    return ''
  }
  return '~'
}

function isRejectGroup(groupedKey: [string, ...string[]]): boolean {
  const actions = props.diff[groupedKey[0]] as Action[] | undefined
  return actions?.[0]?.[1] === 'reject'
}

function computeDiff(before: string, after: string): { parts: Change[], isInline: boolean } {
  const parts = diffChars(before, after)
  return { parts, isInline: parts.length <= 2 }
}
</script>

<template>
  <table>
    <template v-for="(groupedKey, groupIndex) in groupedKeys" :key="groupedKey">
      <tr>
        <th colspan="4">
          <template v-if="diff[groupedKey[0]] !== undefined">
            <el-tag
              v-if="(diff[groupedKey[0]] as Action[])?.length === 0"
              type="warning"
              size="small"
              :disable-transitions="true"
              class="item"
            >
              ?
            </el-tag>

            <template
              v-for="(action, actionIndex) in (diff[groupedKey[0]] as Action[])"
              v-else
              :key="actionIndex"
            >
              <el-dropdown :show-timeout="0">
                <span class="el-dropdown-link">
                  <el-badge
                    :value="
                      (action && action[2] && Object.keys(action[2]).length)
                        || undefined
                    "
                    class="item"
                    :type="action[1] === 'reject' ? 'danger' : 'info'"
                  >
                    <el-tag
                      :type="action[1] === 'reject' ? 'danger' : 'info'"
                      size="small"
                      :disable-transitions="true"
                    >
                      {{ action[0] }}
                      <template v-if="action && action[2]">⮟</template>
                    </el-tag>
                  </el-badge>
                </span>
                <template v-if="action && action[2]" #dropdown>
                  <el-dropdown-menu v-for="(option, i) in action[2]" :key="i">
                    <el-dropdown-item class="clearfix">
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
            </template>
          </template>
          <template v-else-if="groupIndex !== 0">
&nbsp;
          </template>
        </th>
      </tr>
      <template v-for="key in groupedKey" :key="key">
        <tr
          :class="!isRejectGroup(groupedKey) && 'no_changes'"
        >
          <td class="key" :class="[backgroundClass(key)]">
            {{ actionIcon(key) }}
          </td>
          <td
            :class="isRejectGroup(groupedKey) && [backgroundClass(key), 'key']"
          >
            {{ key }}
          </td>
          <td
            :class="isRejectGroup(groupedKey) && [backgroundClass(key), 'value']"
          >
            <template v-if="diff[key]">
              <span v-if="!srcTags || !(key in srcTags)">{{ dstTags?.[key] }}</span>
              <span v-else-if="!dstTags || !(key in dstTags)">{{ srcTags[key] }}</span>
              <template v-else-if="typeof srcTags[key] === 'string'">
                <template v-for="(result, ri) in [computeDiff(srcTags[key]!, dstTags![key]!)]" :key="ri">
                  <span v-if="result.isInline" class="attribute-changed">
                    <span
                      v-for="(part, i) in result.parts"
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
                    <span class="diff-text-removed">{{ srcTags[key] }}</span>
                    <br />
                    <span class="diff-text-added">{{ dstTags?.[key] }}</span>
                  </span>
                </template>
              </template>
              <span v-else>
                <span class="diff-text-removed">{{ srcTags[key] }}</span>
                <br />
                <span class="diff-text-added">{{ dstTags?.[key] }}</span>
              </span>
            </template>
            <template v-else>
              {{ dstTags?.[key] ?? srcTags?.[key] }}
            </template>
          </td>
        </tr>
      </template>
    </template>
  </table>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}

.diff-text-removed {
  color: red;
}

.diff-text-added {
  color: rgb(0, 172, 0);
}

.diff-text-same {
  text-decoration: underline;
}

.attribute-removed {
  background: rgb(255, 230, 230);
}

.attribute-added {
  background: rgb(232, 255, 232);
}

.attribute-changed {
  background: lightgoldenrodyellow;
}

td {
  vertical-align: top;
}

td.key {
  white-space: nowrap;
}

tr.no_changes {
  font-size: 70%;
  background-color: var(--el-color-info-light-9);
}
</style>

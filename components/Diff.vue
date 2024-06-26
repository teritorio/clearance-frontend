<script lang="ts">
import type { PropType } from 'vue'
import _ from 'underscore'
import type { Change } from 'diff'
import { diffChars } from 'diff'
import type { Actions, Key } from '~/libs/types'
import { maxActionPriority } from '~/libs/types'

export default defineNuxtComponent({
  name: 'Diff',

  props: {
    src: {
      type: Object as PropType<Record<string, any>>,
      required: false,
    },
    dst: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    diff: {
      type: Object as PropType<Actions>,
      required: true,
    },
    exclude: {
      type: Array as PropType<Key[]>,
      default: () => [],
    },
    clear: {
      type: Array as PropType<Key[]>,
      default: () => [],
    },
  },

  computed: {
    groupedKeys(): string[][] {
      const keys: string[] = _.sortBy(
        _.uniq([...Object.keys(this.src || {}), ...Object.keys(this.dst)]),
        (key) => (this.diff[key] ? -maxActionPriority(this.diff[key]) : 0),
      )

      return Object.values(
        _.groupBy(keys, (key) =>
          this.diff[key]?.map((diff) => `${diff}`)?.join('||')),
      )
    },
  },

  methods: {
    backgroundClass(key: string): string {
      return (
        this.diff[key]
        && (!this.src || !(key in this.src)
          ? 'attribute-added'
          : !(key in this.dst)
              ? 'attribute-removed'
              : 'attribute-changed')
      )
    },

    actionIcon(key: string): string {
      return (
        this.diff[key]
        && (!this.src || !(key in this.src)
          ? '➕'
          : !(key in this.dst)
              ? '✖'
              : '~')
      )
    },

    showTextDiff(before: string, after: string): boolean {
      const d = this.diffText(before, after)
      return d.length <= 2
    },

    diffText(before: string, after: string): Change[] {
      return diffChars(before, after)
    },
  },
})
</script>

<template>
  <table>
    <template v-for="(groupedKey, groupIndex) in groupedKeys" :key="groupedKey">
      <tr>
        <th colspan="4">
          <template v-if="diff[groupedKey[0]] !== undefined">
            <el-tag
              v-if="diff[groupedKey[0]].length === 0"
              type="warning"
              size="small"
              :disable-transitions="true"
              class="item"
            >
              ?
            </el-tag>

            <template
              v-for="(action, actionIndex) in diff[groupedKey[0]]"
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
          v-if="!exclude.includes(key)"
          :class="
            (diff[groupedKey[0]] === undefined
              || diff[groupedKey[0]][0] === undefined
              || diff[groupedKey[0]][0][1]) !== 'reject' && 'no_changes'
          "
        >
          <td class="key" :class="[backgroundClass(key)]">
            {{ actionIcon(key) }}
          </td>
          <td
            :class="
              (diff[groupedKey[0]] === undefined
                || diff[groupedKey[0]][0] === undefined
                || diff[groupedKey[0]][0][1]) !== 'reject' || [
                backgroundClass(key),
                'key',
              ]
            "
          >
            {{ key }}
          </td>
          <td
            :class="
              (diff[groupedKey[0]] === undefined
                || diff[groupedKey[0]][0] === undefined
                || diff[groupedKey[0]][0][1]) !== 'reject' || [
                backgroundClass(key),
                'value',
              ]
            "
          >
            <template v-if="clear.includes(key)">
              [...]
            </template>
            <template v-else-if="diff[key]">
              <span v-if="!src || !(key in src)">{{ dst[key] }} </span>
              <span v-else-if="!(key in dst)">{{ src[key] }} </span>
              <span
                v-else-if="
                  typeof src[key] === 'string'
                    && showTextDiff(src[key], dst[key])
                "
                class="attribut-changed"
              >
                <span
                  v-for="(part, i) in diffText(src[key], dst[key])"
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
                <span class="diff-text-removed">{{ src[key] }}</span>
                <br />
                <span class="diff-text-added">{{ dst[key] }}</span>
              </span>
            </template>
            <template v-else>
              {{ dst[key] }}
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

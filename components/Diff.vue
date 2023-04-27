<template>
  <table>
    <tr v-for="key in keys" :key="key">
      <td :class="[backgroundClass(key), 'key']">
        {{ actionIcon(key) }}
      </td>
      <td :class="[backgroundClass(key), 'key']">
        {{ key }}
      </td>
      <td :class="[backgroundClass(key), 'value']">
        <template v-if="clear.includes(key)">[...]</template>
        <template v-else-if="diff[key]">
          <span v-if="!(key in src)">{{ dst[key] }} </span>
          <span v-else-if="!(key in dst)">{{ src[key] }} </span>
          <span
            v-else-if="
              typeof src[key] === 'string' && showTextDiff(src[key], dst[key])
            "
            class="attribut-changed"
          >
            <span v-for="(part, i) in diffText(src[key], dst[key])" :key="i">
              <span
                :class="
                  part.removed
                    ? 'diff-text-removed'
                    : part.added
                    ? 'diff-text-added'
                    : 'diff-text-same'
                "
                >{{ part.value }}</span
              >
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
      <td v-if="diff[key] !== undefined">
        <el-tag
          v-if="diff[key].length === 0"
          type="warning"
          size="small"
          :disable-transitions="true"
        >
          ?
        </el-tag>
        <el-tag
          v-for="(action, i) in diff[key]"
          v-else
          :key="i"
          :type="action[1] === 'reject' ? 'danger' : 'info'"
          size="small"
          :disable-transitions="true"
        >
          {{ action[0] }}
          <template v-if="action[2] != null">({{ action[2] }})</template>
        </el-tag>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { PropType } from 'vue'
import _ from 'underscore'
import { Change, diffChars } from 'diff'
import { Actions, Subject, Key, maxActionPriority } from '~/libs/types'

export default defineNuxtComponent({
  name: 'DiffCompinent',

  props: {
    src: {
      type: Object as PropType<Subject>,
      required: true,
    },
    dst: {
      type: Object as PropType<Subject>,
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
    keys(): string[] {
      return _.sortBy(
        [
          ...new Set([...Object.keys(this.src), ...Object.keys(this.dst)]),
        ].filter((key) => !this.exclude.includes(key)),
        (key) => (this.diff[key] ? -maxActionPriority(this.diff[key]) : 0)
      )
    },
  },

  methods: {
    backgroundClass(key: string): string {
      return (
        this.diff[key] &&
        (!(key in this.src)
          ? 'attribute-added'
          : !(key in this.dst)
          ? 'attribute-removed'
          : 'attribute-changed')
      )
    },

    actionIcon(key: string): string {
      return (
        this.diff[key] &&
        (!(key in this.src) ? '➕' : !(key in this.dst) ? '✖' : '~')
      )
    },

    showTextDiff(before: string, after: string): boolean {
      const d = this.diffText(before, after)
      return d.length <= 4
    },

    diffText(before: string, after: string): Change[] {
      return diffChars(before, after)
    },
  },
})
</script>

<style scoped>
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
</style>

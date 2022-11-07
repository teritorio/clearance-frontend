<template>
  <table>
    <tr v-for="key in keys" :key="key">
      <td>{{ key }}</td>
      <td>
        <template v-if="clear.includes(key)">[...]</template>
        <template v-else-if="diff[key]">
          <span v-if="!src[key]" style="background: lightgreen">
            + {{ dst[key] }}
          </span>
          <span v-else-if="!dst[key]" style="background: lightgoldenrodyellow">
            − {{ src[key] }}
          </span>
          <span v-else style="background: lightgoldenrodyellow">
            {{ src[key] }} ⮞ {{ dst[key] }}
          </span>
        </template>
        <template v-else>
          {{ dst[key] }}
        </template>
      </td>
      <td>
        <el-tag v-if="diff[key] === undefined" type="info">ø</el-tag>
        <el-tag v-else-if="diff[key].length === 0" type="warning">?</el-tag>
        <el-tag
          v-for="action in diff[key]"
          v-else
          :key="action[0]"
          :type="action[1] === 'reject' ? 'danger' : 'info'"
        >
          {{ action[0] }}
        </el-tag>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Actions, Subject, Key } from '~/libs/types'

export default Vue.extend({
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
      return [
        ...new Set([...Object.keys(this.src), ...Object.keys(this.dst)]),
      ].filter((key) => this.exclude.includes(key))
    },
  },

  methods: {},
})
</script>

<template>
  <el-timeline>
    <el-timeline-item
      v-for="(changeset, index) in changesets.reverse()"
      :key="index"
      :timestamp="changeset.created_at"
      placement="top"
    >
      <p>
        <span class="comment">✎ {{ changeset.tags.comment }}</span>
        <br />
        <template v-if="changeset.tags.source">
          <span class="source">📷 {{ changeset.tags.source }}</span>
          <br />
        </template>
        <span class="user">👤 {{ changeset.user }}</span>
        <template v-if="changeset.tags.created_by">
          <span class="created_by">🛠 {{ changeset.tags.created_by }}</span>
          <br />
        </template>
        <el-collapse v-model="accordion" accordion>
          <el-collapse-item :title="`⯼ #${changeset.id}`" :name="index">
            <table>
              <template
                v-for="[key, value] in Object.entries(changeset)"
                :key="key"
              >
                <tr v-if="!['tags'].includes(key)">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </template>
            </table>

            <table>
              <template
                v-for="[key, value] in Object.entries(changeset.tags)"
                :key="key"
              >
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </template>
            </table>
          </el-collapse-item>
        </el-collapse>
      </p>
    </el-timeline-item>
  </el-timeline>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { Changeset } from '~/libs/types'

export default defineNuxtComponent({
  name: 'Changesets',

  props: {
    changesets: {
      type: Array as PropType<Changeset[]>,
      required: true,
    },
  },

  data(): {
    accordion: Ref<string>
  } {
    return {
      accordion: ref('0'),
    }
  },
})
</script>

<style scoped>
ul.el-timeline {
  padding: 0;
}

:deep(.el-collapse div[role='button']) {
  height: 1.5em;
}

.comment {
  background-color: #f7f7ff;
}

.source {
  background-color: #f7fff7;
}

.user {
  background-color: #fff7f7;
}

.created_by {
  background-color: #fffff7;
}

.id {
  background-color: #f7ffff;
}
</style>

<script setup lang="ts">
import type { Changeset } from '~/libs/types'

defineProps<{
  changesets: Changeset[]
}>()

const accordion = ref<string | number | undefined>(undefined)
</script>

<template>
  <el-timeline v-if="changesets.length">
    <el-timeline-item
      v-for="(changeset, index) in changesets"
      :key="index"
      :timestamp="changeset.created_at"
      placement="top"
    >
      <p>
        <template v-if="changeset.tags?.comment">
          <span class="comment">✎ {{ changeset.tags.comment }}</span>
          <br />
        </template>
        <template v-if="changeset.tags?.source">
          <span class="source">📷 {{ changeset.tags.source }}</span>
        </template>
        <template v-if="changeset.user">
          <span class="user">
            👤&nbsp;<a
              :href="`https://www.openstreetmap.org/user/${changeset.user}`"
              target="_blank"
            >{{ changeset.user }}</a>
          </span>
        </template>
        <template v-if="changeset.tags?.created_by">
          <span class="created_by">🛠 {{ changeset.tags.created_by }}</span>
        </template>
        <a
          v-if="changeset.comments_count > 0"
          :href="`https://www.openstreetmap.org/changeset/${changeset.id}#comments`"
          target="_blank"
          class="comments-link"
        >💬</a>
        <el-collapse v-model="accordion" accordion>
          <el-collapse-item :name="index">
            <template #title>
              <a
                :href="`https://www.openstreetmap.org/changeset/${changeset.id}`"
                target="_blank"
              >{{ changeset.id }}</a>
            </template>

            <table>
              <tr
                v-for="[key, value] in Object.entries(changeset).filter(([k]) => k !== 'tags')"
                :key="key"
              >
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </table>

            <table>
              <tr
                v-for="[key, value] in Object.entries(changeset.tags ?? {})"
                :key="key"
              >
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </table>
          </el-collapse-item>
        </el-collapse>
      </p>
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped>
ul.el-timeline {
  padding: 0;
}

:deep(.el-collapse div[role='button']) {
  height: 1.5em;
}

.comment {
  background-color: #eff0ff;
  overflow-wrap: break-word;
}

.source {
  display: block;
  background-color: #ecfdf5;
  overflow-wrap: break-word;
}

.user {
  background-color: #fef2f2;
}

.created_by {
  background-color: #fefce8;
}

.comments-link {
  margin-left: 0.4em;
  text-decoration: none;
  font-size: 0.9em;
}

table td {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>

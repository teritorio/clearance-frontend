<template>
  <template v-for="(changeset, index) in changesets" :key="index">
    <p>
      <span class="comment">✎ {{ changeset.tags.comment }}</span
      ><br />
      <template v-if="changeset.tags.source">
        <span class="source">📷 {{ changeset.tags.source }}</span
        ><br />
      </template>
      <span class="user">👤 {{ changeset.user }}</span>
      <template v-if="changeset.tags.created_by">
        <span class="created_by">🛠 {{ changeset.tags.created_by }}</span
        ><br />
      </template>
      <span class="id">⯼ #{{ changeset.id }}</span>
    </p>
  </template>

  <el-collapse v-model="accordion" accordion>
    <el-collapse-item
      v-for="(changeset, index) in changesets"
      :key="index"
      :title="`Changeset details #${changeset.id}`"
      :name="index"
    >
      <table>
        <template v-for="[key, value] in Object.entries(changeset)" :key="key">
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
          <tr v-if="![].includes(key)">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </template>
      </table>
    </el-collapse-item>
  </el-collapse>
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

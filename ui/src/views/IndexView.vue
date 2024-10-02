<script setup lang="ts">
import type { Host } from '@/types'
import { onMounted, ref } from 'vue';
import { HOSTS_URL } from '@/consts';
import SmallGraph from '@/components/SmallGraph.vue'

const hosts = ref<Host[] | null>(null)

onMounted(async () => {
  const response = await fetch(HOSTS_URL)
  hosts.value = await response.json()
})
</script>

<template>
  <div v-for="h in hosts" :key="h.ID">
    <RouterLink :to="`/host/${h.ID}`">
      <SmallGraph :host="h" />
    </RouterLink>
  </div>
</template>

<style scoped></style>

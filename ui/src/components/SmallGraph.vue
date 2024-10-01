<script setup lang="ts">
import type { PropType } from 'vue';
import { defineProps, onMounted, ref, computed } from 'vue';
import { LOAD_URL } from '../consts';
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const $props = defineProps({
  host: { type: Object as PropType<Host>, required: true }
})

const loads = ref<Load[]>([])

onMounted(async () => {
  let today = new Date();
  today.setMinutes(today.getMinutes() - 10);

  const response = await fetch(
    encodeURI(
      LOAD_URL + `?since=${today.toISOString()}&host=${$props.host.Hostname}`,
    ),
  );
  //const res = await fetch(url)
  loads.value = await response.json();
  console.log(loads.value)

})

const chartData = computed(() => {
  return {
    labels: loads.value.map(x => new Date(x.Date).getMinutes()),
    datasets: [
      {
        label: 'Data One',
        backgroundColor: '#f87979',
        data: loads.value.map(x => x.One)
      }
    ]
  };
});</script>

<template>
  <div>
    <Line :data="chartData" :options="{ responsive: true }" />
  </div>
</template>

<style></style>

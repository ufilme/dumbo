<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue'
import { HOSTS_URL, LOAD_URL } from '@/consts';

import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const $route = useRoute()

const minutes = ref<number>(10)
const label = ref<number[]>([])

function computeLabel() {
  for (let i = 0; i < minutes.value; i++) {
    label.value.push(i)
  }
  label.value.reverse()
}
computeLabel()

watch(minutes, () => {
  fetchLoads()

  label.value = []
  computeLabel()
})

const host = ref<Host | undefined>(undefined)
const loads = ref<Payload[]>([])

async function fetchLoads() {
  let today = (Date.now() / 1000);
  today = Math.floor(today - minutes.value * 60);

  const response = await fetch(
    encodeURI(
      LOAD_URL + `?since=${today}&host=${host.value?.Hostname}`,
    ),
  );
  loads.value = await response.json();
}

onMounted(async () => {
  const res1 = await fetch(HOSTS_URL + `/${$route.params.id}`)
  host.value = await res1.json()

  fetchLoads()
})

const chartData = computed(() => {
  return {
    labels: label.value,
    datasets: [
      {
        label: 'Data One',
        lineTension: 0.3,
        backgroundColor: "rgba(225, 204,230, .3)",
        borderColor: "rgb(255, 128, 0)",
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: "rgb(235, 108, 0)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(235, 108, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: loads.value.map(x => x.Load.One)
      },
      {
        label: "Five",
        lineTension: 0.3,
        backgroundColor: "rgba(225, 204,230, .3)",
        borderColor: "rgb(51, 153, 255)",
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: "rgb(31, 123, 235)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: loads.value.flatMap((x) => x.Load.Five),
      },
      {
        label: "Fifteen",
        lineTension: 0.3,
        backgroundColor: "rgba(225, 204,230, .3)",
        borderColor: "rgb(255, 51, 51)",
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: "rgb(235, 21, 21)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0, 0, 0)",
        pointHoverBorderColor: "rgba(220, 220, 220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: loads.value.flatMap((x) => x.Load.Fifteen),
      }
    ]
  };
});
</script>

<template>
  <div>
    <h1>
      {{ host?.Hostname }}
    </h1>
    <div>
      <select v-model.number="minutes">
        <option>10</option>
        <option>30</option>
        <option>60</option>
        <option>120</option>
      </select>
      {{ minutes }}
    </div>
    <div>
      <Line :data="chartData" :options="{ responsive: true }" />
    </div>
  </div>
</template>

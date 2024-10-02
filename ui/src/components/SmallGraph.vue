<script setup lang="ts">
import type { PropType } from 'vue';
import { defineProps, onMounted, ref, computed } from 'vue';
import { LOAD_URL } from '@/consts';
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const $props = defineProps({
  host: { type: Object as PropType<Host>, required: true }
})

const loads = ref<Payload[]>([])
const minutes = 10

onMounted(async () => {
  let today = (Date.now() / 1000);
  today = Math.floor(today - minutes * 60);

  const response = await fetch(
    encodeURI(
      LOAD_URL + `?since=${today}&host=${$props.host.Hostname}`,
    ),
  );
  loads.value = await response.json();
})

const chartData = computed(() => {
  return {
    labels: Array.from(Array(10).keys()).map(x => x + 1).reverse(),
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
      {{ $props.host.Hostname }}
    </h1>
    <div>
      <Line :data="chartData" style="height: 400px; width: 100%;" :options="{ responsive: true }" />
    </div>
  </div>
</template>

<style></style>

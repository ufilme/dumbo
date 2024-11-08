import { ChartData, Data } from '@/types/data';
import { AreaChart } from '@tremor/react';

export const AreaChartHero = ({
    data,
    isDown,
    cpuCount,
    classname,
    showTooltip = false,
    showLegend = false,
    showXAxis = false,
    showYAxis = false,
    showGridLines = false
  } : {
    data: Data[],
    isDown: boolean | null,
    cpuCount: number,
    classname?: string,
    showTooltip?: boolean,
    showLegend?: boolean,
    showXAxis?: boolean,
    showYAxis?: boolean,
    showGridLines?: boolean
  }) => {
  const chartdata = data && data.map((d: ChartData) => {
    const date = new Date(d.Load.Date);
    return {
      date: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      cpuOne: d.Load.One,
      cpuFive: d.Load.Five,
      cpuFifteen: d.Load.Fifteen
    }
  })

  const lastLoad = chartdata?.at(-1) || { cpuOne: 0, cpuFive: 0, cpuFifteen: 0 };

  const getColor = (load: number) => {
    if (load > cpuCount) return 'red-300';
    if (load > cpuCount/2) return 'orange-300';
    if (load > cpuCount/4) return 'yellow-300';
    return 'indigo-300';
  };

  const color = isDown
    ? ['red-300']
    : [getColor(lastLoad.cpuOne), getColor(lastLoad.cpuFive), getColor(lastLoad.cpuFifteen)];

  return (
    <div style={!showTooltip ? { pointerEvents: 'none' } : {}}>
      <AreaChart
      padding={{ left: 0, right: 0 }}
      className={classname}
      showAnimation={true}
      showTooltip={showTooltip}
      data={chartdata}
      index="date"
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      showLegend={showLegend}
      showGridLines={showGridLines}
      categories={showTooltip ? ['cpuOne', 'cpuFive', 'cpuFifteen'] : ["cpuOne"]}
      colors={color}
      minValue={0}
      connectNulls={true}
      />
    </div>
  );
}
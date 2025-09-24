import { useMemo } from "react";
import { AreaChart, Icon } from "@tremor/react";
import { ExclamationTriangleIcon, MoonIcon } from "@heroicons/react/24/solid";
import { HostInfo, HostLoad } from "@/types/Host.types";

export const AreaChartHero = ({
  host,
  className,
  showTooltip = false,
  showLegend = false,
  showXAxis = false,
  showYAxis = false,
  showGridLines = false,
}: {
  host: HostInfo;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
}) => {
  const chartdata = useMemo(
    () =>
      host.Load.map((d: HostLoad) => ({
        date: d.Load.Date,
        cpuOne: d.Load.One,
        cpuFive: d.Load.Five,
        cpuFifteen: d.Load.Fifteen,
      })),
    [host.Load],
  );

  const avgLoad = useMemo(() => {
    const acc = { One: 0, Five: 0, Fifteen: 0 };
    chartdata.forEach((curr) => {
      acc.One += curr.cpuOne;
      acc.Five += curr.cpuFive;
      acc.Fifteen += curr.cpuFifteen;
    });
    const avgCount = chartdata.length || 1;
    acc.One /= avgCount;
    acc.Five /= avgCount;
    acc.Fifteen /= avgCount;
    return acc;
  }, [chartdata]);

  if (chartdata.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center ${className}`}>
        <Icon
          icon={ExclamationTriangleIcon}
          color={"red"}
          tooltip="Host is down"
        />
      </div>
    );
  }

  const lastLoad =
    chartdata.length > 0
      ? chartdata[chartdata.length - 1]
      : { cpuOne: 0, cpuFive: 0, cpuFifteen: 0 };

  const getColor = (load: number) => {
    if (load > host.CPUs) return "red-300";
    if (load > host.CPUs / 2) return "orange-300";
    if (load > host.CPUs / 4) return "yellow-300";
    return "indigo-300";
  };

  const color = host.IsDown
    ? ["red-300"]
    : [
        getColor(lastLoad.cpuOne),
        getColor(lastLoad.cpuFive),
        getColor(lastLoad.cpuFifteen),
      ];

  return (
    <div className="relative">
      {avgLoad.One === 0 && (
        <div className="absolute w-full">
          <Icon icon={MoonIcon} tooltip="Host is idle" />
        </div>
      )}
      <div style={!showTooltip ? { pointerEvents: "none" } : {}}>
        <AreaChart
          padding={{ left: 0, right: 0 }}
          className={className}
          showAnimation={true}
          showTooltip={showTooltip}
          data={chartdata}
          index="date"
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          showLegend={showLegend}
          showGridLines={showGridLines}
          categories={
            showTooltip ? ["cpuOne", "cpuFive", "cpuFifteen"] : ["cpuOne"]
          }
          colors={color}
          minValue={0}
          connectNulls={false}
        />
      </div>
    </div>
  );
};

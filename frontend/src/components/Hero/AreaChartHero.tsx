import { useMemo } from "react";
import { AreaChart, Icon } from "@tremor/react";
import { ExclamationTriangleIcon, MoonIcon } from "@heroicons/react/24/solid";
import { DOWN_AFTER_MS } from "@/hooks/useHosts";
import { formatTime } from "@/lib/utils";
import { HostInfo } from "@/types/Host.types";

type Point = {
  date: string;
  "1 min": number | null;
  "5 min": number | null;
  "15 min": number | null;
};

// Longer ranges are averaged down to about this many points to keep the
// chart readable and cheap to render.
const MAX_POINTS = 240;

// Maps samples to chart points, inserting an empty point wherever the host
// stopped reporting so the line breaks instead of bridging the downtime.
function toPoints(host: HostInfo): Point[] {
  const step = Math.ceil(host.Load.length / MAX_POINTS) || 1;
  const points: Point[] = [];
  let prev: number | undefined;
  for (let i = 0; i < host.Load.length; i += step) {
    const chunk = host.Load.slice(i, i + step).map((l) => l.Load);
    const t = new Date(chunk[0].Date).getTime();
    if (prev !== undefined && t - prev > DOWN_AFTER_MS) {
      points.push({
        date: formatTime(prev + 60 * 1000),
        "1 min": null,
        "5 min": null,
        "15 min": null,
      });
    }
    const avg = (f: (l: (typeof chunk)[number]) => number) =>
      chunk.reduce((sum, l) => sum + f(l), 0) / chunk.length;
    points.push({
      date: formatTime(t),
      "1 min": avg((l) => l.One),
      "5 min": avg((l) => l.Five),
      "15 min": avg((l) => l.Fifteen),
    });
    prev = new Date(chunk[chunk.length - 1].Date).getTime();
  }
  return points;
}

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
  const chartdata = useMemo(() => toPoints(host), [host]);

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

  const last = host.Last;
  const isIdle = host.Load.every((l) => l.Load.One === 0);

  // Hue follows the current load; the detailed chart uses one shade per
  // series so 1/5/15 min stay distinguishable.
  const getHue = (load: number) => {
    if (load > host.CPUs) return "red";
    if (load > host.CPUs / 2) return "orange";
    if (load > host.CPUs / 4) return "yellow";
    return "indigo";
  };

  const color = host.IsDown
    ? ["red-300"]
    : showTooltip
      ? [
          `${getHue(last?.One ?? 0)}-500`,
          `${getHue(last?.Five ?? 0)}-300`,
          `${getHue(last?.Fifteen ?? 0)}-200`,
        ]
      : [`${getHue(last?.One ?? 0)}-300`];

  return (
    <div className="relative">
      {isIdle && (
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
            showTooltip ? ["1 min", "5 min", "15 min"] : ["1 min"]
          }
          colors={color}
          valueFormatter={(v) => v.toFixed(2)}
          minValue={0}
          connectNulls={false}
        />
      </div>
    </div>
  );
};

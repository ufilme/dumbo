import { useMemo } from "react";
import { Tracker } from "@tremor/react";
import { HostInfo } from "@/types/Host.types";

const TICK = 90000;

export const TrackerHero = ({
  host,
  className,
  interval,
  showTooltip = false,
}: {
  host: HostInfo;
  className: string;
  interval?: number;
  showTooltip?: boolean;
}) => {
  const chartdata = useMemo(() => {
    const arr = [];
    if (host.Load.length > 0) {
      for (let pos = 0; pos < host.Load.length - 1; pos++) {
        const currentDate = new Date(host.Load[pos].Load.Date).getTime();
        const nextDate = new Date(host.Load[pos + 1].Load.Date).getTime();
        const isOperational = currentDate + TICK > nextDate;

        const entry = {
          color: isOperational ? "green" : "red",
          ...(showTooltip && {
            tooltip: isOperational ? "Operational" : "Downtime",
          }),
        };

        arr.push(entry);
      }
    } else {
      arr.push({
        color: "red",
        ...(showTooltip && { tooltip: "No data" }),
      });
    }
    return arr;
  }, [host.Load, showTooltip]);

  return (
    <div>
      <Tracker className={className} data={chartdata.slice(interval)} />
    </div>
  );
};

export default TrackerHero;

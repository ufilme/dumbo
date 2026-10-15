import { useMemo } from "react";
import { Tracker } from "@tremor/react";
import { HostInfo } from "@/types/Host.types";
import { formatTime } from "@/lib/utils";

// Clients report once a minute.
const SAMPLE_MS = 60 * 1000;

// Splits [since, until] into `buckets` slots and colours each one by how many
// samples arrived compared to how many were expected.
export const TrackerHero = ({
  host,
  since,
  until,
  buckets,
  className,
}: {
  host: HostInfo;
  since: number;
  until: number;
  buckets: number;
  className?: string;
}) => {
  const data = useMemo(() => {
    const width = (until - since) / buckets;
    const counts = new Array<number>(buckets).fill(0);
    for (const l of host.Load) {
      const i = Math.floor((new Date(l.Load.Date).getTime() - since) / width);
      if (i >= 0 && i < buckets) counts[i]++;
    }

    const expected = Math.max(1, width / SAMPLE_MS);
    return counts.map((count, i) => {
      const start = since + i * width;
      const range = `${formatTime(start)}–${formatTime(start + width)}`;
      const coverage = count / expected;
      if (coverage >= 0.5)
        return { key: i, color: "green", tooltip: `${range} · Online` };
      if (count > 0)
        return { key: i, color: "yellow", tooltip: `${range} · Unstable` };
      return { key: i, color: "red", tooltip: `${range} · Offline` };
    });
  }, [host.Load, since, until, buckets]);

  return <Tracker className={className} data={data} />;
};

export default TrackerHero;

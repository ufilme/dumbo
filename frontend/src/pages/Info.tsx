import { AreaChart, Tracker } from "@/components/Hero";
import { CodeSnippet } from "@/components/Sections/CodeSnippet/CodeSnippet";
import { Dumbo } from "@/components/Sprites";
import { useHosts } from "@/hooks/useHosts";
import { capitalize } from "@/lib/utils";
import { useDateStore } from "@/store/useDate";
import { HostInfo } from "@/types/Host.types";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  SegmentedControl,
  Separator,
  Skeleton,
} from "@radix-ui/themes";
import { Card } from "@tremor/react";
import { subDays, subHours } from "date-fns";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

function convertToTime(time: string, date: Date) {
  switch (time) {
    case "1 hour":
      return subHours(date, 1);
    case "12 hours":
      return subHours(date, 12);
    case "1 day":
      return subDays(date, 1);
  }
  return date;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1000;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${Math.trunc(value)} ${sizes[i]}`;
}

export async function clientLoader() {
  useDateStore.getState().reset(() => subHours(new Date(), 1));
}

export default function Component() {
  const { hostname } = useParams();
  const navigate = useNavigate();
  const setGetDate = useDateStore((state) => state.setGetDate);
  const { data, isLoading, isError } = useHosts("info", hostname);

  const [timeSelector, setTimeSelector] = useState("1 hour");
  const host = data.find((h: HostInfo) => h.Hostname === hostname);

  console.log("mount");

  if (isLoading) {
    return (
      <div className="h-screen p-2">
        <Skeleton>
          <Card className="h-full"></Card>
        </Skeleton>
      </div>
    );
  }

  if (isError || !host) {
    return <Skeleton></Skeleton>;
  }


  return (
    <div className="h-screen p-2 bg-gray-100">
      <Card className="h-fit flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <ChevronLeftIcon
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h1 className="px-4 text-4xl font-bold">
            {capitalize(host.Hostname)}
          </h1>
          <Dumbo fill="rgb(99 102 241)" className="h-24" />
        </div>
        <Separator size="4" />
        {/* info header */}
        <div className="w-full flex gap-4 items-center">
            <Avatar
              size="7"
              src={`/avatars/${host.Hostname.toLowerCase()}.jpeg`}
              fallback={host.Hostname[0]}
            />
            <div className="w-full flex items-center justify-center sm:text-center xl:text-left">
              <code className="text-xl font-bold">{host.Hostname.toLowerCase()}.cs.unibo.it</code>
            </div>
          </div>
          <div className="flex flex-row gap-2 w-full items-center justify-center">
            <div className="w-full flex items-center justify-center sm:text-center xl:text-left">
              <h1 className="text-xl font-bold">CPU: {host.CPUs}</h1>
            </div>
            <div className="w-full flex items-center justify-end text-left">
              <h1 className="text-xl font-bold">
                RAM: {formatBytes(host.RAM * 1024)}
              </h1>
            </div>
          </div>
        <Tracker host={host} className={"flex w-full h-6"} interval={-60} />
        <SegmentedControl.Root
          defaultValue={timeSelector}
          onValueChange={(val) => {
            setTimeSelector(val);
            setGetDate(() => convertToTime(val, new Date()));
          }}
        >
          <SegmentedControl.Item value="1 hour">1 hour</SegmentedControl.Item>
          <SegmentedControl.Item value="12 hours">
            12 hours
          </SegmentedControl.Item>
          <SegmentedControl.Item value="1 day">1 day</SegmentedControl.Item>
        </SegmentedControl.Root>
        <div className="flex flex-col h-72 align-items-center mb-6 pb-4">
          <AreaChart
            host={host}
            showTooltip={true}
            showXAxis={true}
            showYAxis={true}
            showGridLines={true}
            showLegend={true}
          />
        </div>
        <div className="w-fit mx-auto">
            <CodeSnippet hostname={host.Hostname}></CodeSnippet>
        </div>
      </Card>
      
      
    </div>
  );
}

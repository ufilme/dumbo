import { useNavigate } from "react-router";
import { capitalize } from "@/lib/utils";
import { Tracker, AreaChart } from "@/components/Hero";
import { Card, Button } from "@tremor/react";
import { HostInfo } from "@/types/Host.types";

export function HostCard({ host }: { host: HostInfo }) {
  const navigate = useNavigate();

  return (
    <Card
      className="p-2"
      decoration="top"
      decorationColor={host.IsDown ? "red" : "green"}
    >
      <AreaChart className={"h-40 py-2"} host={host} />
      <div className="p-4 grid gap-2">
        <h1 className="text-4xl font-bold relative z-10 bottom-8 mt-4 h-4">
          {capitalize(host.Hostname)}
        </h1>
        <Tracker host={host} interval={-40} className={"flex w-full h-4"} />
        <Button
          variant="secondary"
          color={host.IsDown ? "red" : "indigo"}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/${host.Hostname}`)}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}

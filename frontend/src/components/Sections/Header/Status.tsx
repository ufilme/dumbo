import { useHome } from "@/context/HomeContext";
import { Badge } from "@radix-ui/themes";
import { HostInfo } from "@/types/Host.types";

export function Status() {
  const { data, isLoading, isError } = useHome();

  if (isLoading) {
    return;
  }

  if (isError || !data) {
    return;
  }

  const status = data.length === 0;

  const hostsUp = data.filter((h: HostInfo) => !h.IsDown).length;
  const hostsDown = data.length - hostsUp;

  const loadKeys = ["One", "Five", "Fifteen"];
  const globalLoad = loadKeys.reduce(
    (acc, key) => {
      acc[key] = (
        data.reduce((sum, h: HostInfo) => {
          if (h.Load.length > 1) {
            return (
              sum +
              h.Load[h.Load.length - 1].Load[key as "One" | "Five" | "Fifteen"]
            );
          }
          return sum;
        }, 0) / data.length
      ).toFixed(2);
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-5">
        <h1 className="text-2xl font-bold col-span-2">Status</h1>
      </div>
      <div className="grid gap-2 mt-2">
        <div className="grid grid-cols-2 items-center gap-4">
          <h1 className="text-xl">API Server</h1>
          <Badge
            color={`${status ? "red" : "green"}`}
            className="flex justify-center"
          >
            {status ? "Down" : "Operational"}
          </Badge>
        </div>
        <div>
          <div className="grid grid-cols-2 items-center gap-4">
            <h1 className="text-xl">Machines</h1>
            <div className="grid grid-cols-2 gap-2 items-center">
              <Badge color="green" className="flex place-content-center">
                {hostsUp}
              </Badge>
              <Badge color="red" className="flex place-content-center">
                {hostsDown}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 items-center gap-4">
            <h1 className="text-xl">Load</h1>
            <div className="grid grid-cols-3 items-center gap-2">
              {loadKeys.map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <Badge
                    color="blue"
                    className="flex place-content-center w-full"
                  >
                    {globalLoad[key]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

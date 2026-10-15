import { ClockComponent } from "@/components/Sections/Header/Clock";
import { Status } from "@/components/Sections/Header/Status";
import { Card } from "@tremor/react";
import { Skeleton } from "@radix-ui/themes";
import { Dumbo } from "@/components/Sprites";
import { HostInfo } from "@/types/Host.types";

export function Header({
  data,
  isLoading,
  isError,
  isStale,
  updatedAt,
}: {
  data: HostInfo[];
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
  updatedAt: number;
}) {
  if (isLoading) {
    return (
      <div className="p-2 h-48 lg:h-[30svh]">
        <Skeleton>
          <Card className="h-full"></Card>
        </Skeleton>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 xl:gap-24 p-2 py-4">
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Dumbo
          fill="rgb(99 102 241)"
          className="h-28 sm:h-40 lg:h-[26svh] lg:max-h-56 shrink-0"
        />
        <div className="grid">
          <h1 className="text-3xl sm:text-4xl font-bold ">DumBO</h1>
          <h1 className="text-lg sm:text-2xl lg:text-3xl">
            <em className="text-indigo-500">D</em>isi{" "}
            <em className="text-indigo-500">U</em>sage{" "}
            <em className="text-indigo-500">M</em>onitor{" "}
            <em className="text-indigo-500">BO</em>logna
          </h1>
        </div>
      </div>
      {!isError && (
        <div className="w-full sm:w-auto">
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-evenly">
              <ClockComponent />
              <Status data={data} isStale={isStale} updatedAt={updatedAt} />
            </div>
            {/*<div>
              <Callout color="amber" title="AVVISO DI CHIUSURA">
                Il laboratorio Ercolani resterà chiuso per il mese di agosto dal
                04/08/25 al 29/08/2025 (estremi inclusi).{" "}
                <Link
                  href="https://disi.unibo.it/it/dipartimento/sedi-e-spazi/laboratori-didattici/laboratori-ercolani"
                  target="_blank"
                >
                  More info
                </Link>
              </Callout>
            </div>*/}
          </Card>
        </div>
      )}
    </div>
  );
}

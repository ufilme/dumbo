import { useHome } from "@/context/HomeContext";
import { ClockComponent } from "@/components/Sections/Header/Clock";
import { Status } from "@/components/Sections/Header/Status";
import { Card } from "@tremor/react";
import { Skeleton } from "@radix-ui/themes";
import { Dumbo } from "@/components/Sprites";

export function Header() {
  const { isLoading, isError } = useHome();

  if (isLoading) {
    return (
      <div className="p-2 h-full">
        <Skeleton>
          <Card className="h-full"></Card>
        </Skeleton>
      </div>
    );
  }

  if (isError) {
    return;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-2">
      <div className="grid grid-cols-5">
        <div className="col-span-2 grid place-items-center">
          <Dumbo fill="rgb(99 102 241)" className="h-[30svh]" />
        </div>
        <div className="col-span-3 grid self-center justify-self-start">
          <h1 className="text-4xl font-bold ">DumBO</h1>
          <h1 className="text-3xl">
            <em>D</em>isi <em>U</em>sage <em>M</em>onitor <em>BO</em>logna
          </h1>
        </div>
      </div>
      <div className="grid place-items-center">
        <Card className="flex flex-col gap-4 ">
          <div className="flex gap-4 justify-evenly">
            <ClockComponent />
            <Status />
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
    </div>
  );
}

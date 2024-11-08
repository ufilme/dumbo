"use client"
import { Button, Skeleton } from "@radix-ui/themes";
import { AreaChartHero } from "./AreaChartHero"
import { TrackerHero } from "./TrackerHero"
import { Card } from '@tremor/react';
import './theme.config.css'
import Link from "next/link";
import { MachineData } from "@/types/machine";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const MachineInfo = ({
        machine,
        isLoading
    } : {
        machine: MachineData,
        isLoading: boolean
    }) => {
    return (
        <div className="grid gap-2 p-2">
            <Skeleton loading={isLoading}>
                <Card
                className="mx-auto grid p-0"
                decoration="top"
                decorationColor={machine.isDown ? "red" : "green"}
                >
                    <AreaChartHero classname={"h-40"} data={machine.data} isDown={machine.isDown} cpuCount={machine ? machine.CPUs : 0}/>
                    <div className="p-4 grid gap-2">
                        <h1 className="text-4xl font-bold relative z-10 bottom-8 mt-4 h-4">{capitalizeFirstLetter(machine.Hostname)}</h1>
                        <TrackerHero data={machine.data} interval={-40} classname={"flex w-full h-4"} />
                        <Link href={`/${machine.Hostname}`}>
                            <Button variant="soft" color={machine.isDown ? "red" : "indigo"} className="!w-[100%]">Details</Button>
                        </Link>
                    </div>
                </Card>
            </Skeleton>
        </div>
    )
}
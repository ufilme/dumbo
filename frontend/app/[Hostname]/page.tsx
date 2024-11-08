"use client"
import { AreaChartHero } from "@/components/AreaChartHero";
import Logo from "@/components/Logo";
import { TrackerHero } from "@/components/TrackerHero";
import { Machine, MachineData } from "@/types/machine";
import { Avatar, Card, SegmentedControl, Separator, Skeleton } from "@radix-ui/themes";
import { RiArrowLeftSLine } from '@remixicon/react'
import { useEffect, useState } from "react";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`)
  const data = await res.json()

  return data
}

async function getMachineData(host: string, time: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/load?host=${host}&since=${time}`)
  const data = await res.json()

  return data
}

async function getAllData(machine: Machine, time: number) : Promise<MachineData> {
  const data = await getMachineData(machine.Hostname, time)
  const oneMinuteAgo = new Date(Date.now() - 90000);
  const isDown = new Date(data[data.length - 1].Load.Date) <= oneMinuteAgo;
  return {
    ...machine,
    data,
    isDown
  }
}

function convertToTime(time: string) {
  let offset = 0
  switch (time) {
    case '1 hour':
      offset = 3600
      break
    case '12 hours':
      offset = 43200
      break
    case '1 day':
      offset = 86400
      break
  }
  return Math.floor(Date.now() / 1000) - offset;
}

export default function Page({ params }: { params: { Hostname: string } }) {
  const [machine, setMachine] = useState<MachineData | null>(null)
  const [time, setTime] = useState('1 hour')

  useEffect(() => {
    async function fetchData() {
        const data = await getData()
        const machine = await getAllData(data.find((machine: Machine) => machine.Hostname === params.Hostname), convertToTime(time))
        setMachine(machine)
    }
    fetchData()
  }, [params.Hostname, time])

  return (
    <div className="min-h-screen p-4">
      <Card className="p-4">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 justify-items-start items-center p-4">
            <RiArrowLeftSLine size={48} className="cursor-pointer" onClick={() => window.history.back()} />
            <Logo className="justify-self-end mr-2" fill="rgb(99 102 241)" width={75} height={75}/>
          </div>
          <Separator size="4" />
          <div className="grid grid-cols-5 p-8">
              <div className="col-span-1">
              <Skeleton loading={!machine}>
                <Avatar size="9" src={`/avatars/${machine && machine.Hostname.toLowerCase()}.jpeg`} fallback={params.Hostname[0]}/>
              </Skeleton>
              </div>
              <div className="col-span-4 grid items-center justify-self-start justify-items-end">
                <Skeleton loading={!machine}>
                  <h1 className="text-8xl font-bold">{machine && capitalizeFirstLetter(machine.Hostname)}</h1>
                  <h1 className="text-2xl font-bold">CPU: {machine && machine.CPUs}</h1>
                </Skeleton>
              </div>
          </div>
        </div>
      </Card>
      <Skeleton loading={!machine}>
        <Card className="p-4 mt-4">
            <TrackerHero data={machine ? machine.data : []} interval={-60} classname={"flex w-full h-6"} />
        </Card>
      </Skeleton>
      <Skeleton loading={!machine}>
        <Card className="p-4 mt-4">
            <SegmentedControl.Root defaultValue="1 hour" onValueChange={(val) => {
              setTime(val)
            }}>
              <SegmentedControl.Item value="1 hour">1 hour</SegmentedControl.Item>
              <SegmentedControl.Item value="12 hours">12 hours</SegmentedControl.Item>
              <SegmentedControl.Item value="1 day">1 day</SegmentedControl.Item>
            </SegmentedControl.Root>
            <AreaChartHero
              data={machine ? machine.data : []}
              isDown={machine ? machine.isDown : true}
              cpuCount={machine ? machine.CPUs : 0}
              classname="h-72"
              showTooltip={true}
              showXAxis={true}
              showYAxis={true}
              showGridLines={true}
              showLegend={true}
            />
        </Card>
      </Skeleton>
    </div>
  )
  }
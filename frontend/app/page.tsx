"use client"
import { MachineInfo } from "@/components/MachineInfo";
import Logo from "@/components/Logo";
import { Badge, Card, Link, Skeleton } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Machine, MachineData } from "@/types/machine";
import { BrowserView, MobileView } from 'react-device-detect';
import Clock from 'react-clock';
import './global.css';

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`)
  const data = await res.json()

  return data
}

async function getAllData(machine: Machine) : Promise<MachineData> {
  const data = await getMachineData(machine.Hostname)
  const oneMinuteAgo = new Date(Date.now() - 90000);
  const isDown = new Date(data[data.length - 1].Load.Date) <= oneMinuteAgo;
  return {
    ...machine,
    data,
    isDown
  }
}

async function getMachineData(hostname: string) {
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/load?host=${hostname}&since=${oneHourAgo}`)
  const data = await res.json()

  return data
}

async function checkStatus() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}`)

  return res.status !== 200
}

function saveToLocalStorage(data: MachineData[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('uniboServers', JSON.stringify({date: new Date(), data: data}));
  }
}

const Home = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [uniboServers, setUniboServers] = useState<(MachineData)[]>([])
  const [apiServerStatus, setApiServerStatus] = useState<boolean>(false)
  const [datetime, setDatetime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDatetime(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  useEffect(() => {
    async function fetchData(refresh: boolean = false) : Promise<void> {
      let storedData : MachineData[] | string | null = null;

      if (typeof window !== 'undefined' && !refresh) {
        storedData = localStorage.getItem('uniboServers');
        if (storedData !== null) {
          if (storedData.length > 0) {
            const data = JSON.parse(storedData)
            if (new Date(data.date) < new Date(Date.now() - 90000)) {
              storedData = null
            } else {
              setUniboServers(data.data);
              setIsLoading(false);
            }
          }
        }
      }

      if (storedData === null || refresh) {
        const data = await getData()

        if (!refresh) setUniboServers(data)

        const machines = await Promise.all(
          data.map((machine: Machine) => 
            getAllData(machine)
          )
        )

        setIsLoading(false)
        setUniboServers(machines)
        saveToLocalStorage(machines)
      }
    }

    async function checkApiStatus() {
      const status = await checkStatus()
      setApiServerStatus(status)
    }

    fetchData()
    checkApiStatus()

    const interval = setInterval(() => {
      fetchData(true)
      checkApiStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <BrowserView>
        <div className="grid gap-2">
          <div className="grid grid-cols-2">
            <div className="grid grid-cols-2">
              <Logo className="place-self-center" fill="rgb(99 102 241)" width={250} height={250}/>
              <div className="grid self-center">
                <h1 className="text-4xl font-bold ">DumBo</h1>
                <h1 className="text-3xl"><em>D</em>isi <em>U</em>sage <em>M</em>onitor <em>BO</em>logna</h1>
              </div>
            </div>
            <div className="grid place-self-center h-full w-full p-12 px-24">
              <Card className="grid">
                <div className="p-4">
                  <div className="grid grid-cols-2">
                    <div className="grid place-items-center gap-2">
                      <div>
                        <Clock 
                          hourHandLength={60}
                          hourHandOppositeLength={20}
                          hourHandWidth={8}
                          hourMarksLength={20}
                          hourMarksWidth={8}
                          minuteHandLength={90}
                          minuteHandOppositeLength={20}
                          minuteHandWidth={6}
                          minuteMarksWidth={3}
                          secondHandLength={75}
                          secondHandOppositeLength={25}
                          secondHandWidth={3}
                          value={datetime} />
                      </div>
                      <div>
                        <h1 suppressHydrationWarning>{datetime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</h1>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-5">
                        <h1 className="text-2xl font-bold col-span-2">Status</h1>
                      </div>
                      <div className="grid gap-2 mt-2">
                        <div className="grid grid-cols-2 items-center gap-4">
                          <h1 className="text-xl">API Server</h1>
                          <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                            <Badge color={`${apiServerStatus ? "red" : "green"}`}>{apiServerStatus ? "Down" : "Operational"}</Badge>
                          </Skeleton>
                        </div>
                        <div>
                          <div className="grid grid-cols-2 items-center gap-4">
                            <h1 className="text-xl">Machines</h1>
                            <div className="grid grid-cols-2 items-center">
                              <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                                <Badge color="green" className="flex place-content-center">{uniboServers.filter(machine => !machine.isDown).length}</Badge> 
                              </Skeleton>
                              <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                                <Badge color="red" className="flex place-content-center">{uniboServers.filter(machine => machine.isDown).length}</Badge>
                              </Skeleton>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="grid grid-cols-2 items-center gap-4">
                            <h1 className="text-xl">Load</h1>
                            <div className="grid grid-cols-3 items-center">
                              <div className="flex flex-col items-center">
                                <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                                  <Badge color="blue" className="flex place-content-center w-full">
                                    {(
                                    uniboServers.reduce((acc, machine) => {
                                      if (machine.data) {
                                        return acc + machine.data[machine.data.length - 1].Load.One;
                                      }
                                      return acc;
                                    }, 0) / uniboServers.length
                                    ).toFixed(2)}
                                  </Badge>
                                </Skeleton>
                              </div>
                              <div className="flex flex-col items-center">
                                <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                                  <Badge color="blue" className="flex place-content-center w-full">
                                    {(
                                    uniboServers.reduce((acc, machine) => {
                                      if (machine.data) {
                                        return acc + machine.data[machine.data.length - 1].Load.Five;
                                      }
                                      return acc;
                                    }, 0) / uniboServers.length
                                    ).toFixed(2)}
                                  </Badge>
                                </Skeleton>
                              </div>
                              <div className="flex flex-col items-center">
                                <Skeleton loading={uniboServers.length !== 0 ? false : true}>
                                  <Badge color="blue" className="flex place-content-center w-full">
                                    {(
                                    uniboServers.reduce((acc, machine) => {
                                      if (machine.data) {
                                        return acc + machine.data[machine.data.length - 1].Load.Fifteen;
                                      }
                                      return acc;
                                    }, 0) / uniboServers.length
                                    ).toFixed(2)}
                                  </Badge>
                                </Skeleton>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="grid place-content-end px-4">
                <h1 className="text-xs">powered by <Link target="_blank" href="https://students.cs.unibo.it/">ADM</Link></h1>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5">
            { 
              uniboServers.length !== 0 &&
              uniboServers.sort((a, b) => a.Hostname.localeCompare(b.Hostname)).map((machine, i) => (
                <MachineInfo key={i} machine={machine} isLoading={isLoading}/>
                )
              ) ||  Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={i} loading={uniboServers.length !== 0 ? false : true}>
                  <Card className="h-72 m-2"></Card>
                </Skeleton>
              ))
            }
          </div>
        </div>
      </BrowserView>
      <MobileView>
        <div className="grid items-end min-h-screen">
          <div className="grid gap-2">
            <div className="grid place-items-center animate-bounce">
              <Logo className="" fill="rgb(99 102 241)" width={250} height={250}/>
            </div>
            <div className="grid place-items-center">
              <h1 className="text-4xl font-bold">DumBo</h1>
              <h1 className="text-2xl"><em>D</em>isi <em>U</em>sage <em>M</em>onitor <em>BO</em>logna</h1>
            </div>
          </div>
          <div className="grid place-items-center h-full">
            <h1>Currently not available on mobile :(</h1>
          </div>
        </div>
      </MobileView>
    </div>
  );
}

export default Home;
interface Host {
  ID: number,
  Hostname: string,
  CPUs: number
}

interface Load {
  Date: Date,
  One: number,
  Five: number,
  Fifteen: number,
}

interface Payload {
  Host: Host,
  Load: Load,
}

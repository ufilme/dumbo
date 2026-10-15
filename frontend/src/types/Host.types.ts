export interface HostLoadData {
  Date: string;
  One: number;
  Five: number;
  Fifteen: number;
  RamUsed: number; // KiB
  ConnectedUsers: number;
}

export interface HostLoad {
  HostID: number;
  Load: HostLoadData;
}

export interface Host {
  ID: number;
  Hostname: string;
  CPUs: number;
  RAM: number; // KiB
  Uptime: number; // seconds, as of the last report
}

export interface HostInfo extends Host {
  Load: HostLoad[];
  Last?: HostLoadData;
  IsDown: boolean;
}

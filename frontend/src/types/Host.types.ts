interface HostLoadData {
  Date: string;
  One: number;
  Five: number;
  Fifteen: number;
  RamUsed: number;
  ConnectedUsers: number;
}

export interface HostLoad {
  HostID: number;
  Load: HostLoadData;
}

export interface HostInfo {
  ID: number;
  Hostname: string;
  CPUs: number;
  RAM: number;
  Uptime: number;
  Load: HostLoad[];
  IsDown: boolean;
}

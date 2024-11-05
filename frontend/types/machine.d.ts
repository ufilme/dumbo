export interface Machine {
    ID: number;
    Hostname: string;
    CPUs: number;
}
  
export interface MachineData extends Machine {
    data: [{
        Load: {
            Date: string;
            One: number;
            Five: number;
            Fifteen: number;
        }
    }]
    isDown: boolean;
}
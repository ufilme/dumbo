import { subMinutes } from "date-fns";
import { create } from "zustand";

interface DateState {
  currentDate: Date;
  getDate: () => Date; // user-supplied function
  start: () => void;
  stop: () => void;
  reset: (fn: () => Date) => void;
  setGetDate: (fn: () => Date) => void;
}

let intervalId: NodeJS.Timeout | null = null;

export const useDateStore = create<DateState>((set, get) => ({
  currentDate: subMinutes(new Date(), 10),
  getDate: () => subMinutes(new Date(), 10),
  start: () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      set({ currentDate: get().getDate() });
    }, 10 * 1000);
  },
  stop: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },
  reset: (fn: () => Date) => {
    set({ getDate: fn, currentDate: fn() });
  },
  setGetDate: (fn: () => Date) => {
    set({ getDate: fn, currentDate: fn() });
  },
}));

useDateStore.getState().start();

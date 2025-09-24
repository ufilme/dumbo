import { createContext, useContext } from "react";
import { HostInfo } from "@/types/Host.types";

type HomeContextType = {
  data: HostInfo[];
  isLoading: boolean;
  isError: boolean;
};

export const HomeContext = createContext<HomeContextType | undefined>(
  undefined,
);

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHomeTime must be used within a HomeTimeProvider");
  }
  return context;
};

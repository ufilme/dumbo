import { useHosts } from "@/hooks/useHosts";
import { HomeContext } from ".";

export const HomeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data, isLoading, isError } = useHosts("home");

  return (
    <HomeContext.Provider
      value={{
        data,
        isLoading,
        isError,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

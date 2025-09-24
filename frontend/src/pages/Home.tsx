import { subMinutes } from "date-fns";
import { useDateStore } from "@/store/useDate";
import { HomeProvider } from "@/context";
import { Header, HostList } from "@/components/Sections";

export async function clientLoader() {
  useDateStore.getState().reset(() => subMinutes(new Date(), 10));
}

export default function Component() {
  return (
    <HomeProvider>
      <div className="h-screen p-2">
        <Header />
        <HostList />
      </div>
    </HomeProvider>
  );
}

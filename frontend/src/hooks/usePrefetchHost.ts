import { useQueryClient } from "@tanstack/react-query";
import { loadQuery } from "@/hooks/useHosts";
import { INFO_DEFAULT_RANGE_MS } from "@/lib/utils";

// Starts loading a host's detail data as soon as the user shows intent
// (hover, focus or touch), so the detail page usually opens fully loaded.
export function usePrefetchHost(hostname: string) {
  const queryClient = useQueryClient();
  const prefetch = () =>
    queryClient.prefetchQuery(loadQuery(INFO_DEFAULT_RANGE_MS, hostname));

  return {
    onPointerEnter: prefetch,
    onTouchStart: prefetch,
    onFocus: prefetch,
  };
}

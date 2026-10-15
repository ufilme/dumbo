export async function fetchJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.append(key, String(value));
  }

  const query = search.toString();
  const res = await fetch(query ? `${path}?${query}` : path, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `${res.status} ${res.statusText}`);
  }

  return res.json();
}

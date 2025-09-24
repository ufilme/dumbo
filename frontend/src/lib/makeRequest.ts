export async function makeRequest<T, R>(opt: {
  method: string;
  path: string;
  headers: Headers;
  since: number;
  hostname?: string;
  body?: string;
  modifyData?: (data: T) => R;
}) {
  const params = new URLSearchParams();

  if (opt.since) {
    params.append("since", opt.since.toString());
  }
  if (opt.hostname) {
    params.append("host", opt.hostname);
  }

  const res = await fetch(`${opt.path}?${params.toString()}`, {
    method: opt.method,
    headers: opt.headers,
    ...(opt.body && {
      body: JSON.stringify(opt.body),
    }),
  });

  if (res.status !== 200) {
    const error = await res.text();
    throw new Error(error);
  }

  const data: T = await res.json();

  if (opt.modifyData) {
    return opt.modifyData(data);
  }

  return data;
}

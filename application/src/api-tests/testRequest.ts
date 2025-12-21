export const makeTestReq = (url: string, init?: RequestInit & { cookies?: Record<string, string> }) => {
  const req = new Request(url, init);

  // next/server NextRequest provides cookies.get(). We shim minimally for our handlers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).cookies = {
    get: (name: string) => {
      const value = init?.cookies?.[name];
      return value ? { value } : undefined;
    },
  };

  return req;
};

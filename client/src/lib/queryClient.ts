import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | RequestInit,
  data?: any,
): Promise<any> {
  // Handle both calling conventions:
  // 1. apiRequest(url, options)
  // 2. apiRequest(method, url, data)
  
  let method: string = 'GET';
  let url: string;
  let options: RequestInit = {};
  
  if (typeof urlOrOptions === 'string') {
    // Second format: apiRequest(method, url, data)
    method = methodOrUrl;
    url = urlOrOptions;
    options = {
      method,
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    };
  } else {
    // First format: apiRequest(url, options)
    url = methodOrUrl;
    options = urlOrOptions || {};
  }
  
  console.log(`API Request: ${method} ${url}`, data || 'No data');
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...options?.headers,
  };
  
  // Check if data is FormData
  const isFormData = options?.body instanceof FormData;
  
  // Only set Content-Type for non-FormData requests
  if (options?.body && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Important: This ensures cookies are included in the request
    cache: "no-cache", // Prevent caching issues
  });

  await throwIfResNotOk(res);
  // Parse as JSON if possible
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json().catch(() => res);
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: "no-cache", // Prevent caching issues
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`401 Unauthorized for ${queryKey[0]}, returning null as configured`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

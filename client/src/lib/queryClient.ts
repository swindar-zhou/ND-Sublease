import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };
  
  // Don't set Content-Type for FormData - let browser handle it
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Handle expired/invalid tokens
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
    window.location.reload();
    throw new Error("Authentication expired");
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // Redirect to force re-authentication
      window.location.reload();
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

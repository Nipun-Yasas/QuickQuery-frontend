import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApi() {
  const { getToken } = useAuth();

  const authFetch = async (
    path: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getToken();
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    };

    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  return { authFetch, API_URL };
}

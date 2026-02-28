import { signOut } from 'next-auth/react';

export const authFetcher = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      signOut({ callbackUrl: '/login' });
    }
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "An error occurred while fetching data.");
  }

  return data;
};
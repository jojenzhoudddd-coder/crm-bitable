'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/utils';
import type { Quote } from '@/types';

export function useQuotes(status: string = '') {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/quotes?${params.toString()}`,
    (url: string) => apiFetch<{ items: Quote[]; total: number }>(url),
    { revalidateOnFocus: false }
  );

  return {
    quotes: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

export function useQuote(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/quotes/${id}` : null,
    (url: string) => apiFetch<Quote>(url)
  );

  return { quote: data || null, isLoading, error, mutate };
}

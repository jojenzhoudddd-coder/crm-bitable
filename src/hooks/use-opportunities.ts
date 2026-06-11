'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/utils';
import type { Opportunity } from '@/types';

export function useOpportunities(stage: string = '', keyword: string = '') {
  const params = new URLSearchParams();
  if (stage) params.set('stage', stage);
  if (keyword) params.set('keyword', keyword);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/opportunities?${params.toString()}`,
    (url: string) => apiFetch<{ items: Opportunity[]; total: number }>(url),
    { revalidateOnFocus: false }
  );

  return {
    opportunities: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

export function useOpportunity(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/opportunities/${id}` : null,
    (url: string) => apiFetch<Opportunity>(url)
  );

  return { opportunity: data || null, isLoading, error, mutate };
}

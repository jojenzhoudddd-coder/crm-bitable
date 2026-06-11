'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/utils';
import type { Product, PaginatedResponse } from '@/types';

const fetcher = (url: string) => apiFetch<PaginatedResponse<Product>>(url);

export function useProducts(keyword: string = '', category: string = '') {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (category) params.set('category', category);
  params.set('pageSize', '50');

  const { data, error, isLoading, mutate } = useSWR(
    `/api/products?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    products: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

export function useProductCategories() {
  const { data, isLoading } = useSWR(
    '/api/products/categories',
    (url: string) =>
      apiFetch<Array<{ name: string; subCategories: string[] }>>(url),
    { revalidateOnFocus: false }
  );

  return { categories: data || [], isLoading };
}

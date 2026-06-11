'use client';

import { useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/utils';
import { calcItemPrice, calcSummary } from '@/lib/price';
import type { ConfigItem, ConfigSummary } from '@/types';

export function useConfigItems(opportunityId: string) {
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { data, error, isLoading, mutate } = useSWR(
    opportunityId ? `/api/config-items?opportunityId=${opportunityId}` : null,
    (url: string) => apiFetch<ConfigItem[]>(url)
  );

  const items = data || [];

  const summary: ConfigSummary = useMemo(() => {
    const s = calcSummary(
      items.map((i) => ({
        standardPrice: i.standardPrice,
        quantity: i.quantity,
        discountRate: i.discountRate,
      }))
    );
    return {
      totalItems: s.totalItems,
      totalQuantity: s.totalQuantity,
      totalAmount: s.itemSubtotal,
    };
  }, [items]);

  // 添加配置项
  const addItem = useCallback(
    async (productId: string, quantity = 1, discountRate = 1) => {
      await apiFetch('/api/config-items', {
        method: 'POST',
        body: JSON.stringify({ opportunityId, productId, quantity, discountRate }),
      });
      mutate();
    },
    [opportunityId, mutate]
  );

  // 批量添加
  const addItems = useCallback(
    async (
      productItems: Array<{
        productId: string;
        quantity?: number;
        discountRate?: number;
      }>
    ) => {
      await apiFetch('/api/config-items/batch', {
        method: 'POST',
        body: JSON.stringify({ opportunityId, items: productItems }),
      });
      mutate();
    },
    [opportunityId, mutate]
  );

  // 更新配置项（防抖 800ms）
  const updateItem = useCallback(
    (
      itemId: string,
      fields: { quantity?: number; discountRate?: number; note?: string }
    ) => {
      // 清除旧定时器
      const existing = debounceTimers.current.get(itemId);
      if (existing) clearTimeout(existing);

      // 立即乐观更新前端
      mutate(
        (current) => {
          if (!current) return current;
          return current.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, ...fields };
            const { unitPrice, subtotal } = calcItemPrice({
              standardPrice: updated.standardPrice,
              quantity: updated.quantity,
              discountRate: updated.discountRate,
            });
            return { ...updated, unitPrice, subtotal };
          });
        },
        { revalidate: false }
      );

      // 防抖保存到后端
      const timer = setTimeout(async () => {
        debounceTimers.current.delete(itemId);
        try {
          await apiFetch(`/api/config-items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(fields),
          });
        } catch {
          mutate(); // 失败时重新获取
        }
      }, 800);

      debounceTimers.current.set(itemId, timer);
    },
    [mutate]
  );

  // 删除配置项
  const removeItem = useCallback(
    async (itemId: string) => {
      mutate(
        (current) => (current ? current.filter((i) => i.id !== itemId) : []),
        { revalidate: false }
      );
      await apiFetch(`/api/config-items/${itemId}`, { method: 'DELETE' });
      mutate();
    },
    [mutate]
  );

  return {
    items,
    summary,
    isLoading,
    error,
    addItem,
    addItems,
    updateItem,
    removeItem,
    refresh: mutate,
  };
}

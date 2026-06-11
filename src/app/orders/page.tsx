'use client';

import { useState } from 'react';
import { Table, Card, Select, Space, Typography, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import { ORDER_STATUSES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');

  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const { data, isLoading } = useSWR(
    `/api/orders?${params.toString()}`,
    (url: string) => apiFetch<{ items: Order[]; total: number }>(url),
    { revalidateOnFocus: false }
  );

  const orders = data?.items || [];

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'number',
      width: 160,
      render: (num: string, record: Order) => (
        <a onClick={() => router.push(`/orders/${record.id}`)}>{num || record.name}</a>
      ),
    },
    {
      title: '订单名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 150,
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      width: 130,
      render: (v: number) => (
        <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (s: string) => <StatusTag status={s} colorMap={ORDER_STATUS_COLORS} />,
    },
    {
      title: '负责人',
      dataIndex: 'ownerName',
      width: 100,
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Order) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/orders/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            正式订单
          </Typography.Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="订单状态"
            value={status || undefined}
            onChange={(v) => setStatus(v || '')}
            allowClear
            style={{ width: 150 }}
            options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </Space>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ total: data?.total, pageSize: 50 }}
          size="middle"
        />
      </Card>
    </AppLayout>
  );
}

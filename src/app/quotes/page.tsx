'use client';

import { useState } from 'react';
import { Table, Card, Select, Space, Typography, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import { useQuotes } from '@/hooks/use-quotes';
import { QUOTE_STATUS_COLORS } from '@/lib/constants';
import { QUOTE_STATUSES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import type { Quote } from '@/types';

export default function QuotesPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const { quotes, total, isLoading } = useQuotes(status);

  const columns = [
    {
      title: '报价单号',
      dataIndex: 'number',
      width: 160,
      render: (num: string, record: Quote) => (
        <a onClick={() => router.push(`/quotes/${record.id}`)}>{num || record.name}</a>
      ),
    },
    {
      title: '报价名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 150,
    },
    {
      title: '报价金额',
      dataIndex: 'totalAmount',
      width: 130,
      render: (v: number) => (
        <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (s: string) => <StatusTag status={s} colorMap={QUOTE_STATUS_COLORS} />,
    },
    {
      title: '负责人',
      dataIndex: 'ownerName',
      width: 100,
    },
    {
      title: '查看次数',
      dataIndex: 'viewCount',
      width: 90,
      render: (v: number) => v || 0,
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Quote) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/quotes/${record.id}`)}
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
            报价订单
          </Typography.Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="报价状态"
            value={status || undefined}
            onChange={(v) => setStatus(v || '')}
            allowClear
            style={{ width: 150 }}
            options={QUOTE_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </Space>

        <Table
          dataSource={quotes}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ total, pageSize: 50 }}
          size="middle"
        />
      </Card>
    </AppLayout>
  );
}

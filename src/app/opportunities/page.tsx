'use client';

import { useState } from 'react';
import { Table, Card, Input, Select, Button, Space, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import { useOpportunities } from '@/hooks/use-opportunities';
import { STAGE_COLORS } from '@/lib/constants';
import { OPPORTUNITY_STAGES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import type { Opportunity } from '@/types';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [stage, setStage] = useState('');

  const { opportunities, total, isLoading } = useOpportunities(stage, keyword);

  const columns = [
    {
      title: '商机名称',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record: Opportunity) => (
        <a onClick={() => router.push(`/opportunities/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '关联客户',
      dataIndex: 'customerName',
      width: 150,
    },
    {
      title: '商机阶段',
      dataIndex: 'stage',
      width: 120,
      render: (s: string) => <StatusTag status={s} colorMap={STAGE_COLORS} />,
    },
    {
      title: '预计金额',
      dataIndex: 'amount',
      width: 130,
      render: (v: number) => formatMoney(v),
    },
    {
      title: '配置总价',
      dataIndex: 'configTotal',
      width: 130,
      render: (v: number) => (v ? formatMoney(v) : '-'),
    },
    {
      title: '负责人',
      dataIndex: 'ownerName',
      width: 100,
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Opportunity) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/opportunities/${record.id}`)}
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
            商机管理
          </Typography.Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索商机名称..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="商机阶段"
            value={stage || undefined}
            onChange={(v) => setStage(v || '')}
            allowClear
            style={{ width: 150 }}
            options={OPPORTUNITY_STAGES.map((s) => ({ label: s, value: s }))}
          />
        </Space>

        <Table
          dataSource={opportunities}
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

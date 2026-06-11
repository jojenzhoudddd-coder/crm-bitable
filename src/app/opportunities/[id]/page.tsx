'use client';

import { use } from 'react';
import { Card, Descriptions, Tabs, Spin, Typography, Breadcrumb } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import ConfigTable from '@/components/config-list/ConfigTable';
import { useOpportunity } from '@/hooks/use-opportunities';
import { STAGE_COLORS } from '@/lib/constants';
import { formatMoney } from '@/lib/price';
import type { Quote } from '@/types';

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { opportunity, isLoading } = useOpportunity(id);

  const handleQuoteCreated = (quote: Quote) => {
    router.push(`/quotes/${quote.id}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  if (!opportunity) {
    return (
      <AppLayout>
        <Card>商机不存在</Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => router.push('/opportunities')}>商机管理</a> },
          { title: opportunity.name },
        ]}
      />

      <Tabs
        defaultActiveKey="config"
        items={[
          {
            key: 'info',
            label: '基本信息',
            children: (
              <Card>
                <Descriptions column={2}>
                  <Descriptions.Item label="商机名称">
                    {opportunity.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="关联客户">
                    {opportunity.customerName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="商机阶段">
                    <StatusTag
                      status={opportunity.stage}
                      colorMap={STAGE_COLORS}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="预计金额">
                    {formatMoney(opportunity.amount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="负责人">
                    {opportunity.ownerName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="配置总价">
                    {opportunity.configTotal
                      ? formatMoney(opportunity.configTotal)
                      : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: 'config',
            label: (
              <span>
                配置清单
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, marginLeft: 4 }}
                >
                  (选品报价)
                </Typography.Text>
              </span>
            ),
            children: (
              <Card>
                <ConfigTable
                  opportunityId={id}
                  opportunityName={opportunity.name}
                  onQuoteCreated={handleQuoteCreated}
                />
              </Card>
            ),
          },
        ]}
      />
    </AppLayout>
  );
}

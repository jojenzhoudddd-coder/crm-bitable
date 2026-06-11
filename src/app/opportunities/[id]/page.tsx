'use client';

import { use, useState } from 'react';
import {
  Card, Descriptions, Tabs, Spin, Typography, Breadcrumb, Button, Modal, Form,
  Input, Select, InputNumber, message,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import ConfigTable from '@/components/config-list/ConfigTable';
import { useOpportunity } from '@/hooks/use-opportunities';
import { STAGE_COLORS } from '@/lib/constants';
import { OPPORTUNITY_STAGES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import type { Quote } from '@/types';

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { opportunity, isLoading, mutate } = useOpportunity(id);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const handleQuoteCreated = (quote: Quote) => {
    router.push(`/quotes/${quote.id}`);
  };

  const openEdit = () => {
    if (!opportunity) return;
    form.setFieldsValue({
      name: opportunity.name,
      stage: opportunity.stage,
      amount: opportunity.amount,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await apiFetch(`/api/opportunities/${id}`, {
        method: 'PUT', body: JSON.stringify(values),
      });
      message.success('商机已更新');
      setEditOpen(false);
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <AppLayout><div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div></AppLayout>;
  }
  if (!opportunity) {
    return <AppLayout><Card>商机不存在</Card></AppLayout>;
  }

  return (
    <AppLayout>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => router.push('/opportunities')}>商机管理</a> },
        { title: opportunity.name },
      ]} />

      <Tabs defaultActiveKey="config" items={[
        {
          key: 'info', label: '基本信息',
          children: (
            <Card extra={<Button icon={<EditOutlined />} onClick={openEdit}>编辑</Button>}>
              <Descriptions column={2}>
                <Descriptions.Item label="商机名称">{opportunity.name}</Descriptions.Item>
                <Descriptions.Item label="关联客户">{opportunity.customerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="商机阶段">
                  <StatusTag status={opportunity.stage} colorMap={STAGE_COLORS} />
                </Descriptions.Item>
                <Descriptions.Item label="预计金额">{formatMoney(opportunity.amount)}</Descriptions.Item>
                <Descriptions.Item label="负责人">{opportunity.ownerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="配置总价">
                  {opportunity.configTotal ? formatMoney(opportunity.configTotal) : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ),
        },
        {
          key: 'config',
          label: <span>配置清单 <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>(选品报价)</Typography.Text></span>,
          children: (
            <Card>
              <ConfigTable opportunityId={id} opportunityName={opportunity.name} onQuoteCreated={handleQuoteCreated} />
            </Card>
          ),
        },
      ]} />

      <Modal title="编辑商机" open={editOpen} onCancel={() => setEditOpen(false)}
        onOk={handleSave} confirmLoading={saving} okText="保存" width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商机名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="stage" label="商机阶段">
            <Select options={OPPORTUNITY_STAGES.map((s) => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item name="amount" label="预计金额">
            <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

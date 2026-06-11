'use client';

import { use, useState } from 'react';
import {
  Card, Descriptions, Table, Typography, Breadcrumb, Spin, Button, Modal, Form,
  Input, Select, Space, message,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import MoneyDisplay from '@/components/shared/MoneyDisplay';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import { ORDER_STATUSES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: order, isLoading, mutate } = useSWR(
    `/api/orders/${id}`,
    (url: string) => apiFetch<Order>(url)
  );

  const openEdit = () => {
    if (!order) return;
    form.setFieldsValue({ status: order.status, note: order.note });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(values) });
      message.success('订单已更新');
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
  if (!order) {
    return <AppLayout><Card>订单不存在</Card></AppLayout>;
  }

  const items = order.snapshot?.items || [];

  const columns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '产品名称', dataIndex: 'productName', width: 200 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '成交单价', dataIndex: 'unitPrice', width: 120, render: (v: number) => formatMoney(v) },
    { title: '小计', dataIndex: 'subtotal', width: 120, render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span> },
  ];

  return (
    <AppLayout>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => router.push('/orders')}>正式订单</a> },
        { title: order.name },
      ]} />

      <Card title={order.name}
        extra={
          <Space>
            <StatusTag status={order.status} colorMap={ORDER_STATUS_COLORS} />
            <Button icon={<EditOutlined />} onClick={openEdit}>编辑</Button>
          </Space>
        }
      >
        <Descriptions column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="订单编号">{order.number || '-'}</Descriptions.Item>
          <Descriptions.Item label="客户">{order.customerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="负责人">{order.ownerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="订单金额"><MoneyDisplay amount={order.amount} size="large" /></Descriptions.Item>
        </Descriptions>

        <Typography.Title level={5}>产品明细</Typography.Title>
        <Table dataSource={items} columns={columns} rowKey="productId" pagination={false} size="small" />
        {order.note && <div style={{ marginTop: 16 }}><Typography.Text type="secondary">备注：{order.note}</Typography.Text></div>}
      </Card>

      <Modal title="编辑订单" open={editOpen} onCancel={() => setEditOpen(false)}
        onOk={handleSave} confirmLoading={saving} okText="保存" width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="订单状态">
            <Select options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item name="note" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

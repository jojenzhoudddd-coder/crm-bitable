'use client';

import { useState } from 'react';
import {
  Table, Card, Select, Space, Typography, Button, Popconfirm, Modal, Form, Input, message,
} from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const { data, isLoading, mutate } = useSWR(
    `/api/orders?${params.toString()}`,
    (url: string) => apiFetch<{ items: Order[]; total: number }>(url),
    { revalidateOnFocus: false }
  );

  const orders = data?.items || [];

  const openEdit = (record: Order) => {
    setEditingOrder(record);
    form.setFieldsValue({ status: record.status, note: record.note });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${editingOrder!.id}`, {
        method: 'PUT', body: JSON.stringify(values),
      });
      message.success('订单已更新');
      setEditModalOpen(false);
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
      message.success('已删除');
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const columns = [
    {
      title: '订单编号', dataIndex: 'number', width: 160,
      render: (num: string, record: Order) => (
        <a onClick={() => router.push(`/orders/${record.id}`)}>{num || record.name}</a>
      ),
    },
    { title: '订单名称', dataIndex: 'name', width: 200 },
    { title: '客户', dataIndex: 'customerName', width: 150 },
    {
      title: '订单金额', dataIndex: 'amount', width: 130,
      render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span>,
    },
    {
      title: '状态', dataIndex: 'status', width: 110,
      render: (s: string) => <StatusTag status={s} colorMap={ORDER_STATUS_COLORS} />,
    },
    { title: '负责人', dataIndex: 'ownerName', width: 100 },
    {
      title: '操作', width: 180,
      render: (_: unknown, record: Order) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}
            onClick={() => router.push(`/orders/${record.id}`)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该订单？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>正式订单</Typography.Title>
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Select placeholder="订单状态" value={status || undefined} onChange={(v) => setStatus(v || '')}
            allowClear style={{ width: 150 }}
            options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))} />
        </Space>
        <Table dataSource={orders} columns={columns} rowKey="id" loading={isLoading}
          pagination={{ total: data?.total, pageSize: 50 }} size="middle" />
      </Card>

      <Modal title="编辑订单" open={editModalOpen} onCancel={() => setEditModalOpen(false)}
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

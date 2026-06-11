'use client';

import { useState } from 'react';
import {
  Table, Card, Input, Select, Button, Space, Typography, Modal, Form,
  InputNumber, Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import { useOpportunities } from '@/hooks/use-opportunities';
import { STAGE_COLORS } from '@/lib/constants';
import { OPPORTUNITY_STAGES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import type { Opportunity } from '@/types';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [stage, setStage] = useState('');
  const { opportunities, total, isLoading, mutate } = useOpportunities(stage, keyword);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ stage: '初步接洽', amount: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Opportunity) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name, stage: record.stage, amount: record.amount });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/opportunities/${editing.id}`, {
          method: 'PUT', body: JSON.stringify(values),
        });
        message.success('商机已更新');
      } else {
        await apiFetch('/api/opportunities', {
          method: 'POST', body: JSON.stringify(values),
        });
        message.success('商机已创建');
      }
      setModalOpen(false);
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      message.success('已删除');
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const columns = [
    {
      title: '商机名称', dataIndex: 'name', width: 200,
      render: (name: string, record: Opportunity) => (
        <a onClick={() => router.push(`/opportunities/${record.id}`)}>{name}</a>
      ),
    },
    { title: '关联客户', dataIndex: 'customerName', width: 150 },
    {
      title: '商机阶段', dataIndex: 'stage', width: 120,
      render: (s: string) => <StatusTag status={s} colorMap={STAGE_COLORS} />,
    },
    { title: '预计金额', dataIndex: 'amount', width: 130, render: (v: number) => formatMoney(v) },
    { title: '配置总价', dataIndex: 'configTotal', width: 130, render: (v: number) => v ? formatMoney(v) : '-' },
    { title: '负责人', dataIndex: 'ownerName', width: 100 },
    {
      title: '操作', width: 180,
      render: (_: unknown, record: Opportunity) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}
            onClick={() => router.push(`/opportunities/${record.id}`)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该商机？" onConfirm={() => handleDelete(record.id)}>
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
          <Typography.Title level={4} style={{ margin: 0 }}>商机管理</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增商机</Button>
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索商机名称..." prefix={<SearchOutlined />} value={keyword}
            onChange={(e) => setKeyword(e.target.value)} allowClear style={{ width: 250 }} />
          <Select placeholder="商机阶段" value={stage || undefined} onChange={(v) => setStage(v || '')}
            allowClear style={{ width: 150 }}
            options={OPPORTUNITY_STAGES.map((s) => ({ label: s, value: s }))} />
        </Space>
        <Table dataSource={opportunities} columns={columns} rowKey="id" loading={isLoading}
          pagination={{ total, pageSize: 50 }} size="middle" />
      </Card>

      <Modal title={editing ? '编辑商机' : '新增商机'} open={modalOpen}
        onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving}
        okText="保存" width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商机名称" rules={[{ required: true, message: '请输入商机名称' }]}>
            <Input placeholder="如：XX公司CRM项目" />
          </Form.Item>
          <Space size={16} style={{ display: 'flex' }}>
            <Form.Item name="stage" label="商机阶段" style={{ flex: 1 }}>
              <Select options={OPPORTUNITY_STAGES.map((s) => ({ label: s, value: s }))} />
            </Form.Item>
            <Form.Item name="amount" label="预计金额" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </AppLayout>
  );
}

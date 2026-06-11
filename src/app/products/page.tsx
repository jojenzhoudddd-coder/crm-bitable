'use client';

import { useState } from 'react';
import {
  Table, Card, Input, Select, Button, Space, Typography, Modal, Form,
  InputNumber, Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import { useProducts, useProductCategories } from '@/hooks/use-products';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import type { Product } from '@/types';

const UNIT_OPTIONS = ['个', '套', '台', '年', '月', '件', '次'];
const CATEGORY_OPTIONS = ['软件产品', '硬件设备', '服务方案', '配件耗材'];
const STATUS_OPTIONS = ['在售', '停售'];

export default function ProductsPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const { products, total, isLoading, mutate } = useProducts(keyword, category);
  const { categories } = useProductCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '在售', unit: '个', minDiscount: 0.5, price: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Product) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/products/${editing.id}`, {
          method: 'PUT', body: JSON.stringify(values),
        });
        message.success('产品已更新');
      } else {
        await apiFetch('/api/products', {
          method: 'POST', body: JSON.stringify(values),
        });
        message.success('产品已创建');
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
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      message.success('已删除');
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const columns = [
    { title: '产品名称', dataIndex: 'name', width: 180 },
    { title: '编号', dataIndex: 'code', width: 100 },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    {
      title: '标准单价', dataIndex: 'price', width: 120,
      render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span>,
    },
    { title: '最低折扣', dataIndex: 'minDiscount', width: 90, render: (v: number) => `${(v * 10).toFixed(1)}折` },
    { title: '状态', dataIndex: 'status', width: 80 },
    {
      title: '操作', width: 120,
      render: (_: unknown, record: Product) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该产品？" onConfirm={() => handleDelete(record.id)}>
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
          <Typography.Title level={4} style={{ margin: 0 }}>产品库 ({total})</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增产品</Button>
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索产品名称..." prefix={<SearchOutlined />} value={keyword}
            onChange={(e) => setKeyword(e.target.value)} allowClear style={{ width: 250 }} />
          <Select placeholder="产品分类" value={category || undefined} onChange={(v) => setCategory(v || '')}
            allowClear style={{ width: 150 }}
            options={categories.map((c) => ({ label: c.name, value: c.name }))} />
        </Space>
        <Table dataSource={products} columns={columns} rowKey="id" loading={isLoading}
          pagination={{ total, pageSize: 50 }} size="middle" />
      </Card>

      <Modal title={editing ? '编辑产品' : '新增产品'} open={modalOpen}
        onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving}
        okText="保存" width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
            <Input />
          </Form.Item>
          <Space size={16} style={{ display: 'flex' }}>
            <Form.Item name="code" label="产品编号" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="category" label="分类" style={{ flex: 1 }}>
              <Select options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))} />
            </Form.Item>
          </Space>
          <Space size={16} style={{ display: 'flex' }}>
            <Form.Item name="price" label="标准单价" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
            <Form.Item name="unit" label="单位" style={{ flex: 1 }}>
              <Select options={UNIT_OPTIONS.map((u) => ({ label: u, value: u }))} />
            </Form.Item>
            <Form.Item name="minDiscount" label="最低折扣" style={{ flex: 1 }}>
              <InputNumber min={0.1} max={1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="产品描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

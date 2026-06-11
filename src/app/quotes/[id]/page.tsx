'use client';

import { use, useState } from 'react';
import {
  Card, Descriptions, Table, Button, Space, Typography, Breadcrumb, Spin, Tag,
  Modal, Form, Input, InputNumber, Select, message,
} from 'antd';
import {
  PrinterOutlined, ShareAltOutlined, SwapOutlined, LinkOutlined, EditOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusTag from '@/components/shared/StatusTag';
import MoneyDisplay from '@/components/shared/MoneyDisplay';
import CopyButton from '@/components/shared/CopyButton';
import { useQuote } from '@/hooks/use-quotes';
import { QUOTE_STATUS_COLORS } from '@/lib/constants';
import { QUOTE_STATUSES } from '@/lib/bitable/tables';
import { formatMoney } from '@/lib/price';
import { apiFetch } from '@/lib/utils';

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { quote, isLoading, mutate } = useQuote(id);
  const [shareUrl, setShareUrl] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  if (isLoading) {
    return <AppLayout><div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div></AppLayout>;
  }
  if (!quote) {
    return <AppLayout><Card>报价单不存在</Card></AppLayout>;
  }

  const snapshotItems = quote.snapshot?.items || [];

  const handlePrint = () => window.open(`/quotes/${id}/print`, '_blank');

  const handleShare = async () => {
    try {
      const data = await apiFetch<{ shareUrl: string }>(`/api/quotes/${id}/share`, { method: 'POST' });
      setShareUrl(data.shareUrl);
      setShareModalOpen(true);
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '生成分享链接失败');
    }
  };

  const handleConvert = () => {
    Modal.confirm({
      title: '转为正式订单',
      content: `确认将报价单"${quote.name}"转为正式订单？`,
      okText: '确认', cancelText: '取消',
      onOk: async () => {
        try {
          const data = await apiFetch<{ orderId: string }>(`/api/quotes/${id}/convert`, { method: 'POST' });
          message.success('已转为正式订单');
          router.push(`/orders/${data.orderId}`);
        } catch (err) {
          message.error(err instanceof Error ? err.message : '转订单失败');
        }
      },
    });
  };

  const openEdit = () => {
    form.setFieldsValue({
      name: quote.name,
      status: quote.status,
      wholeDiscount: quote.wholeDiscount,
      note: quote.note,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await apiFetch(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(values) });
      message.success('报价单已更新');
      setEditOpen(false);
      mutate();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const productColumns = [
    { title: '序号', width: 60, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: '产品名称', dataIndex: 'productName', width: 200 },
    { title: '产品编号', dataIndex: 'productCode', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '标准单价', dataIndex: 'standardPrice', width: 120, render: (v: number) => formatMoney(v) },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '折扣', dataIndex: 'discountRate', width: 80, render: (v: number) => v < 1 ? `${(v * 10).toFixed(1)}折` : '-' },
    { title: '成交单价', dataIndex: 'unitPrice', width: 120, render: (v: number) => formatMoney(v) },
    { title: '小计', dataIndex: 'subtotal', width: 120, render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span> },
  ];

  return (
    <AppLayout>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => router.push('/quotes')}>报价订单</a> },
        { title: quote.name },
      ]} />

      <Card
        title={<Space><span>{quote.name}</span><StatusTag status={quote.status} colorMap={QUOTE_STATUS_COLORS} /></Space>}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={openEdit}>编辑</Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>打印报价单</Button>
            <Button type="primary" icon={<ShareAltOutlined />} onClick={handleShare}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}>分享给客户</Button>
            {quote.status === '客户确认' && (
              <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert}>转为正式订单</Button>
            )}
          </Space>
        }
      >
        <Descriptions column={3} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="报价单号">{quote.number || '-'}</Descriptions.Item>
          <Descriptions.Item label="客户名称">{quote.customerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系人">{quote.contactName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{quote.contactPhone || '-'}</Descriptions.Item>
          <Descriptions.Item label="负责销售">{quote.ownerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="查看次数">{quote.viewCount || 0} 次</Descriptions.Item>
          <Descriptions.Item label="报价金额" span={3}>
            <MoneyDisplay amount={quote.totalAmount} size="large" />
            {quote.wholeDiscount < 1 && <Tag color="orange" style={{ marginLeft: 8 }}>整单 {(quote.wholeDiscount * 10).toFixed(1)} 折</Tag>}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Title level={5}>产品明细</Typography.Title>
        <Table dataSource={snapshotItems} columns={productColumns} rowKey="productId" pagination={false} size="small"
          summary={() => (
            <Table.Summary><Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={8}><strong>合计</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={8}>
                <span style={{ color: '#cf1322', fontWeight: 700, fontSize: 16 }}>{formatMoney(quote.totalAmount)}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row></Table.Summary>
          )}
        />
        {quote.note && <div style={{ marginTop: 16 }}><Typography.Text type="secondary">备注：{quote.note}</Typography.Text></div>}
      </Card>

      <Modal title="分享报价单" open={shareModalOpen} onCancel={() => setShareModalOpen(false)} footer={null}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Typography.Paragraph><LinkOutlined /> 分享链接已生成：</Typography.Paragraph>
          <Input.TextArea value={shareUrl} readOnly rows={2} style={{ marginBottom: 16 }} />
          <CopyButton text={shareUrl} label="复制链接" />
          <Typography.Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
            客户打开链接即可查看报价详情
          </Typography.Paragraph>
        </div>
      </Modal>

      <Modal title="编辑报价单" open={editOpen} onCancel={() => setEditOpen(false)}
        onOk={handleSave} confirmLoading={saving} okText="保存" width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="报价名称"><Input /></Form.Item>
          <Space size={16} style={{ display: 'flex' }}>
            <Form.Item name="status" label="报价状态" style={{ flex: 1 }}>
              <Select options={QUOTE_STATUSES.map((s) => ({ label: s, value: s }))} />
            </Form.Item>
            <Form.Item name="wholeDiscount" label="整单折扣" style={{ flex: 1 }}>
              <InputNumber min={0.1} max={1} step={0.05} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="note" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

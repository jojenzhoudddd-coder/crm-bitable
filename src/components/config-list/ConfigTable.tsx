'use client';

import { useState } from 'react';
import {
  Table,
  InputNumber,
  Input,
  Button,
  Popconfirm,
  Space,
  Card,
  Statistic,
  message,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useConfigItems } from '@/hooks/use-config-items';
import { formatMoney, formatDiscount } from '@/lib/price';
import { apiFetch } from '@/lib/utils';
import ProductSelectorModal from '@/components/product-selector/ProductSelectorModal';
import type { ConfigItem, Quote } from '@/types';

interface ConfigTableProps {
  opportunityId: string;
  opportunityName: string;
  onQuoteCreated?: (quote: Quote) => void;
}

export default function ConfigTable({
  opportunityId,
  opportunityName,
  onQuoteCreated,
}: ConfigTableProps) {
  const {
    items,
    summary,
    isLoading,
    addItems,
    updateItem,
    removeItem,
  } = useConfigItems(opportunityId);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const existingProductIds = items.map((i) => i.productId);

  const handleAddProducts = async (
    products: Array<{ productId: string; quantity: number; discountRate: number }>
  ) => {
    await addItems(products);
  };

  const handleGenerateQuote = async () => {
    if (items.length === 0) {
      message.warning('配置清单为空');
      return;
    }

    Modal.confirm({
      title: '生成报价订单',
      content: (
        <div>
          <p>将基于当前配置清单生成报价订单：</p>
          <p>产品数量：{summary.totalItems} 项</p>
          <p>合计金额：{formatMoney(summary.totalAmount)}</p>
        </div>
      ),
      okText: '确认生成',
      cancelText: '取消',
      onOk: async () => {
        setGenerating(true);
        try {
          const quote = await apiFetch<Quote>('/api/quotes', {
            method: 'POST',
            body: JSON.stringify({
              opportunityId,
              name: `${opportunityName} 报价单`,
            }),
          });
          message.success('报价订单已生成');
          onQuoteCreated?.(quote);
        } catch (err) {
          message.error(err instanceof Error ? err.message : '生成失败');
        } finally {
          setGenerating(false);
        }
      },
    });
  };

  const columns = [
    {
      title: '序号',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      width: 200,
    },
    {
      title: '产品编号',
      dataIndex: 'productCode',
      width: 120,
    },
    {
      title: '标准单价',
      dataIndex: 'standardPrice',
      width: 120,
      render: (v: number) => formatMoney(v),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (value: number, record: ConfigItem) => (
        <InputNumber
          min={1}
          max={9999}
          value={value}
          size="small"
          onChange={(v) => {
            if (v && v > 0) updateItem(record.id, { quantity: v });
          }}
        />
      ),
    },
    {
      title: '折扣',
      dataIndex: 'discountRate',
      width: 110,
      render: (value: number, record: ConfigItem) => (
        <InputNumber
          min={0.1}
          max={1}
          step={0.05}
          value={value}
          size="small"
          formatter={(v) => (v ? formatDiscount(Number(v)) : '')}
          parser={(v) => {
            if (!v) return 1;
            const match = v.match(/[\d.]+/);
            if (match) {
              const n = parseFloat(match[0]);
              return n > 1 ? n / 10 : n;
            }
            return 1;
          }}
          onChange={(v) => {
            if (v && v > 0 && v <= 1) updateItem(record.id, { discountRate: v });
          }}
        />
      ),
    },
    {
      title: '成交单价',
      dataIndex: 'unitPrice',
      width: 120,
      render: (v: number) => formatMoney(v),
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 120,
      render: (v: number) => (
        <span style={{ color: '#cf1322', fontWeight: 600 }}>{formatMoney(v)}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'note',
      width: 150,
      render: (value: string, record: ConfigItem) => (
        <Input
          size="small"
          value={value}
          placeholder="备注"
          onChange={(e) => updateItem(record.id, { note: e.target.value })}
        />
      ),
    },
    {
      title: '操作',
      width: 60,
      render: (_: unknown, record: ConfigItem) => (
        <Popconfirm
          title="确认删除？"
          onConfirm={() => removeItem(record.id)}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setSelectorOpen(true)}
          >
            添加产品
          </Button>
        </Space>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={handleGenerateQuote}
          loading={generating}
          disabled={items.length === 0}
          style={{ background: '#1677ff' }}
        >
          生成报价订单
        </Button>
      </div>

      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="small"
        scroll={{ x: 1100 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}>
                <strong>合计</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <span style={{ color: '#cf1322', fontWeight: 700, fontSize: 16 }}>
                  {formatMoney(summary.totalAmount)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} colSpan={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      {items.length > 0 && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Space size={48}>
            <Statistic title="产品项数" value={summary.totalItems} suffix="项" />
            <Statistic title="总数量" value={summary.totalQuantity} suffix="件" />
            <Statistic
              title="配置总金额"
              value={summary.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322', fontSize: 24 }}
            />
          </Space>
        </Card>
      )}

      <ProductSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onAddProducts={handleAddProducts}
        existingProductIds={existingProductIds}
      />
    </div>
  );
}

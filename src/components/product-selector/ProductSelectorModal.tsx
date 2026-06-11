'use client';

import { useState, useCallback } from 'react';
import { Modal, Tabs, Input, Select, Card, Button, Row, Col, Spin, Empty, message } from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useProducts, useProductCategories } from '@/hooks/use-products';
import { formatMoney } from '@/lib/price';
import type { Product } from '@/types';

interface ProductSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onAddProducts: (products: Array<{ productId: string; quantity: number; discountRate: number }>) => Promise<void>;
  existingProductIds?: string[];
}

export default function ProductSelectorModal({
  open,
  onClose,
  onAddProducts,
  existingProductIds = [],
}: ProductSelectorModalProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const { products, isLoading } = useProducts(keyword, category);
  const { categories } = useProductCategories();

  const toggleSelect = useCallback((productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      message.warning('请至少选择一个产品');
      return;
    }
    setAdding(true);
    try {
      const items = Array.from(selectedIds).map((id) => ({
        productId: id,
        quantity: 1,
        discountRate: 1,
      }));
      await onAddProducts(items);
      message.success(`已添加 ${items.length} 个产品`);
      setSelectedIds(new Set());
      onClose();
    } catch {
      message.error('添加失败');
    } finally {
      setAdding(false);
    }
  };

  const renderProductCard = (product: Product) => {
    const isSelected = selectedIds.has(product.id);
    const isExisting = existingProductIds.includes(product.id);

    return (
      <Col xs={12} sm={8} md={6} key={product.id}>
        <Card
          hoverable
          size="small"
          style={{
            marginBottom: 12,
            borderColor: isSelected ? '#1677ff' : undefined,
          }}
          cover={
            product.imageUrl ? (
              <div
                style={{
                  height: 120,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div
                style={{
                  height: 120,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                暂无图片
              </div>
            )
          }
          actions={[
            isExisting ? (
              <Button key="existing" size="small" disabled>
                已在清单中
              </Button>
            ) : (
              <Button
                key="add"
                size="small"
                type={isSelected ? 'default' : 'primary'}
                icon={isSelected ? <CheckOutlined /> : <PlusOutlined />}
                onClick={() => toggleSelect(product.id)}
              >
                {isSelected ? '已选择' : '选择'}
              </Button>
            ),
          ]}
        >
          <Card.Meta
            title={<span style={{ fontSize: 13 }}>{product.name}</span>}
            description={
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {product.category} {product.code && `| ${product.code}`}
                </div>
                <div style={{ fontSize: 14, color: '#cf1322', fontWeight: 600, marginTop: 4 }}>
                  {formatMoney(product.price)}
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>
                    /{product.unit || '个'}
                  </span>
                </div>
              </div>
            }
          />
        </Card>
      </Col>
    );
  };

  return (
    <Modal
      title="添加产品"
      open={open}
      onCancel={onClose}
      width={900}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            已选择 <strong>{selectedIds.size}</strong> 个产品
          </span>
          <div>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={adding}
              disabled={selectedIds.size === 0}
            >
              确认添加
            </Button>
          </div>
        </div>
      }
    >
      <Tabs
        items={[
          {
            key: 'search',
            label: '从产品库添加',
            children: (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <Input
                    placeholder="搜索产品名称、编号..."
                    prefix={<SearchOutlined />}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    allowClear
                    style={{ flex: 1 }}
                  />
                  <Select
                    placeholder="产品分类"
                    value={category || undefined}
                    onChange={(val) => setCategory(val || '')}
                    allowClear
                    style={{ width: 180 }}
                    options={categories.map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                  />
                </div>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                  </div>
                ) : products.length === 0 ? (
                  <Empty description="没有找到产品" />
                ) : (
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Row gutter={12}>{products.map(renderProductCard)}</Row>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}

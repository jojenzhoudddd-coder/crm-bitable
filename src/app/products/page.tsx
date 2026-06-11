'use client';

import { useState } from 'react';
import { Card, Input, Select, Row, Col, Typography, Spin, Empty, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import { useProducts, useProductCategories } from '@/hooks/use-products';
import { formatMoney } from '@/lib/price';

export default function ProductsPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const { products, total, isLoading } = useProducts(keyword, category);
  const { categories } = useProductCategories();

  return (
    <AppLayout>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            产品库
          </Typography.Title>
          <Typography.Text type="secondary">{total} 个产品</Typography.Text>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索产品名称、编号..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            placeholder="产品分类"
            value={category || undefined}
            onChange={(v) => setCategory(v || '')}
            allowClear
            style={{ width: 180 }}
            options={categories.map((c) => ({ label: c.name, value: c.name }))}
          />
        </Space>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <Empty description="没有找到产品" />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
                <Card
                  hoverable
                  size="small"
                  cover={
                    product.imageUrl ? (
                      <div
                        style={{
                          height: 140,
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
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 140,
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ccc',
                          fontSize: 12,
                        }}
                      >
                        暂无图片
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={
                      <span style={{ fontSize: 13 }}>{product.name}</span>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {product.category}
                          {product.code && ` | ${product.code}`}
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            color: '#cf1322',
                            fontWeight: 600,
                            marginTop: 4,
                          }}
                        >
                          {formatMoney(product.price)}
                          <span
                            style={{
                              fontSize: 11,
                              color: '#888',
                              fontWeight: 400,
                            }}
                          >
                            /{product.unit || '个'}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </AppLayout>
  );
}

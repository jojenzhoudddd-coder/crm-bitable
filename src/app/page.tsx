'use client';

import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  FunnelPlotOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

export default function DashboardPage() {
  const router = useRouter();

  const quickActions = [
    {
      title: '商机管理',
      icon: <FunnelPlotOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      desc: '查看和管理所有商机',
      path: '/opportunities',
    },
    {
      title: '报价订单',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      desc: '管理报价单，打印或分享',
      path: '/quotes',
    },
    {
      title: '正式订单',
      icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      desc: '查看已签约的订单',
      path: '/orders',
    },
    {
      title: '产品库',
      icon: <AppstoreOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      desc: '浏览产品和套餐',
      path: '/products',
    },
  ];

  return (
    <AppLayout>
      <div>
        <Typography.Title level={4} style={{ marginBottom: 24 }}>
          工作台
        </Typography.Title>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中商机"
                value="-"
                prefix={<FunnelPlotOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待发送报价"
                value="-"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待确认报价"
                value="-"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本月成单"
                value="-"
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Typography.Title level={5} style={{ marginBottom: 16 }}>
          快捷入口
        </Typography.Title>

        <Row gutter={16}>
          {quickActions.map((action) => (
            <Col span={6} key={action.path}>
              <Card
                hoverable
                onClick={() => router.push(action.path)}
                style={{ textAlign: 'center' }}
              >
                <Space direction="vertical" size={12}>
                  {action.icon}
                  <Typography.Text strong>{action.title}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {action.desc}
                  </Typography.Text>
                  <Button type="link" size="small" icon={<ArrowRightOutlined />}>
                    进入
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </AppLayout>
  );
}

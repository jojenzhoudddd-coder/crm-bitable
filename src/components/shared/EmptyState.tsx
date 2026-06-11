'use client';

import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  description = '暂无数据',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <Empty description={description} style={{ padding: '60px 0' }}>
      {actionText && onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
}

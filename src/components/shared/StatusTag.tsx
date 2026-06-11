'use client';

import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  colorMap: Record<string, string>;
}

export default function StatusTag({ status, colorMap }: StatusTagProps) {
  return <Tag color={colorMap[status] || 'default'}>{status || '-'}</Tag>;
}

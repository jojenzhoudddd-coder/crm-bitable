'use client';

import { Typography } from 'antd';
import { formatMoney } from '@/lib/price';

interface MoneyDisplayProps {
  amount: number;
  size?: 'small' | 'default' | 'large';
}

export default function MoneyDisplay({
  amount,
  size = 'default',
}: MoneyDisplayProps) {
  const fontSize =
    size === 'large' ? 24 : size === 'small' ? 14 : 16;

  return (
    <Typography.Text
      strong
      style={{ fontSize, color: '#cf1322' }}
    >
      {formatMoney(amount)}
    </Typography.Text>
  );
}

'use client';

import { useState } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = '复制链接' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <Button
      icon={copied ? <CheckOutlined /> : <CopyOutlined />}
      onClick={handleCopy}
      type={copied ? 'default' : 'primary'}
    >
      {copied ? '已复制' : label}
    </Button>
  );
}

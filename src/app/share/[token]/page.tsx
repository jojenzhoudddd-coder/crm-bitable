'use client';

import { use, useEffect, useState } from 'react';
import { formatMoney } from '@/lib/price';
import type { QuoteSnapshot } from '@/types';

interface ShareData {
  name: string;
  customerName: string;
  contactName: string;
  totalAmount: number;
  status: string;
  note: string;
  salesContact: string;
  snapshot: QuoteSnapshot | null;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取报价数据
    fetch(`/api/share/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || '加载失败');
        }
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false));

    // 记录查看
    fetch(`/api/share/${token}/track`, { method: 'POST' }).catch(() => {});
  }, [token]);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: '#999', marginTop: 16 }}>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ color: '#999', fontSize: 16 }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const items = data.snapshot?.items || [];

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <h1 style={styles.title}>{data.name}</h1>
        <div style={styles.subtitle}>致：{data.customerName}</div>
      </div>

      {/* 报价总额 */}
      <div style={styles.totalCard}>
        <div style={styles.totalLabel}>报价总额</div>
        <div style={styles.totalAmount}>{formatMoney(data.totalAmount)}</div>
      </div>

      {/* 产品明细 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>产品明细</h3>
        {items.map((item, idx) => (
          <div key={idx} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemIndex}>{idx + 1}</span>
              <span style={styles.itemName}>{item.productName}</span>
            </div>
            <div style={styles.itemDetails}>
              <div style={styles.itemRow}>
                <span style={styles.itemLabel}>数量</span>
                <span>{item.quantity} {item.unit || '个'}</span>
              </div>
              <div style={styles.itemRow}>
                <span style={styles.itemLabel}>单价</span>
                <span>{formatMoney(item.unitPrice)}</span>
              </div>
              {item.discountRate < 1 && (
                <div style={styles.itemRow}>
                  <span style={styles.itemLabel}>折扣</span>
                  <span style={{ color: '#fa8c16' }}>
                    {(item.discountRate * 10).toFixed(1)}折
                  </span>
                </div>
              )}
              <div style={{ ...styles.itemRow, borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
                <span style={styles.itemLabel}>小计</span>
                <span style={{ color: '#cf1322', fontWeight: 700 }}>
                  {formatMoney(item.subtotal)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 备注 */}
      {data.note && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>备注说明</h3>
          <p style={{ color: '#666', lineHeight: 1.8 }}>{data.note}</p>
        </div>
      )}

      {/* 销售联系 */}
      {data.salesContact && (
        <div style={styles.contactCard}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>如有疑问，请联系我</div>
          <div style={{ color: '#666' }}>{data.salesContact}</div>
        </div>
      )}

      {/* 底部 */}
      <div style={styles.footer}>
        本报价单由系统自动生成
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '0 16px 40px',
    background: '#f5f5f5',
    minHeight: '100vh',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #1677ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    background: '#1677ff',
    color: '#fff',
    padding: '24px 20px',
    margin: '0 -16px 16px',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.85,
  },
  totalCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px',
    textAlign: 'center',
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  totalLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 700,
    color: '#cf1322',
  },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: '0 0 12px',
    paddingBottom: 8,
    borderBottom: '1px solid #f0f0f0',
  },
  itemCard: {
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    background: '#1677ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    marginRight: 10,
    flexShrink: 0,
  },
  itemName: {
    fontWeight: 600,
    fontSize: 14,
  },
  itemDetails: {
    marginLeft: 34,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    fontSize: 13,
  },
  itemLabel: {
    color: '#999',
  },
  contactCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 16,
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderTop: '3px solid #52c41a',
  },
  footer: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    padding: '20px 0',
  },
};

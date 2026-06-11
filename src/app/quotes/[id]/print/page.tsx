'use client';

import { use, useEffect, useState } from 'react';
import { Spin, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/utils';
import { formatMoney } from '@/lib/price';
import type { Quote } from '@/types';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  taxId: string;
  bank: string;
  bankAccount: string;
  logoUrl: string;
  stampUrl: string;
}

export default function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Quote>(`/api/quotes/${id}`),
      apiFetch<CompanyInfo>('/api/company-info'),
    ])
      .then(([q, c]) => {
        setQuote(q);
        setCompany(c);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quote || !company) {
    return <div style={{ textAlign: 'center', padding: 100 }}>数据加载失败</div>;
  }

  const items = quote.snapshot?.items || [];
  const today = new Date().toLocaleDateString('zh-CN');

  return (
    <>
      {/* 操作栏 - 打印时隐藏 */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '12px 24px',
          borderBottom: '1px solid #eee',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          打印 / 导出 PDF
        </Button>
        <Button onClick={() => window.close()}>关闭</Button>
      </div>

      {/* A4 打印内容 */}
      <div
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '60px auto 20px',
          padding: '20mm',
          background: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          fontFamily: 'SimSun, serif',
          fontSize: '12pt',
          color: '#000',
          lineHeight: 1.6,
        }}
      >
        {/* 公司头部 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt="Logo"
              style={{ height: 50, marginBottom: 8 }}
            />
          )}
          <h1 style={{ fontSize: '18pt', margin: '0 0 4px' }}>{company.name}</h1>
          <div style={{ fontSize: '9pt', color: '#666' }}>
            {[company.address, company.phone].filter(Boolean).join(' | ')}
          </div>
        </div>

        {/* 标题 */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '2px solid #000',
            borderBottom: '2px solid #000',
            padding: '8px 0',
            margin: '16px 0',
          }}
        >
          <h2 style={{ fontSize: '16pt', margin: 0, letterSpacing: '8px' }}>
            报 价 单
          </h2>
          <div style={{ fontSize: '10pt', color: '#666', marginTop: 4 }}>
            编号：{quote.number || '-'}
          </div>
        </div>

        {/* 客户信息 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px 20px',
            marginBottom: 16,
            fontSize: '10pt',
          }}
        >
          <div>客户名称：{quote.customerName || '-'}</div>
          <div>联 系 人：{quote.contactName || '-'}</div>
          <div>联系电话：{quote.contactPhone || '-'}</div>
          <div>报价日期：{today}</div>
          <div>客户地址：{quote.contactAddress || '-'}</div>
          <div>负 责 人：{quote.ownerName || '-'}</div>
        </div>

        {/* 产品明细表 */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 16,
            fontSize: '9pt',
          }}
        >
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={thStyle}>序号</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>产品名称</th>
              <th style={thStyle}>编号</th>
              <th style={thStyle}>单位</th>
              <th style={thStyle}>数量</th>
              <th style={thStyle}>标准单价</th>
              <th style={thStyle}>折扣</th>
              <th style={thStyle}>成交单价</th>
              <th style={thStyle}>金额</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ pageBreakInside: 'avoid' }}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>{item.productName}</td>
                <td style={tdStyle}>{item.productCode}</td>
                <td style={tdStyle}>{item.unit || '-'}</td>
                <td style={tdStyle}>{item.quantity}</td>
                <td style={tdStyle}>{formatMoney(item.standardPrice)}</td>
                <td style={tdStyle}>
                  {item.discountRate < 1
                    ? `${(item.discountRate * 10).toFixed(1)}折`
                    : '-'}
                </td>
                <td style={tdStyle}>{formatMoney(item.unitPrice)}</td>
                <td style={tdStyle}>{formatMoney(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: '#fafafa' }}>
              <td style={tdStyle} colSpan={8}>
                合 计
              </td>
              <td style={tdStyle}>{formatMoney(quote.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* 备注 */}
        {quote.note && (
          <div style={{ marginBottom: 16, fontSize: '10pt' }}>
            <strong>备注：</strong>
            {quote.note}
          </div>
        )}

        {/* 银行信息 */}
        {(company.bank || company.bankAccount) && (
          <div
            style={{
              border: '1px solid #ddd',
              padding: 12,
              marginBottom: 20,
              fontSize: '10pt',
            }}
          >
            <strong>付款账户信息</strong>
            <div>开户银行：{company.bank}</div>
            <div>银行账号：{company.bankAccount}</div>
            {company.taxId && <div>税号：{company.taxId}</div>}
          </div>
        )}

        {/* 签章区 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            marginTop: 40,
            fontSize: '10pt',
          }}
        >
          <div>
            <div style={{ marginBottom: 8 }}>供方（盖章）：</div>
            <div style={{ height: 80, position: 'relative' }}>
              {company.stampUrl && (
                <img
                  src={company.stampUrl}
                  alt="公章"
                  style={{ height: 80, opacity: 0.8 }}
                />
              )}
            </div>
            <div>日期：{today}</div>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>需方（盖章）：</div>
            <div style={{ height: 80 }} />
            <div>日期：</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </>
  );
}

const thStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '6px 8px',
  textAlign: 'center',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '4px 8px',
  textAlign: 'center',
};

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { QUOTE_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber, getOption } from '@/lib/bitable/helpers';
import type { QuoteSnapshot } from '@/types';

// 公开 API，无认证
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const f = QUOTE_TABLE.fields;

    // 按 shareToken 搜索
    const res = await bitable.searchRecords(QUOTE_TABLE.id(), {
      filter: {
        conjunction: 'and',
        conditions: [
          { field_name: f.shareToken, operator: 'is', value: [token] },
        ],
      },
      page_size: 1,
    });

    if (!res.items?.length) {
      return NextResponse.json(
        { success: false, error: '报价单不存在或已失效' },
        { status: 404 }
      );
    }

    const record = res.items[0];
    const fields = record.fields;
    const status = getOption(fields[f.status]);

    // 检查是否已过期
    if (status === '已过期') {
      return NextResponse.json(
        { success: false, error: '该报价单已过期' },
        { status: 410 }
      );
    }

    // 解析快照
    let snapshot: QuoteSnapshot | null = null;
    const snapshotStr = getText(fields[f.snapshot]);
    if (snapshotStr) {
      try { snapshot = JSON.parse(snapshotStr); } catch { /* ignore */ }
    }

    // 返回脱敏数据（不暴露内部 ID）
    const data = {
      name: getText(fields[f.name]),
      customerName: getText(fields[f.customer]),
      contactName: getText(fields[f.contactName]),
      totalAmount: getNumber(fields[f.totalAmount]),
      status,
      note: getText(fields[f.note]),
      salesContact: getText(fields[f.salesContact]),
      snapshot,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { QUOTE_TABLE } from '@/lib/bitable/tables';
import { getNumber } from '@/lib/bitable/helpers';

// 记录查看行为（公开 API）
export async function POST(
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
      field_names: [f.viewCount],
      page_size: 1,
    });

    if (!res.items?.length) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const record = res.items[0];
    const currentCount = getNumber(record.fields[f.viewCount]);

    await bitable.updateRecord(QUOTE_TABLE.id(), record.record_id, {
      [f.viewCount]: currentCount + 1,
      [f.lastViewedAt]: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // 追踪失败不影响用户体验
  }
}

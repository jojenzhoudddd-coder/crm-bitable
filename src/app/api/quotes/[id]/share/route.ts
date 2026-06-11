import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { QUOTE_TABLE } from '@/lib/bitable/tables';
import { getText } from '@/lib/bitable/helpers';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const f = QUOTE_TABLE.fields;

    // 获取现有报价记录
    const record = await bitable.getRecord(QUOTE_TABLE.id(), id);
    let shareToken = getText(record.fields[f.shareToken]);
    let shareUrl = getText(record.fields[f.shareUrl]);

    // 如果已有分享链接则直接返回
    if (shareUrl) {
      return NextResponse.json({
        success: true,
        data: { shareToken, shareUrl },
      });
    }

    // 生成分享 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (!shareToken) {
      shareToken = crypto.randomUUID();
    }
    shareUrl = `${baseUrl}/share/${shareToken}`;

    // 更新记录
    await bitable.updateRecord(QUOTE_TABLE.id(), id, {
      [f.shareToken]: shareToken,
      [f.shareUrl]: shareUrl,
      [f.status]: '已发出',
    });

    return NextResponse.json({
      success: true,
      data: { shareToken, shareUrl },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

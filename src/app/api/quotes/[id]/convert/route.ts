import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import {
  QUOTE_TABLE,
  ORDER_TABLE,
  OPPORTUNITY_TABLE,
  CONFIG_ITEM_TABLE,
} from '@/lib/bitable/tables';
import {
  getText,
  getNumber,
  getOption,
  getFirstLinkId,
  buildSingleLink,
} from '@/lib/bitable/helpers';
import type { FieldValue } from '@/lib/bitable/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;

    // 1. 获取报价单
    const quoteRecord = await bitable.getRecord(QUOTE_TABLE.id(), quoteId);
    const qf = QUOTE_TABLE.fields;
    const status = getOption(quoteRecord.fields[qf.status]);

    if (status !== '客户确认') {
      return NextResponse.json(
        { success: false, error: '只有"客户确认"状态的报价单可以转订单' },
        { status: 400 }
      );
    }

    const opportunityId = getFirstLinkId(quoteRecord.fields[qf.opportunity]);
    const quoteName = getText(quoteRecord.fields[qf.name]);
    const totalAmount = getNumber(quoteRecord.fields[qf.totalAmount]);
    const snapshot = getText(quoteRecord.fields[qf.snapshot]);
    const customerName = getText(quoteRecord.fields[qf.customer]);

    // 2. 创建正式订单
    const orf = ORDER_TABLE.fields;
    const orderFields: Record<string, FieldValue> = {
      [orf.name]: quoteName.replace('报价单', '订单'),
      [orf.sourceQuote]: buildSingleLink(quoteId),
      [orf.customer]: customerName,
      [orf.amount]: totalAmount,
      [orf.snapshot]: snapshot,
      [orf.status]: '待执行',
      [orf.signDate]: Date.now(),
    };

    if (opportunityId) {
      orderFields[orf.opportunity] = buildSingleLink(opportunityId);
    }

    const orderRecord = await bitable.createRecord(ORDER_TABLE.id(), orderFields);

    // 3. 更新报价单状态
    await bitable.updateRecord(QUOTE_TABLE.id(), quoteId, {
      [qf.status]: '已转订单',
      [qf.order]: buildSingleLink(orderRecord.record_id),
    });

    // 4. 更新配置清单状态
    if (opportunityId) {
      const cif = CONFIG_ITEM_TABLE.fields;
      const configRecords = await bitable.searchAllRecords(CONFIG_ITEM_TABLE.id(), {
        filter: {
          conjunction: 'and',
          conditions: [
            { field_name: cif.opportunity, operator: 'contains', value: [opportunityId] },
          ],
        },
      });

      if (configRecords.length > 0) {
        const updates = configRecords.map((r) => ({
          record_id: r.record_id,
          fields: { [cif.status]: '已转订单' as FieldValue },
        }));
        await bitable.batchUpdateRecords(CONFIG_ITEM_TABLE.id(), updates);
      }
    }

    // 5. 更新商机阶段
    if (opportunityId) {
      const of = OPPORTUNITY_TABLE.fields;
      await bitable.updateRecord(OPPORTUNITY_TABLE.id(), opportunityId, {
        [of.stage]: '签约赢单',
        [of.orders]: buildSingleLink(orderRecord.record_id),
      });
    }

    return NextResponse.json({
      success: true,
      data: { orderId: orderRecord.record_id },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { OPPORTUNITY_TABLE } from '@/lib/bitable/tables';
import {
  getText,
  getNumber,
  getOption,
  getLinkIds,
  getLinkTexts,
  getPersons,
} from '@/lib/bitable/helpers';
import type { Opportunity } from '@/types';
import type { FilterCondition } from '@/lib/bitable/types';

function mapOpportunity(record: { record_id: string; fields: Record<string, unknown> }): Opportunity {
  const fields = record.fields as Record<string, import('@/lib/bitable/types').FieldValue>;
  const f = OPPORTUNITY_TABLE.fields;
  const persons = getPersons(fields[f.owner]);

  return {
    id: record.record_id,
    name: getText(fields[f.name]),
    customerName: getLinkTexts(fields[f.customer])[0] || '',
    customerId: getLinkIds(fields[f.customer])[0] || null,
    stage: getOption(fields[f.stage]),
    amount: getNumber(fields[f.amount]),
    expectedDate: null, // 日期字段后续处理
    ownerName: persons[0]?.name || '',
    configTotal: getNumber(fields[f.configTotal]),
    latestQuoteAmount: getNumber(fields[f.latestQuoteAmount]),
    quoteIds: getLinkIds(fields[f.quotes]),
    orderIds: getLinkIds(fields[f.orders]),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const stage = searchParams.get('stage') || '';
    const keyword = searchParams.get('keyword') || '';
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const f = OPPORTUNITY_TABLE.fields;
    const conditions: FilterCondition[] = [];

    if (stage) {
      conditions.push({
        field_name: f.stage,
        operator: 'is',
        value: [stage],
      });
    }

    if (keyword) {
      conditions.push({
        field_name: f.name,
        operator: 'contains',
        value: [keyword],
      });
    }

    const res = await bitable.searchRecords(OPPORTUNITY_TABLE.id(), {
      filter: conditions.length > 0
        ? { conjunction: 'and', conditions }
        : undefined,
      page_size: pageSize,
    });

    const items = (res.items || []).map(mapOpportunity);

    return NextResponse.json({
      success: true,
      data: { items, total: res.total, hasMore: res.has_more },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const f = OPPORTUNITY_TABLE.fields;

    const fields: Record<string, unknown> = {
      [f.name]: body.name,
      [f.stage]: body.stage || '初步接洽',
      [f.amount]: body.amount || 0,
    };

    if (body.customerId) {
      fields[f.customer] = [{ record_id: body.customerId }];
    }

    const record = await bitable.createRecord(
      OPPORTUNITY_TABLE.id(),
      fields as Record<string, import('@/lib/bitable/types').FieldValue>
    );

    return NextResponse.json({
      success: true,
      data: mapOpportunity(record),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { ORDER_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber, getOption, getFirstLinkId, getPersons } from '@/lib/bitable/helpers';
import type { Order, QuoteSnapshot } from '@/types';
import type { FieldValue } from '@/lib/bitable/types';

function mapOrder(record: { record_id: string; fields: Record<string, FieldValue> }): Order {
  const fields = record.fields;
  const f = ORDER_TABLE.fields;
  const persons = getPersons(fields[f.owner]);

  let snapshot: QuoteSnapshot | null = null;
  const snapshotStr = getText(fields[f.snapshot]);
  if (snapshotStr) {
    try { snapshot = JSON.parse(snapshotStr); } catch { /* ignore */ }
  }

  return {
    id: record.record_id,
    number: getText(fields[f.number]),
    name: getText(fields[f.name]),
    sourceQuoteId: getFirstLinkId(fields[f.sourceQuote]),
    opportunityId: getFirstLinkId(fields[f.opportunity]),
    customerName: getText(fields[f.customer]),
    amount: getNumber(fields[f.amount]),
    snapshot,
    status: getOption(fields[f.status]),
    signDate: null,
    ownerName: persons[0]?.name || '',
    note: getText(fields[f.note]),
    createdAt: null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || '';
    const f = ORDER_TABLE.fields;

    const conditions = status
      ? [{ field_name: f.status, operator: 'is' as const, value: [status] }]
      : [];

    const res = await bitable.searchRecords(ORDER_TABLE.id(), {
      filter: conditions.length > 0 ? { conjunction: 'and', conditions } : undefined,
      page_size: 50,
    });

    const items = (res.items || []).map(mapOrder);
    return NextResponse.json({ success: true, data: { items, total: res.total } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

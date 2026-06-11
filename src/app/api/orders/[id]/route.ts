import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { ORDER_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber, getOption, getFirstLinkId, getPersons } from '@/lib/bitable/helpers';
import type { Order, QuoteSnapshot } from '@/types';
import type { FieldValue } from '@/lib/bitable/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await bitable.getRecord(ORDER_TABLE.id(), id);
    const fields = record.fields;
    const f = ORDER_TABLE.fields;
    const persons = getPersons(fields[f.owner]);

    let snapshot: QuoteSnapshot | null = null;
    const snapshotStr = getText(fields[f.snapshot]);
    if (snapshotStr) {
      try { snapshot = JSON.parse(snapshotStr); } catch { /* ignore */ }
    }

    const order: Order = {
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

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const f = ORDER_TABLE.fields;
    const fields: Record<string, FieldValue> = {};

    if (body.status !== undefined) fields[f.status] = body.status;
    if (body.note !== undefined) fields[f.note] = body.note;

    await bitable.updateRecord(ORDER_TABLE.id(), id, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await bitable.deleteRecord(ORDER_TABLE.id(), id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

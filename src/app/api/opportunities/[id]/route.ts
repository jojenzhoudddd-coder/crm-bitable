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
import type { FieldValue } from '@/lib/bitable/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await bitable.getRecord(OPPORTUNITY_TABLE.id(), id);
    const fields = record.fields;
    const f = OPPORTUNITY_TABLE.fields;
    const persons = getPersons(fields[f.owner]);

    const opportunity: Opportunity = {
      id: record.record_id,
      name: getText(fields[f.name]),
      customerName: getLinkTexts(fields[f.customer])[0] || '',
      customerId: getLinkIds(fields[f.customer])[0] || null,
      stage: getOption(fields[f.stage]),
      amount: getNumber(fields[f.amount]),
      expectedDate: null,
      ownerName: persons[0]?.name || '',
      configTotal: getNumber(fields[f.configTotal]),
      latestQuoteAmount: getNumber(fields[f.latestQuoteAmount]),
      quoteIds: getLinkIds(fields[f.quotes]),
      orderIds: getLinkIds(fields[f.orders]),
    };

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const f = OPPORTUNITY_TABLE.fields;
    const fields: Record<string, FieldValue> = {};

    if (body.name !== undefined) fields[f.name] = body.name;
    if (body.stage !== undefined) fields[f.stage] = body.stage;
    if (body.amount !== undefined) fields[f.amount] = body.amount;

    await bitable.updateRecord(OPPORTUNITY_TABLE.id(), id, fields);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await bitable.deleteRecord(OPPORTUNITY_TABLE.id(), id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { QUOTE_TABLE } from '@/lib/bitable/tables';
import {
  getText,
  getNumber,
  getOption,
  getFirstLinkId,
  getLinkTexts,
  getPersons,
} from '@/lib/bitable/helpers';
import type { Quote, QuoteSnapshot } from '@/types';
import type { FieldValue } from '@/lib/bitable/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await bitable.getRecord(QUOTE_TABLE.id(), id);
    const fields = record.fields;
    const f = QUOTE_TABLE.fields;
    const persons = getPersons(fields[f.owner]);

    let snapshot: QuoteSnapshot | null = null;
    const snapshotStr = getText(fields[f.snapshot]);
    if (snapshotStr) {
      try {
        snapshot = JSON.parse(snapshotStr);
      } catch { /* ignore */ }
    }

    const quote: Quote = {
      id: record.record_id,
      number: getText(fields[f.number]),
      name: getText(fields[f.name]),
      opportunityId: getFirstLinkId(fields[f.opportunity]),
      opportunityName: getLinkTexts(fields[f.opportunity])[0] || '',
      customerName: getText(fields[f.customer]),
      contactName: getText(fields[f.contactName]),
      contactPhone: getText(fields[f.contactPhone]),
      contactAddress: getText(fields[f.contactAddress]),
      subtotal: getNumber(fields[f.subtotal]),
      wholeDiscount: getNumber(fields[f.wholeDiscount]) || 1,
      totalAmount: getNumber(fields[f.totalAmount]),
      status: getOption(fields[f.status]),
      validUntil: null,
      ownerName: persons[0]?.name || '',
      salesContact: getText(fields[f.salesContact]),
      shareToken: getText(fields[f.shareToken]),
      shareUrl: getText(fields[f.shareUrl]),
      viewCount: getNumber(fields[f.viewCount]),
      lastViewedAt: null,
      note: getText(fields[f.note]),
      orderId: getFirstLinkId(fields[f.order]),
      snapshot,
      createdAt: null,
    };

    return NextResponse.json({ success: true, data: quote });
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
    const f = QUOTE_TABLE.fields;
    const fields: Record<string, FieldValue> = {};

    if (body.status !== undefined) fields[f.status] = body.status;
    if (body.wholeDiscount !== undefined) fields[f.wholeDiscount] = body.wholeDiscount;
    if (body.note !== undefined) fields[f.note] = body.note;
    if (body.name !== undefined) fields[f.name] = body.name;

    await bitable.updateRecord(QUOTE_TABLE.id(), id, fields);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

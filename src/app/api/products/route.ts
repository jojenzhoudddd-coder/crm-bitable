import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { PRODUCT_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber, getOption, getAttachmentUrls } from '@/lib/bitable/helpers';
import type { Product } from '@/types';
import type { FilterCondition, FieldValue } from '@/lib/bitable/types';

function mapProduct(record: { record_id: string; fields: Record<string, FieldValue> }): Product {
  const fields = record.fields;
  const f = PRODUCT_TABLE.fields;
  return {
    id: record.record_id,
    name: getText(fields[f.name]),
    code: getText(fields[f.code]),
    category: getOption(fields[f.category]),
    subCategory: getOption(fields[f.subCategory]),
    description: getText(fields[f.description]),
    imageUrl: getAttachmentUrls(fields[f.image])[0] || '',
    unit: getOption(fields[f.unit]),
    price: getNumber(fields[f.price]),
    minDiscount: getNumber(fields[f.minDiscount]) || 0.5,
    status: getOption(fields[f.status]),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const f = PRODUCT_TABLE.fields;
    const conditions: FilterCondition[] = [];

    if (status) {
      conditions.push({ field_name: f.status, operator: 'is', value: [status] });
    }
    if (keyword) {
      conditions.push({ field_name: f.name, operator: 'contains', value: [keyword] });
    }
    if (category) {
      conditions.push({ field_name: f.category, operator: 'is', value: [category] });
    }

    const res = await bitable.searchRecords(PRODUCT_TABLE.id(), {
      filter: conditions.length > 0 ? { conjunction: 'and', conditions } : undefined,
      page_size: pageSize,
    });

    const products = (res.items || []).map(mapProduct);

    return NextResponse.json({
      success: true,
      data: { items: products, total: res.total, hasMore: res.has_more },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const f = PRODUCT_TABLE.fields;
    const fields: Record<string, FieldValue> = {
      [f.name]: body.name,
      [f.code]: body.code || '',
      [f.category]: body.category || '',
      [f.subCategory]: body.subCategory || '',
      [f.description]: body.description || '',
      [f.unit]: body.unit || '个',
      [f.price]: body.price || 0,
      [f.minDiscount]: body.minDiscount || 0.5,
      [f.status]: body.status || '在售',
    };
    const record = await bitable.createRecord(PRODUCT_TABLE.id(), fields);
    return NextResponse.json({ success: true, data: mapProduct(record) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

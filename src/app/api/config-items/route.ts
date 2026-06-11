import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { CONFIG_ITEM_TABLE, PRODUCT_TABLE } from '@/lib/bitable/tables';
import {
  getText,
  getNumber,
  getOption,
  getFirstLinkId,
  buildSingleLink,
} from '@/lib/bitable/helpers';
import { calcItemPrice } from '@/lib/price';
import type { ConfigItem } from '@/types';
import type { FieldValue } from '@/lib/bitable/types';

function mapConfigItem(record: { record_id: string; fields: Record<string, FieldValue> }): ConfigItem {
  const fields = record.fields;
  const f = CONFIG_ITEM_TABLE.fields;

  const standardPrice = getNumber(fields[f.standardPrice]);
  const quantity = getNumber(fields[f.quantity]) || 1;
  const discountRate = getNumber(fields[f.discountRate]) || 1;
  const { unitPrice, subtotal } = calcItemPrice({ standardPrice, quantity, discountRate });

  return {
    id: record.record_id,
    opportunityId: getFirstLinkId(fields[f.opportunity]) || '',
    productId: getFirstLinkId(fields[f.product]) || '',
    productName: getText(fields[f.productName]),
    productCode: getText(fields[f.productCode]),
    standardPrice,
    quantity,
    discountRate,
    unitPrice,
    subtotal,
    note: getText(fields[f.note]),
    sortOrder: getNumber(fields[f.sortOrder]),
    status: getOption(fields[f.status]),
    quoteId: getFirstLinkId(fields[f.quote]),
  };
}

export async function GET(request: NextRequest) {
  try {
    const opportunityId = request.nextUrl.searchParams.get('opportunityId');

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: 'opportunityId is required' },
        { status: 400 }
      );
    }

    const f = CONFIG_ITEM_TABLE.fields;

    const records = await bitable.searchAllRecords(CONFIG_ITEM_TABLE.id(), {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: f.opportunity,
            operator: 'contains',
            value: [opportunityId],
          },
        ],
      },
      sort: [{ field_name: f.sortOrder, desc: false }],
    });

    const items = records.map(mapConfigItem);

    return NextResponse.json({ success: true, data: items });
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
    const { opportunityId, productId, quantity = 1, discountRate = 1, note = '', sortOrder = 0 } = body;

    if (!opportunityId || !productId) {
      return NextResponse.json(
        { success: false, error: 'opportunityId and productId are required' },
        { status: 400 }
      );
    }

    // 获取产品信息
    const product = await bitable.getRecord(PRODUCT_TABLE.id(), productId);
    const pf = PRODUCT_TABLE.fields;
    const standardPrice = getNumber(product.fields[pf.price]);

    const { unitPrice, subtotal } = calcItemPrice({
      standardPrice,
      quantity,
      discountRate,
    });

    const f = CONFIG_ITEM_TABLE.fields;
    const fields: Record<string, FieldValue> = {
      [f.opportunity]: buildSingleLink(opportunityId),
      [f.product]: buildSingleLink(productId),
      [f.quantity]: quantity,
      [f.discountRate]: discountRate,
      [f.unitPrice]: unitPrice,
      [f.subtotal]: subtotal,
      [f.note]: note,
      [f.sortOrder]: sortOrder,
      [f.status]: '草稿',
    };

    const record = await bitable.createRecord(CONFIG_ITEM_TABLE.id(), fields);

    return NextResponse.json({
      success: true,
      data: mapConfigItem(record),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

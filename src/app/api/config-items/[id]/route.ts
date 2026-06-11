import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { CONFIG_ITEM_TABLE } from '@/lib/bitable/tables';
import { calcItemPrice } from '@/lib/price';
import type { FieldValue } from '@/lib/bitable/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const f = CONFIG_ITEM_TABLE.fields;
    const fields: Record<string, FieldValue> = {};

    if (body.quantity !== undefined) fields[f.quantity] = body.quantity;
    if (body.discountRate !== undefined) fields[f.discountRate] = body.discountRate;
    if (body.note !== undefined) fields[f.note] = body.note;
    if (body.sortOrder !== undefined) fields[f.sortOrder] = body.sortOrder;
    if (body.status !== undefined) fields[f.status] = body.status;

    // 如果更新了数量或折扣，重新计算价格
    if (body.quantity !== undefined || body.discountRate !== undefined) {
      // 先获取当前记录
      const current = await bitable.getRecord(CONFIG_ITEM_TABLE.id(), id);
      const currentFields = current.fields;

      const standardPrice =
        typeof currentFields[f.standardPrice] === 'number'
          ? (currentFields[f.standardPrice] as number)
          : 0;
      const quantity = body.quantity ?? (currentFields[f.quantity] as number) ?? 1;
      const discountRate =
        body.discountRate ?? (currentFields[f.discountRate] as number) ?? 1;

      const { unitPrice, subtotal } = calcItemPrice({
        standardPrice,
        quantity,
        discountRate,
      });

      fields[f.unitPrice] = unitPrice;
      fields[f.subtotal] = subtotal;
    }

    await bitable.updateRecord(CONFIG_ITEM_TABLE.id(), id, fields);

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
    await bitable.deleteRecord(CONFIG_ITEM_TABLE.id(), id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

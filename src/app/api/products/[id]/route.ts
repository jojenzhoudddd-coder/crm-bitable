import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { PRODUCT_TABLE } from '@/lib/bitable/tables';
import type { FieldValue } from '@/lib/bitable/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const f = PRODUCT_TABLE.fields;
    const fields: Record<string, FieldValue> = {};

    if (body.name !== undefined) fields[f.name] = body.name;
    if (body.code !== undefined) fields[f.code] = body.code;
    if (body.category !== undefined) fields[f.category] = body.category;
    if (body.subCategory !== undefined) fields[f.subCategory] = body.subCategory;
    if (body.description !== undefined) fields[f.description] = body.description;
    if (body.unit !== undefined) fields[f.unit] = body.unit;
    if (body.price !== undefined) fields[f.price] = body.price;
    if (body.minDiscount !== undefined) fields[f.minDiscount] = body.minDiscount;
    if (body.status !== undefined) fields[f.status] = body.status;

    await bitable.updateRecord(PRODUCT_TABLE.id(), id, fields);
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
    await bitable.deleteRecord(PRODUCT_TABLE.id(), id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

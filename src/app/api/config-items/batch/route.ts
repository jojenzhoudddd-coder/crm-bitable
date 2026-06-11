import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { CONFIG_ITEM_TABLE, PRODUCT_TABLE } from '@/lib/bitable/tables';
import { getNumber, buildSingleLink } from '@/lib/bitable/helpers';
import { calcItemPrice } from '@/lib/price';
import type { FieldValue } from '@/lib/bitable/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, items } = body as {
      opportunityId: string;
      items: Array<{
        productId: string;
        quantity?: number;
        discountRate?: number;
        note?: string;
      }>;
    };

    if (!opportunityId || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'opportunityId and items are required' },
        { status: 400 }
      );
    }

    // 获取所有产品信息
    const productPrices = new Map<string, number>();
    for (const item of items) {
      if (!productPrices.has(item.productId)) {
        const product = await bitable.getRecord(PRODUCT_TABLE.id(), item.productId);
        productPrices.set(
          item.productId,
          getNumber(product.fields[PRODUCT_TABLE.fields.price])
        );
      }
    }

    const f = CONFIG_ITEM_TABLE.fields;
    const records = items.map((item, index) => {
      const standardPrice = productPrices.get(item.productId) || 0;
      const quantity = item.quantity || 1;
      const discountRate = item.discountRate || 1;
      const { unitPrice, subtotal } = calcItemPrice({
        standardPrice,
        quantity,
        discountRate,
      });

      const fields: Record<string, FieldValue> = {
        [f.opportunity]: buildSingleLink(opportunityId),
        [f.product]: buildSingleLink(item.productId),
        [f.quantity]: quantity,
        [f.discountRate]: discountRate,
        [f.unitPrice]: unitPrice,
        [f.subtotal]: subtotal,
        [f.note]: item.note || '',
        [f.sortOrder]: index + 1,
        [f.status]: '草稿',
      };

      return { fields };
    });

    const created = await bitable.batchCreateRecords(
      CONFIG_ITEM_TABLE.id(),
      records
    );

    return NextResponse.json({
      success: true,
      data: { count: created.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { PRODUCT_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber, getOption, getAttachmentUrls } from '@/lib/bitable/helpers';
import type { Product } from '@/types';
import type { FilterCondition } from '@/lib/bitable/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const f = PRODUCT_TABLE.fields;
    const conditions: FilterCondition[] = [];

    // 只返回在售产品
    conditions.push({
      field_name: f.status,
      operator: 'is',
      value: ['在售'],
    });

    if (keyword) {
      conditions.push({
        field_name: f.name,
        operator: 'contains',
        value: [keyword],
      });
    }

    if (category) {
      conditions.push({
        field_name: f.category,
        operator: 'is',
        value: [category],
      });
    }

    const res = await bitable.searchRecords(PRODUCT_TABLE.id(), {
      filter: conditions.length > 0
        ? { conjunction: 'and', conditions }
        : undefined,
      page_size: pageSize,
    });

    const products: Product[] = (res.items || []).map((record) => {
      const fields = record.fields;
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
    });

    return NextResponse.json({
      success: true,
      data: {
        items: products,
        total: res.total,
        page,
        pageSize,
        hasMore: res.has_more,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

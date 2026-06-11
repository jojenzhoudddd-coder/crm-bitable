import { NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { PRODUCT_TABLE } from '@/lib/bitable/tables';
import { getOption } from '@/lib/bitable/helpers';

export async function GET() {
  try {
    const f = PRODUCT_TABLE.fields;

    // 获取所有产品，提取分类去重
    const records = await bitable.searchAllRecords(PRODUCT_TABLE.id(), {
      field_names: [f.category, f.subCategory],
      filter: {
        conjunction: 'and',
        conditions: [
          { field_name: f.status, operator: 'is', value: ['在售'] },
        ],
      },
    });

    const categoryMap = new Map<string, Set<string>>();

    for (const record of records) {
      const cat = getOption(record.fields[f.category]);
      const subCat = getOption(record.fields[f.subCategory]);
      if (cat) {
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, new Set());
        }
        if (subCat) {
          categoryMap.get(cat)!.add(subCat);
        }
      }
    }

    const categories = Array.from(categoryMap.entries()).map(
      ([name, subs]) => ({
        name,
        subCategories: Array.from(subs),
      })
    );

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

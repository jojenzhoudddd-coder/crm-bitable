import { NextResponse } from 'next/server';
import { bitable } from '@/lib/bitable';
import { COMPANY_INFO_TABLE } from '@/lib/bitable/tables';
import { getText, getNumber } from '@/lib/bitable/helpers';

export async function GET() {
  try {
    const f = COMPANY_INFO_TABLE.fields;

    const records = await bitable.searchRecords(COMPANY_INFO_TABLE.id(), {
      page_size: 1,
    });

    if (!records.items?.length) {
      // 返回默认值
      return NextResponse.json({
        success: true,
        data: {
          name: '公司名称',
          address: '',
          phone: '',
          taxId: '',
          bank: '',
          bankAccount: '',
          logoUrl: '',
          stampUrl: '',
          defaultValidDays: 30,
        },
      });
    }

    const fields = records.items[0].fields;

    return NextResponse.json({
      success: true,
      data: {
        name: getText(fields[f.name]),
        address: getText(fields[f.address]),
        phone: getText(fields[f.phone]),
        taxId: getText(fields[f.taxId]),
        bank: getText(fields[f.bank]),
        bankAccount: getText(fields[f.bankAccount]),
        logoUrl: getText(fields[f.logoUrl]),
        stampUrl: getText(fields[f.stampUrl]),
        defaultValidDays: getNumber(fields[f.defaultValidDays]) || 30,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

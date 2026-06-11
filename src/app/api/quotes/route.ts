import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { bitable } from '@/lib/bitable';
import {
  QUOTE_TABLE,
  CONFIG_ITEM_TABLE,
  OPPORTUNITY_TABLE,
  PRODUCT_TABLE,
  CUSTOMER_TABLE,
} from '@/lib/bitable/tables';
import {
  getText,
  getNumber,
  getOption,
  getFirstLinkId,
  getLinkTexts,
  getPersons,
  buildSingleLink,
} from '@/lib/bitable/helpers';
import { calcItemPrice, calcSummary } from '@/lib/price';
import type { Quote, QuoteSnapshot, QuoteSnapshotItem } from '@/types';
import type { FieldValue } from '@/lib/bitable/types';

function mapQuote(record: { record_id: string; fields: Record<string, FieldValue> }): Quote {
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

  return {
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
    validUntil: null, // 日期字段
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
}

// GET 报价列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') || '';
    const opportunityId = searchParams.get('opportunityId') || '';

    const f = QUOTE_TABLE.fields;
    const conditions = [];

    if (status) {
      conditions.push({ field_name: f.status, operator: 'is' as const, value: [status] });
    }
    if (opportunityId) {
      conditions.push({
        field_name: f.opportunity,
        operator: 'contains' as const,
        value: [opportunityId],
      });
    }

    const res = await bitable.searchRecords(QUOTE_TABLE.id(), {
      filter: conditions.length > 0
        ? { conjunction: 'and', conditions }
        : undefined,
      page_size: 50,
    });

    const items = (res.items || []).map(mapQuote);

    return NextResponse.json({
      success: true,
      data: { items, total: res.total },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST 从配置清单生成报价
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, name, wholeDiscount = 1, validDays = 30, note = '' } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: 'opportunityId is required' },
        { status: 400 }
      );
    }

    // 1. 获取商机信息
    const opportunity = await bitable.getRecord(OPPORTUNITY_TABLE.id(), opportunityId);
    const of = OPPORTUNITY_TABLE.fields;
    const oppName = getText(opportunity.fields[of.name]);
    const customerId = getFirstLinkId(opportunity.fields[of.customer]);

    // 获取客户信息
    let customerName = '';
    let contactName = '';
    let contactPhone = '';
    let contactAddress = '';
    if (customerId) {
      const customer = await bitable.getRecord(CUSTOMER_TABLE.id(), customerId);
      const cf = CUSTOMER_TABLE.fields;
      customerName = getText(customer.fields[cf.name]);
      contactName = getText(customer.fields[cf.contact]);
      contactPhone = getText(customer.fields[cf.phone]);
      contactAddress = getText(customer.fields[cf.address]);
    }

    // 2. 获取配置清单
    const cif = CONFIG_ITEM_TABLE.fields;
    const configRecords = await bitable.searchAllRecords(CONFIG_ITEM_TABLE.id(), {
      filter: {
        conjunction: 'and',
        conditions: [
          { field_name: cif.opportunity, operator: 'contains', value: [opportunityId] },
        ],
      },
      sort: [{ field_name: cif.sortOrder, desc: false }],
    });

    if (!configRecords.length) {
      return NextResponse.json(
        { success: false, error: '配置清单为空，无法生成报价' },
        { status: 400 }
      );
    }

    // 3. 构建产品快照
    const snapshotItems: QuoteSnapshotItem[] = [];
    const priceInputs = [];

    for (const record of configRecords) {
      const standardPrice = getNumber(record.fields[cif.standardPrice]);
      const quantity = getNumber(record.fields[cif.quantity]) || 1;
      const discountRate = getNumber(record.fields[cif.discountRate]) || 1;
      const { unitPrice, subtotal } = calcItemPrice({ standardPrice, quantity, discountRate });

      // 获取产品详细信息
      const productId = getFirstLinkId(record.fields[cif.product]) || '';
      let unit = '';
      let productCode = getText(record.fields[cif.productCode]);
      const productName = getText(record.fields[cif.productName]);

      if (productId) {
        try {
          const product = await bitable.getRecord(PRODUCT_TABLE.id(), productId);
          unit = getOption(product.fields[PRODUCT_TABLE.fields.unit]);
          if (!productCode) productCode = getText(product.fields[PRODUCT_TABLE.fields.code]);
        } catch { /* fallback to config item data */ }
      }

      snapshotItems.push({
        productId,
        productCode,
        productName,
        unit,
        standardPrice,
        quantity,
        discountRate,
        unitPrice,
        subtotal,
        note: getText(record.fields[cif.note]),
      });

      priceInputs.push({ standardPrice, quantity, discountRate });
    }

    const summary = calcSummary(priceInputs, wholeDiscount);

    const snapshot: QuoteSnapshot = {
      generatedAt: new Date().toISOString(),
      items: snapshotItems,
      summary: {
        totalQuantity: summary.totalQuantity,
        itemSubtotal: summary.itemSubtotal,
        wholeDiscount: summary.wholeDiscount,
        discountedTotal: summary.discountedTotal,
      },
    };

    // 4. 创建报价订单
    const qf = QUOTE_TABLE.fields;
    const shareToken = uuidv4();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const quoteFields: Record<string, FieldValue> = {
      [qf.name]: name || `${oppName} 报价单`,
      [qf.opportunity]: buildSingleLink(opportunityId),
      [qf.customer]: customerName,
      [qf.contactName]: contactName,
      [qf.contactPhone]: contactPhone,
      [qf.contactAddress]: contactAddress,
      [qf.snapshot]: JSON.stringify(snapshot),
      [qf.totalQuantity]: summary.totalQuantity,
      [qf.subtotal]: summary.itemSubtotal,
      [qf.wholeDiscount]: wholeDiscount,
      [qf.totalAmount]: summary.discountedTotal,
      [qf.status]: '草稿',
      [qf.validUntil]: validUntil.getTime(),
      [qf.shareToken]: shareToken,
      [qf.viewCount]: 0,
      [qf.note]: note,
    };

    const quoteRecord = await bitable.createRecord(QUOTE_TABLE.id(), quoteFields);

    // 5. 回填配置清单状态
    const configUpdates = configRecords.map((r) => ({
      record_id: r.record_id,
      fields: {
        [cif.status]: '已生成报价' as FieldValue,
        [cif.quote]: buildSingleLink(quoteRecord.record_id) as FieldValue,
      },
    }));
    await bitable.batchUpdateRecords(CONFIG_ITEM_TABLE.id(), configUpdates);

    // 6. 回填商机关联报价
    await bitable.updateRecord(OPPORTUNITY_TABLE.id(), opportunityId, {
      [of.quotes]: buildSingleLink(quoteRecord.record_id),
      [of.stage]: '方案报价',
    });

    return NextResponse.json({
      success: true,
      data: mapQuote(quoteRecord),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

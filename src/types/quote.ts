/** 报价订单 */
export interface Quote {
  id: string;
  number: string;
  name: string;
  opportunityId: string | null;
  opportunityName: string;
  customerName: string;
  contactName: string;
  contactPhone: string;
  contactAddress: string;
  subtotal: number;
  wholeDiscount: number;
  totalAmount: number;
  status: string;
  validUntil: string | null;
  ownerName: string;
  salesContact: string;
  shareToken: string;
  shareUrl: string;
  viewCount: number;
  lastViewedAt: string | null;
  note: string;
  orderId: string | null;
  snapshot: QuoteSnapshot | null;
  createdAt: string | null;
}

/** 产品明细快照 */
export interface QuoteSnapshot {
  generatedAt: string;
  items: QuoteSnapshotItem[];
  summary: QuoteSnapshotSummary;
}

/** 快照中的产品项 */
export interface QuoteSnapshotItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  standardPrice: number;
  quantity: number;
  discountRate: number;
  unitPrice: number;
  subtotal: number;
  note: string;
}

/** 快照汇总 */
export interface QuoteSnapshotSummary {
  totalQuantity: number;
  itemSubtotal: number;
  wholeDiscount: number;
  discountedTotal: number;
}

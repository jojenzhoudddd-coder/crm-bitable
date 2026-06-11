/** 商机 */
export interface Opportunity {
  id: string;
  name: string;
  customerName: string;
  customerId: string | null;
  stage: string;
  amount: number;
  expectedDate: string | null;
  ownerName: string;
  configTotal: number;
  latestQuoteAmount: number;
  quoteIds: string[];
  orderIds: string[];
}

/** 配置清单项 */
export interface ConfigItem {
  id: string;
  opportunityId: string;
  productId: string;
  productName: string;
  productCode: string;
  standardPrice: number;
  quantity: number;
  discountRate: number; // 0-1
  unitPrice: number; // 计算值
  subtotal: number; // 计算值
  note: string;
  sortOrder: number;
  status: string;
  quoteId: string | null;
}

/** 配置清单汇总 */
export interface ConfigSummary {
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
}

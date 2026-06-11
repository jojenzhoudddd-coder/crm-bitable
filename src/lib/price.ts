/**
 * 价格计算引擎（纯函数，前后端共用）
 * 所有金额保留 2 位小数
 */

/** 单项计算输入 */
export interface PriceInput {
  standardPrice: number;
  quantity: number;
  discountRate: number; // 0-1，如 0.85 = 85 折
}

/** 单项计算结果 */
export interface PriceResult {
  unitPrice: number;
  subtotal: number;
}

/** 汇总计算结果 */
export interface PriceSummary {
  totalItems: number;
  totalQuantity: number;
  itemSubtotal: number;
  wholeDiscount: number;
  discountedTotal: number;
}

/** 保留 2 位小数 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 计算单项价格 */
export function calcItemPrice(input: PriceInput): PriceResult {
  const unitPrice = round2(input.standardPrice * input.discountRate);
  const subtotal = round2(unitPrice * input.quantity);
  return { unitPrice, subtotal };
}

/** 计算配置清单汇总 */
export function calcSummary(
  items: PriceInput[],
  wholeDiscount: number = 1
): PriceSummary {
  let totalQuantity = 0;
  let itemSubtotal = 0;

  for (const item of items) {
    const { subtotal } = calcItemPrice(item);
    totalQuantity += item.quantity;
    itemSubtotal = round2(itemSubtotal + subtotal);
  }

  const discountedTotal = round2(itemSubtotal * wholeDiscount);

  return {
    totalItems: items.length,
    totalQuantity,
    itemSubtotal,
    wholeDiscount,
    discountedTotal,
  };
}

/** 格式化金额为中文显示 */
export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** 格式化折扣显示 */
export function formatDiscount(rate: number): string {
  if (rate >= 1) return '无折扣';
  const zhekou = rate * 10;
  if (Number.isInteger(zhekou)) return `${zhekou}折`;
  return `${zhekou.toFixed(1)}折`;
}

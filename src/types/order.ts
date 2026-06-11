import type { QuoteSnapshot } from './quote';

/** 正式订单 */
export interface Order {
  id: string;
  number: string;
  name: string;
  sourceQuoteId: string | null;
  opportunityId: string | null;
  customerName: string;
  amount: number;
  snapshot: QuoteSnapshot | null;
  status: string;
  signDate: string | null;
  ownerName: string;
  note: string;
  createdAt: string | null;
}

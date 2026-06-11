/**
 * Bitable 表 ID 和字段名集中映射
 * 所有表和字段引用都通过此文件，改名只需改一处
 */

function env(key: string): string {
  return process.env[key] || '';
}

export const BITABLE_APP_TOKEN = () => env('BITABLE_APP_TOKEN');

// ============ 客户表 ============
export const CUSTOMER_TABLE = {
  id: () => env('TABLE_CUSTOMER_ID'),
  fields: {
    name: '客户名称',
    contact: '联系人',
    phone: '联系电话',
    email: '联系邮箱',
    address: '客户地址',
    level: '客户等级',
    sales: '所属销售',
    opportunities: '关联商机',
  },
} as const;

// ============ 商机表 ============
export const OPPORTUNITY_TABLE = {
  id: () => env('TABLE_OPPORTUNITY_ID'),
  fields: {
    name: '商机名称',
    customer: '关联客户',
    stage: '商机阶段',
    amount: '预计金额',
    expectedDate: '预计成交日期',
    owner: '负责人',
    configItems: '配置清单',
    quotes: '关联报价',
    orders: '关联订单',
    configTotal: '配置总价',
    latestQuoteAmount: '最新报价金额',
  },
} as const;

// 商机阶段选项
export const OPPORTUNITY_STAGES = [
  '初步接洽',
  '需求确认',
  '方案报价',
  '商务谈判',
  '签约赢单',
  '输单',
] as const;

// ============ 产品表 ============
export const PRODUCT_TABLE = {
  id: () => env('TABLE_PRODUCT_ID'),
  fields: {
    name: '产品名称',
    code: '产品编号',
    category: '产品分类',
    subCategory: '产品子分类',
    description: '产品描述',
    image: '产品图片',
    unit: '单位',
    price: '标准单价',
    minDiscount: '最低折扣',
    status: '产品状态',
  },
} as const;

// ============ 配置清单表 ============
export const CONFIG_ITEM_TABLE = {
  id: () => env('TABLE_CONFIG_ITEM_ID'),
  fields: {
    opportunity: '关联商机',
    product: '关联产品',
    productName: '产品名称',
    productCode: '产品编号',
    standardPrice: '标准单价',
    quantity: '数量',
    discountRate: '折扣率',
    unitPrice: '成交单价',
    subtotal: '小计金额',
    note: '备注',
    sortOrder: '排序号',
    status: '配置状态',
    quote: '关联报价',
  },
} as const;

// 配置状态选项
export const CONFIG_STATUSES = ['草稿', '已确认', '已生成报价', '已转订单'] as const;

// ============ 报价订单表 ============
export const QUOTE_TABLE = {
  id: () => env('TABLE_QUOTE_ID'),
  fields: {
    number: '报价单号',
    name: '报价名称',
    opportunity: '关联商机',
    customer: '关联客户',
    contactName: '客户联系人',
    contactPhone: '客户联系电话',
    contactAddress: '客户地址',
    configItems: '关联配置清单',
    snapshot: '产品明细快照',
    totalQuantity: '产品总数量',
    subtotal: '小计金额',
    wholeDiscount: '整单折扣',
    totalAmount: '报价总金额',
    status: '报价状态',
    validUntil: '有效期',
    owner: '负责销售',
    salesContact: '销售联系方式',
    shareToken: '分享Token',
    shareUrl: '分享链接',
    viewCount: '查看次数',
    lastViewedAt: '最后查看时间',
    note: '备注',
    order: '关联订单',
  },
} as const;

// 报价状态选项
export const QUOTE_STATUSES = ['草稿', '已发出', '客户确认', '已过期', '已转订单'] as const;

// ============ 正式订单表 ============
export const ORDER_TABLE = {
  id: () => env('TABLE_ORDER_ID'),
  fields: {
    number: '订单编号',
    name: '订单名称',
    sourceQuote: '来源报价单',
    opportunity: '关联商机',
    customer: '客户名称',
    amount: '订单金额',
    taxRate: '税率',
    taxAmount: '含税金额',
    snapshot: '产品明细快照',
    status: '订单状态',
    signDate: '签约日期',
    owner: '负责销售',
    note: '备注',
  },
} as const;

// 订单状态选项
export const ORDER_STATUSES = ['待执行', '执行中', '已完成', '已取消'] as const;

// ============ 套餐表 ============
export const PACKAGE_TABLE = {
  id: () => env('TABLE_PACKAGE_ID'),
  fields: {
    name: '套餐名称',
    description: '套餐描述',
    category: '套餐分类',
    products: '包含产品',
    price: '套餐价格',
    status: '套餐状态',
  },
} as const;

// ============ 套餐明细表 ============
export const PACKAGE_DETAIL_TABLE = {
  id: () => env('TABLE_PACKAGE_DETAIL_ID'),
  fields: {
    package: '关联套餐',
    product: '关联产品',
    productName: '产品名称',
    quantity: '默认数量',
    discount: '默认折扣',
  },
} as const;

// ============ 常用组合表 ============
export const FAVORITE_TABLE = {
  id: () => env('TABLE_FAVORITE_ID'),
  fields: {
    name: '组合名称',
    owner: '保存人',
    content: '组合内容',
    useCount: '使用次数',
  },
} as const;

// ============ 公司信息表 ============
export const COMPANY_INFO_TABLE = {
  id: () => env('TABLE_COMPANY_INFO_ID'),
  fields: {
    name: '公司名称',
    address: '公司地址',
    phone: '联系电话',
    taxId: '统一社会信用代码',
    bank: '开户银行',
    bankAccount: '银行账号',
    logoUrl: '公司Logo',
    stampUrl: '公章图片',
    defaultValidDays: '报价有效天数默认值',
  },
} as const;

/**
 * 业务常量
 */

// 商机阶段颜色映射
export const STAGE_COLORS: Record<string, string> = {
  初步接洽: 'blue',
  需求确认: 'cyan',
  方案报价: 'orange',
  商务谈判: 'purple',
  签约赢单: 'green',
  输单: 'red',
};

// 配置状态颜色映射
export const CONFIG_STATUS_COLORS: Record<string, string> = {
  草稿: 'default',
  已确认: 'blue',
  已生成报价: 'orange',
  已转订单: 'green',
};

// 报价状态颜色映射
export const QUOTE_STATUS_COLORS: Record<string, string> = {
  草稿: 'default',
  已发出: 'blue',
  客户确认: 'green',
  已过期: 'red',
  已转订单: 'purple',
};

// 订单状态颜色映射
export const ORDER_STATUS_COLORS: Record<string, string> = {
  待执行: 'orange',
  执行中: 'blue',
  已完成: 'green',
  已取消: 'red',
};

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 20;

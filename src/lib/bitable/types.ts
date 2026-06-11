/**
 * 飞书 Bitable API 请求/响应类型定义
 */

// 通用 API 响应
export interface BitableResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 记录字段值类型
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | LinkFieldValue[]
  | PersonFieldValue[]
  | OptionFieldValue
  | DateFieldValue
  | AttachmentFieldValue[];

// 关联字段值
export interface LinkFieldValue {
  record_id: string;
  text?: string;
  table_id?: string;
}

// 人员字段值
export interface PersonFieldValue {
  id: string;
  name?: string;
  en_name?: string;
  email?: string;
  avatar_url?: string;
}

// 单选/多选字段值
export interface OptionFieldValue {
  text?: string;
  id?: string;
}

// 日期字段值
export type DateFieldValue = number; // Unix timestamp in ms

// 附件字段值
export interface AttachmentFieldValue {
  file_token: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  tmp_url?: string;
}

// 记录
export interface BitableRecord {
  record_id: string;
  fields: Record<string, FieldValue>;
}

// 搜索请求
export interface SearchRequest {
  view_id?: string;
  field_names?: string[];
  filter?: FilterInfo;
  sort?: SortInfo[];
  automatic_fields?: boolean;
  page_token?: string;
  page_size?: number;
}

// 筛选条件
export interface FilterInfo {
  conjunction?: 'and' | 'or';
  conditions: FilterCondition[];
}

export interface FilterCondition {
  field_name: string;
  operator:
    | 'is'
    | 'isNot'
    | 'contains'
    | 'doesNotContain'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'isGreater'
    | 'isGreaterEqual'
    | 'isLess'
    | 'isLessEqual';
  value: string[];
}

// 排序
export interface SortInfo {
  field_name: string;
  desc?: boolean;
}

// 搜索响应
export interface SearchResponse {
  items: BitableRecord[];
  has_more: boolean;
  page_token?: string;
  total: number;
}

// 创建/更新记录请求
export interface RecordRequest {
  fields: Record<string, FieldValue>;
}

// 批量创建请求
export interface BatchCreateRequest {
  records: RecordRequest[];
}

// 批量创建响应
export interface BatchCreateResponse {
  records: BitableRecord[];
}

// 字段元信息
export interface FieldMeta {
  field_id: string;
  field_name: string;
  type: number;
  ui_type?: string;
  property?: Record<string, unknown>;
}

// 表元信息
export interface TableMeta {
  table_id: string;
  name: string;
  revision: number;
}

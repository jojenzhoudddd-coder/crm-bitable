/**
 * Bitable 字段值格式化工具
 * 从 Bitable 原始字段值中提取可用数据
 */

import type {
  FieldValue,
  LinkFieldValue,
  PersonFieldValue,
  OptionFieldValue,
  AttachmentFieldValue,
} from './types';

/** 提取文本值 */
export function getText(value: FieldValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '是' : '否';
  // Bitable 文本字段返回 [{text, type}] 数组
  if (Array.isArray(value)) {
    const texts = value
      .filter((v): v is { text: string } => v !== null && typeof v === 'object' && 'text' in v)
      .map((v) => v.text);
    if (texts.length > 0) return texts.join('');
  }
  // 单选字段
  if (typeof value === 'object' && !Array.isArray(value) && 'text' in value) {
    return (value as OptionFieldValue).text || '';
  }
  return '';
}

/** 提取数字值 */
export function getNumber(value: FieldValue): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }
  // 查找引用字段可能返回数组
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'number') return first;
    if (typeof first === 'object' && first !== null && 'text' in first) {
      const n = parseFloat((first as { text: string }).text);
      return isNaN(n) ? 0 : n;
    }
  }
  return 0;
}

/** 提取关联记录 ID 列表 */
export function getLinkIds(value: FieldValue): string[] {
  if (!Array.isArray(value)) return [];
  return (value as LinkFieldValue[])
    .filter((v) => v && v.record_id)
    .map((v) => v.record_id);
}

/** 提取第一个关联记录 ID */
export function getFirstLinkId(value: FieldValue): string | null {
  const ids = getLinkIds(value);
  return ids.length > 0 ? ids[0] : null;
}

/** 提取关联记录文本 */
export function getLinkTexts(value: FieldValue): string[] {
  if (!Array.isArray(value)) return [];
  return (value as LinkFieldValue[])
    .filter((v) => v && v.text)
    .map((v) => v.text!);
}

/** 提取人员信息 */
export function getPersons(value: FieldValue): PersonFieldValue[] {
  if (!Array.isArray(value)) return [];
  return value as PersonFieldValue[];
}

/** 提取单选值 */
export function getOption(value: FieldValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && !Array.isArray(value) && 'text' in value) {
    return (value as OptionFieldValue).text || '';
  }
  return '';
}

/** 提取日期（Bitable 日期字段返回毫秒时间戳） */
export function getDate(value: FieldValue): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return new Date(value);
  return null;
}

/** 提取附件 URL 列表 */
export function getAttachmentUrls(value: FieldValue): string[] {
  if (!Array.isArray(value)) return [];
  return (value as AttachmentFieldValue[])
    .filter((v) => v && (v.tmp_url || v.url))
    .map((v) => v.tmp_url || v.url || '');
}

/** 构建关联字段值 */
export function buildLinkValue(recordIds: string[]): LinkFieldValue[] {
  return recordIds.map((id) => ({ record_id: id }));
}

/** 构建单个关联 */
export function buildSingleLink(recordId: string): LinkFieldValue[] {
  return [{ record_id: recordId }];
}

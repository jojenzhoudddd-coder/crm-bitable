/**
 * Bitable API 客户端
 * 封装认证、请求、分页、错误处理
 */

import { getTenantAccessToken } from './auth';
import { BITABLE_APP_TOKEN } from './tables';
import type {
  BitableRecord,
  BitableResponse,
  SearchRequest,
  SearchResponse,
  RecordRequest,
  BatchCreateResponse,
  FieldValue,
} from './types';

const BASE_URL = 'https://open.feishu.cn/open-apis/bitable/v1';

class BitableClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await getTenantAccessToken();
    const url = `${BASE_URL}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bitable API error: ${res.status} ${text}`);
    }

    const json: BitableResponse<T> = await res.json();

    if (json.code !== 0) {
      throw new Error(`Bitable API error: ${json.msg} (code: ${json.code})`);
    }

    return json.data;
  }

  private tablePath(tableId: string): string {
    return `/apps/${BITABLE_APP_TOKEN()}/tables/${tableId}`;
  }

  /**
   * 搜索记录（单页）
   */
  async searchRecords(
    tableId: string,
    params: Omit<SearchRequest, 'page_token'> & { page_token?: string } = {}
  ): Promise<SearchResponse> {
    const { page_size = 100, ...rest } = params;
    return this.request<SearchResponse>(
      'POST',
      `${this.tablePath(tableId)}/records/search`,
      { page_size, ...rest }
    );
  }

  /**
   * 搜索全部记录（自动翻页）
   */
  async searchAllRecords(
    tableId: string,
    params: Omit<SearchRequest, 'page_token' | 'page_size'> = {}
  ): Promise<BitableRecord[]> {
    const allRecords: BitableRecord[] = [];
    let pageToken: string | undefined;

    do {
      const res = await this.searchRecords(tableId, {
        ...params,
        page_size: 500,
        page_token: pageToken,
      });
      if (res.items) {
        allRecords.push(...res.items);
      }
      pageToken = res.has_more ? res.page_token : undefined;
    } while (pageToken);

    return allRecords;
  }

  /**
   * 获取单条记录
   */
  async getRecord(tableId: string, recordId: string): Promise<BitableRecord> {
    const data = await this.request<{ record: BitableRecord }>(
      'GET',
      `${this.tablePath(tableId)}/records/${recordId}`
    );
    return data.record;
  }

  /**
   * 创建记录
   */
  async createRecord(
    tableId: string,
    fields: Record<string, FieldValue>
  ): Promise<BitableRecord> {
    const data = await this.request<{ record: BitableRecord }>(
      'POST',
      `${this.tablePath(tableId)}/records`,
      { fields }
    );
    return data.record;
  }

  /**
   * 批量创建记录（自动分批，每批最多 500 条）
   */
  async batchCreateRecords(
    tableId: string,
    records: RecordRequest[]
  ): Promise<BitableRecord[]> {
    const results: BitableRecord[] = [];
    const batchSize = 500;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const data = await this.request<BatchCreateResponse>(
        'POST',
        `${this.tablePath(tableId)}/records/batch_create`,
        { records: batch }
      );
      if (data.records) {
        results.push(...data.records);
      }
    }

    return results;
  }

  /**
   * 更新记录
   */
  async updateRecord(
    tableId: string,
    recordId: string,
    fields: Record<string, FieldValue>
  ): Promise<BitableRecord> {
    const data = await this.request<{ record: BitableRecord }>(
      'PUT',
      `${this.tablePath(tableId)}/records/${recordId}`,
      { fields }
    );
    return data.record;
  }

  /**
   * 批量更新记录
   */
  async batchUpdateRecords(
    tableId: string,
    records: { record_id: string; fields: Record<string, FieldValue> }[]
  ): Promise<BitableRecord[]> {
    const results: BitableRecord[] = [];
    const batchSize = 500;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const data = await this.request<{ records: BitableRecord[] }>(
        'POST',
        `${this.tablePath(tableId)}/records/batch_update`,
        { records: batch }
      );
      if (data.records) {
        results.push(...data.records);
      }
    }

    return results;
  }

  /**
   * 删除记录
   */
  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    await this.request<unknown>(
      'DELETE',
      `${this.tablePath(tableId)}/records/${recordId}`
    );
  }
}

// 单例导出
export const bitable = new BitableClient();

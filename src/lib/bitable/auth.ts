/**
 * 飞书 Tenant Access Token 管理
 * 自动获取和缓存 Token，提前刷新
 */

interface TokenCache {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

let tokenCache: TokenCache | null = null;

const FEISHU_TOKEN_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
const REFRESH_BUFFER_MS = 30 * 60 * 1000; // 提前 30 分钟刷新

export async function getTenantAccessToken(): Promise<string> {
  // 缓存有效则直接返回
  if (tokenCache && Date.now() < tokenCache.expiresAt - REFRESH_BUFFER_MS) {
    return tokenCache.token;
  }

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET in environment variables');
  }

  const res = await fetch(FEISHU_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get tenant access token: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Feishu auth error: ${data.msg} (code: ${data.code})`);
  }

  tokenCache = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + data.expire * 1000,
  };

  return tokenCache.token;
}

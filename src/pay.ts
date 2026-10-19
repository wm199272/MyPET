export type PayChannel = 'wechat' | 'alipay';

export type FortunePayRequest = {
  petId: string;
  channel: PayChannel;
};

export type WechatPayParams = {
  appId: string;
  partnerId: string;
  prepayId: string;
  packageValue: string;
  nonceStr: string;
  timeStamp: string;
  sign: string;
};

export type AlipayPayParams = {
  orderString: string;
};

export type FortunePayTicket = {
  orderId: string;
  amountFen: number;
  channel: PayChannel;
  wechat?: WechatPayParams;
  alipay?: AlipayPayParams;
};

export type FortunePayState = 'pending' | 'paid' | 'closed';

export type FortunePayReceipt = {
  orderId: string;
  status: FortunePayState;
  paidAt: string;
};

export type PayUnavailable = {
  ok: false;
  reason: 'unconfigured' | 'rejected';
};

const wechatKeys = ['appId', 'partnerId', 'prepayId', 'packageValue', 'nonceStr', 'timeStamp', 'sign'] as const;

function payApiBase(): string {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return (env?.EXPO_PUBLIC_PAY_API ?? '').replace(/\/$/, '');
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function readFortuneTicket(value: unknown, channel: PayChannel): FortunePayTicket | null {
  const body = record(value);
  if (!body) return null;
  const orderId = text(body.orderId);
  const amountFen = body.amountFen;
  if (!orderId || body.channel !== channel || typeof amountFen !== 'number' || !Number.isInteger(amountFen) || amountFen <= 0) return null;
  if (channel === 'wechat') {
    const wechat = record(body.wechat);
    if (!wechat || wechatKeys.some((key) => !text(wechat[key]))) return null;
    return {
      orderId,
      amountFen,
      channel,
      wechat: {
        appId: text(wechat.appId),
        partnerId: text(wechat.partnerId),
        prepayId: text(wechat.prepayId),
        packageValue: text(wechat.packageValue),
        nonceStr: text(wechat.nonceStr),
        timeStamp: text(wechat.timeStamp),
        sign: text(wechat.sign),
      },
    };
  }
  const alipay = record(body.alipay);
  const orderString = text(alipay?.orderString);
  if (!orderString) return null;
  return { orderId, amountFen, channel, alipay: { orderString } };
}

export function readFortuneReceipt(value: unknown): FortunePayReceipt | null {
  const body = record(value);
  if (!body) return null;
  const orderId = text(body.orderId);
  const status = body.status;
  if (!orderId || (status !== 'pending' && status !== 'paid' && status !== 'closed')) return null;
  const paidAt = text(body.paidAt);
  if (status === 'paid' && !paidAt) return null;
  return { orderId, status, paidAt };
}

async function postJson(url: string, body: FortunePayRequest): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product: 'fortune', petId: body.petId, channel: body.channel }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function createFortuneOrder(request: FortunePayRequest, apiBase = payApiBase()): Promise<{ ok: true; ticket: FortunePayTicket } | PayUnavailable> {
  if (!request.petId || !apiBase) return { ok: false, reason: 'unconfigured' };
  const ticket = readFortuneTicket(await postJson(`${apiBase}/v1/fortune/orders`, request), request.channel);
  if (!ticket) return { ok: false, reason: 'rejected' };
  return { ok: true, ticket };
}

export async function queryFortuneOrder(orderId: string, apiBase = payApiBase()): Promise<{ ok: true; receipt: FortunePayReceipt } | PayUnavailable> {
  if (!orderId || !apiBase) return { ok: false, reason: 'unconfigured' };
  const receipt = readFortuneReceipt(await getJson(`${apiBase}/v1/fortune/orders/${encodeURIComponent(orderId)}`));
  if (!receipt || receipt.orderId !== orderId) return { ok: false, reason: 'rejected' };
  return { ok: true, receipt };
}

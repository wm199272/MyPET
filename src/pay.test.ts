import { createFortuneOrder, queryFortuneOrder, readFortuneReceipt, readFortuneTicket } from './pay.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const wechat = {
  orderId: 'f-1',
  amountFen: 100,
  channel: 'wechat',
  wechat: {
    appId: 'wx',
    partnerId: 'mch',
    prepayId: 'prepay',
    packageValue: 'Sign=WXPay',
    nonceStr: 'nonce',
    timeStamp: '1710000000',
    sign: 'sign',
  },
};

const ticket = readFortuneTicket(wechat, 'wechat');
assert(ticket?.channel === 'wechat' && ticket.wechat?.prepayId === 'prepay', '微信下单参数要能原样交给客户端');
assert(readFortuneTicket({ ...wechat, wechat: { ...wechat.wechat, sign: '' } }, 'wechat') === null, '缺少签名不能下单');
assert(readFortuneTicket({ ...wechat, channel: 'alipay' }, 'wechat') === null, '渠道不一致不能下单');

const alipay = readFortuneTicket({ orderId: 'f-2', amountFen: 100, channel: 'alipay', alipay: { orderString: 'app_id=1' } }, 'alipay');
assert(alipay?.alipay?.orderString === 'app_id=1', '支付宝订单串要保留');
assert(readFortuneTicket({ orderId: 'f-2', amountFen: 100, channel: 'alipay', alipay: { orderString: '' } }, 'alipay') === null, '空订单串不能下单');

assert(readFortuneReceipt({ orderId: 'f-1', status: 'paid', paidAt: '' }) === null, '没有支付时间不算已支付');
assert(readFortuneReceipt({ orderId: 'f-1', status: 'pending', paidAt: '' })?.status === 'pending', '待支付可以没有支付时间');
const paid = readFortuneReceipt({ orderId: 'f-1', status: 'paid', paidAt: '2026-10-16T04:00:00.000Z' });
assert(paid?.status === 'paid' && paid.paidAt.length > 0, '已支付要带服务端时间');

const created = await createFortuneOrder({ petId: 'pet-1', channel: 'wechat' }, '');
assert(!created.ok && created.reason === 'unconfigured', '没配支付服务时不能下单');
const queried = await queryFortuneOrder('f-1', '');
assert(!queried.ok && queried.reason === 'unconfigured', '没配支付服务时不能查成已支付');

console.log('pay ok');

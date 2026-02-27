const app = getApp();

Page({
  data: {
    score: 100,
    level: '新住户',
    levelColor: '#999',
    rules: [
      { action: '发布商品', point: '+2', desc: '每次发布闲置商品' },
      { action: '完成交易', point: '+5', desc: '买卖双方确认交易完成' },
      { action: '帮助邻居', point: '+3', desc: '响应求帮忙请求' },
      { action: '获得好评', point: '+2', desc: '交易后获得对方好评' },
      { action: '被举报', point: '-10', desc: '被其他用户举报且成立' },
      { action: '违规发布', point: '-5', desc: '发布违规内容被处理' }
    ]
  },

  onLoad() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) return;

    const score = userInfo.creditScore || userInfo.credit_score || 100;
    let level = '新住户';
    let levelColor = '#999';
    if (score >= 200) { level = '金牌邻居'; levelColor = '#faad14'; }
    else if (score >= 120) { level = '活跃邻居'; levelColor = '#52c41a'; }

    this.setData({ score, level, levelColor });
  }
});

// utils/util.js

/**
 * 格式化时间
 */
const formatTime = date => {
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
};

/**
 * 格式化价格
 */
const formatPrice = price => {
  if (price === 0) return '免费';
  return '¥' + Number(price).toFixed(price % 1 === 0 ? 0 : 2);
};

/**
 * 节流函数
 */
const throttle = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

/**
 * 显示加载
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true });
};

const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 生成唯一ID
 */
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

module.exports = {
  formatTime,
  formatPrice,
  throttle,
  showLoading,
  hideLoading,
  generateId
};

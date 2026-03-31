/**
 * 脱敏拨号：隐藏手机号中间四位，用户确认后再拨打
 */
function callWithMask(phone) {
  if (!phone) return;
  const masked = phone.length >= 7
    ? phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
    : phone;
  wx.showModal({
    title: '电话联系',
    content: '确认拨打 ' + masked + ' ？',
    confirmText: '拨打',
    confirmColor: '#C67A52',
    success(res) {
      if (res.confirm) {
        wx.makePhoneCall({ phoneNumber: phone });
      }
    }
  });
}

module.exports = { callWithMask };

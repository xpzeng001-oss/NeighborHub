const request = (options) => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    const token = wx.getStorageSync('token');
    const fullUrl = app.globalData.baseUrl + options.url;
    console.log('[API] 请求:', options.method || 'GET', fullUrl);
    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(options.header || {})
      },
      success(res) {
        console.log('[API] 响应:', fullUrl, 'statusCode:', res.statusCode, 'code:', res.data && res.data.code);
        try {
          if (res.data && res.data.code === 0) {
            resolve(res.data.data);
          } else if (res.data && res.data.code === 401) {
            wx.removeStorageSync('token'); wx.removeStorageSync('userInfo');
            app.globalData.userInfo = null; app.globalData.token = '';
            app.login(); reject(res.data);
          } else {
            wx.showToast({ title: (res.data && res.data.message) || '请求失败', icon: 'none' });
            reject(res.data || { message: '请求失败' });
          }
        } catch (e) {
          console.log('[API] 解析异常:', e.message);
          reject({ message: '响应解析失败' });
        }
      },
      fail(err) {
        console.log('[API] 请求失败:', fullUrl, JSON.stringify(err));
        wx.showToast({ title: '网络错误', icon: 'none' }); reject(err);
      }
    });
  });
};

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: app.globalData.baseUrl + '/api/upload',
      filePath, name: 'file',
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(res) {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (data.code === 0) { resolve(data.data.url); }
          else { wx.showToast({ title: data.message || '上传失败', icon: 'none' }); reject(new Error(data.message)); }
        } catch (e) {
          reject({ message: '上传响应解析失败' });
        }
      },
      fail(err) { wx.showToast({ title: '图片上传失败', icon: 'none' }); reject(err); }
    });
  });
};

const uploadImages = async (filePaths, onProgress) => {
  const urls = [];
  for (let i = 0; i < filePaths.length; i++) {
    if (onProgress) onProgress(i + 1, filePaths.length);
    urls.push(await uploadImage(filePaths[i]));
  }
  return urls;
};

const getProducts   = (params)   => request({ url: '/api/products', data: params });
const getProduct    = (id)       => request({ url: '/api/products/' + id });
const createProduct = (data)     => request({ url: '/api/products', method: 'POST', data });
const deleteProduct = (id)       => request({ url: '/api/products/' + id, method: 'DELETE' });
const relistProduct = (id)       => request({ url: '/api/products/' + id + '/relist', method: 'PUT' });
const markProductSold = (id)     => request({ url: '/api/products/' + id + '/sold', method: 'PUT' });
const wantProduct   = (id)       => request({ url: '/api/products/' + id + '/want', method: 'POST' });
const toggleFavorite= (id)       => request({ url: '/api/products/' + id + '/favorite', method: 'POST' });
const getPosts      = (params)   => request({ url: '/api/posts', data: params });
const getPost       = (id)       => request({ url: '/api/posts/' + id });
const createPost    = (data)     => request({ url: '/api/posts', method: 'POST', data });
const likePost      = (id)       => request({ url: '/api/posts/' + id + '/like', method: 'POST' });
const addComment    = (id, data) => request({ url: '/api/posts/' + id + '/comment', method: 'POST', data });
const deletePost    = (id)       => request({ url: '/api/posts/' + id, method: 'DELETE' });
const getHelps      = (params)   => request({ url: '/api/helps', data: params });
const createHelp    = (data)     => request({ url: '/api/helps', method: 'POST', data });
const respondHelp   = (id)       => request({ url: '/api/helps/' + id + '/respond', method: 'POST' });
const getRentals    = (params)   => request({ url: '/api/rentals', data: params });
const getSams       = (params)   => request({ url: '/api/sams', data: params });
const getSamDetail  = (id)       => request({ url: '/api/sams/' + id });
const createSam     = (data)     => request({ url: '/api/sams', method: 'POST', data });
const deleteSam     = (id)       => request({ url: '/api/sams/' + id, method: 'DELETE' });
const joinSam       = (id)       => request({ url: '/api/sams/' + id + '/join', method: 'POST' });
const updateShoppingList  = (id, data)          => request({ url: '/api/sams/' + id + '/shopping-list', method: 'PUT', data });
const postSamUpdate       = (id, data)          => request({ url: '/api/sams/' + id + '/updates', method: 'POST', data });
const updatePickupStatus  = (id, userId, data)  => request({ url: '/api/sams/' + id + '/participants/' + userId + '/pickup', method: 'PUT', data });
const getCarpools   = (params)   => request({ url: '/api/carpools', data: params });
const createCarpool = (data)     => request({ url: '/api/carpools', method: 'POST', data });
const joinCarpool   = (id)       => request({ url: '/api/carpools/' + id + '/join', method: 'POST' });
const deleteHelp    = (id)       => request({ url: '/api/helps/' + id, method: 'DELETE' });
const deleteCarpool = (id)       => request({ url: '/api/carpools/' + id, method: 'DELETE' });
const deleteRental  = (id)       => request({ url: '/api/rentals/' + id, method: 'DELETE' });
const getPets       = (params)   => request({ url: '/api/pets', data: params });
const getPetDetail  = (id)       => request({ url: '/api/pets/' + id });
const createPet     = (data)     => request({ url: '/api/pets', method: 'POST', data });
const deletePet     = (id)       => request({ url: '/api/pets/' + id, method: 'DELETE' });
const respondPet    = (id)       => request({ url: '/api/pets/' + id + '/respond', method: 'POST' });
const getActivities     = (params)   => request({ url: '/api/activities', data: params });
const getActivityDetail = (id)       => request({ url: '/api/activities/' + id });
const createActivity    = (data)     => request({ url: '/api/activities', method: 'POST', data });
const deleteActivity    = (id)       => request({ url: '/api/activities/' + id, method: 'DELETE' });
const joinActivity      = (id)       => request({ url: '/api/activities/' + id + '/join', method: 'POST' });
const getUser       = (id)       => request({ url: '/api/users/' + id });
const updateUser    = (id, data) => request({ url: '/api/users/' + id, method: 'PUT', data });
const getCoinLogs   = (params)  => request({ url: '/api/users/coin-logs', data: params });
const getMyFavorites = (params)  => request({ url: '/api/products/favorites', data: params });

// Reports
const getReports      = (params)  => request({ url: '/api/reports', data: params });
const createReport    = (data)    => request({ url: '/api/reports', method: 'POST', data });

// Feedbacks
const getFeedbacks    = (params)  => request({ url: '/api/feedbacks', data: params });
const createFeedback  = (data)    => request({ url: '/api/feedbacks', method: 'POST', data });

// Districts & Communities
const getDistricts             = ()       => request({ url: '/api/communities/districts' });
const getCommunities           = ()       => request({ url: '/api/communities' });
const applyCommunity           = (data)   => request({ url: '/api/communities/apply', method: 'POST', data });
const getMyCommunityApplications = ()     => request({ url: '/api/communities/my-applications' });

// Avatar
const getAvatarConfig     = ()         => request({ url: '/api/auth/avatar-config' });

// Feed
const getFeed             = (params)   => request({ url: '/api/feed', data: params });

// Stats
const getCategoryCounts   = (params)   => request({ url: '/api/stats/counts', data: params });

// Chat
const getConversations    = ()         => request({ url: '/api/chat/conversations' });
const createConversation  = (data)     => request({ url: '/api/chat/conversations', method: 'POST', data });
const getMessages         = (id, params) => request({ url: '/api/chat/conversations/' + id + '/messages', data: params });
const sendMessage         = (id, data) => request({ url: '/api/chat/conversations/' + id + '/messages', method: 'POST', data });
const markConversationRead = (id)      => request({ url: '/api/chat/conversations/' + id + '/read', method: 'PUT' });

// Admin APIs
// Admin Community Applications
const getAdminCommunityApplications = (params) => request({ url: '/api/admin/community-applications', data: params });
const handleCommunityApplication = (id, data) => request({ url: '/api/admin/community-applications/' + id, method: 'PUT', data });

const getAdminStats = () => request({ url: '/api/admin/stats' });
const getAdminDashboard = (params) => request({ url: '/api/admin/dashboard', data: params });
const getAdminReports = (params) => request({ url: '/api/admin/reports', data: params });
const handleAdminReport = (id, data) => request({ url: '/api/admin/reports/' + id, method: 'PUT', data });
const getAdminContent = (params) => request({ url: '/api/admin/content', data: params });
const takedownContent = (type, id, data) => request({ url: '/api/admin/content/' + type + '/' + id + '/takedown', method: 'PUT', data });
const restoreContent = (type, id) => request({ url: '/api/admin/content/' + type + '/' + id + '/restore', method: 'PUT' });
const toggleContentTop = (type, id) => request({ url: '/api/admin/content/' + type + '/' + id + '/top', method: 'PUT' });
const getAdminUsers = (params) => request({ url: '/api/admin/users', data: params });
const banUser = (id, data) => request({ url: '/api/admin/users/' + id + '/ban', method: 'PUT', data });
const unbanUser = (id) => request({ url: '/api/admin/users/' + id + '/unban', method: 'PUT' });

// Admin Community Management
const getAdminCommunities = (params) => request({ url: '/api/admin/communities', data: params });
const createAdminCommunity = (data) => request({ url: '/api/admin/communities', method: 'POST', data });
const deleteAdminCommunity = (id) => request({ url: '/api/admin/communities/' + id, method: 'DELETE' });
const assignCommunityDistrict = (id, data) => request({ url: '/api/admin/communities/' + id + '/district', method: 'PUT', data });

// Admin District Management
const getAdminDistricts = () => request({ url: '/api/admin/districts' });
const createAdminDistrict = (data) => request({ url: '/api/admin/districts', method: 'POST', data });
const deleteAdminDistrict = (id) => request({ url: '/api/admin/districts/' + id, method: 'DELETE' });

module.exports = {
  getProducts, getProduct, createProduct, deleteProduct, relistProduct, markProductSold, wantProduct, toggleFavorite,
  getPosts, getPost, createPost, deletePost, likePost, addComment,
  getHelps, createHelp, respondHelp,
  getRentals,
  getSams, getSamDetail, createSam, deleteSam, joinSam, updateShoppingList, postSamUpdate, updatePickupStatus,
  getCarpools, createCarpool, joinCarpool,
  getActivities, getActivityDetail, createActivity, deleteActivity, joinActivity,
  getPets, getPetDetail, createPet, deletePet, respondPet,
  getUser, updateUser, getCoinLogs,
  getMyFavorites, getReports, createReport, getFeedbacks, createFeedback,
  uploadImage, uploadImages, getAvatarConfig,
  getCategoryCounts,
  getConversations, createConversation, getMessages, sendMessage, markConversationRead,
  getDistricts, getCommunities, applyCommunity, getMyCommunityApplications,
  getAdminCommunityApplications, handleCommunityApplication,
  getAdminStats, getAdminDashboard, toggleContentTop, getAdminReports, handleAdminReport, getAdminContent, takedownContent, restoreContent,
  getFeed,
  deleteHelp, deleteCarpool, deleteRental,
  getAdminUsers, banUser, unbanUser,
  getAdminCommunities, createAdminCommunity, deleteAdminCommunity, assignCommunityDistrict,
  getAdminDistricts, createAdminDistrict, deleteAdminDistrict
};

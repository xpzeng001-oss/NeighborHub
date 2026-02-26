const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(options.header || {})
      },
      success(res) {
        if (res.data.code === 0) { resolve(res.data.data); }
        else if (res.data.code === 401) {
          wx.removeStorageSync('token'); wx.removeStorageSync('userInfo');
          app.globalData.userInfo = null; app.globalData.token = '';
          wx.showToast({ title: '请重新登录', icon: 'none' }); reject(res.data);
        } else { wx.showToast({ title: res.data.message || '请求失败', icon: 'none' }); reject(res.data); }
      },
      fail(err) { wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
    });
  });
};

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: app.globalData.baseUrl + '/api/upload',
      filePath, name: 'file',
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(res) {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (data.code === 0) { resolve(data.data.url); }
        else { wx.showToast({ title: data.message || '上传失败', icon: 'none' }); reject(new Error(data.message)); }
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

const login         = (data)     => request({ url: '/api/auth/login', method: 'POST', data });
const getProducts   = (params)   => request({ url: '/api/products', data: params });
const getProduct    = (id)       => request({ url: '/api/products/' + id });
const createProduct = (data)     => request({ url: '/api/products', method: 'POST', data });
const updateProduct = (id, data) => request({ url: '/api/products/' + id, method: 'PUT', data });
const deleteProduct = (id)       => request({ url: '/api/products/' + id, method: 'DELETE' });
const wantProduct   = (id)       => request({ url: '/api/products/' + id + '/want', method: 'POST' });
const toggleFavorite= (id)       => request({ url: '/api/products/' + id + '/favorite', method: 'POST' });
const getPosts      = (params)   => request({ url: '/api/posts', data: params });
const getPost       = (id)       => request({ url: '/api/posts/' + id });
const createPost    = (data)     => request({ url: '/api/posts', method: 'POST', data });
const likePost      = (id)       => request({ url: '/api/posts/' + id + '/like', method: 'POST' });
const addComment    = (id, data) => request({ url: '/api/posts/' + id + '/comment', method: 'POST', data });
const getHelps      = (params)   => request({ url: '/api/helps', data: params });
const createHelp    = (data)     => request({ url: '/api/helps', method: 'POST', data });
const respondHelp   = (id)       => request({ url: '/api/helps/' + id + '/respond', method: 'POST' });
const getRentals    = (params)   => request({ url: '/api/rentals', data: params });
const createRental  = (data)     => request({ url: '/api/rentals', method: 'POST', data });
const getPets       = (params)   => request({ url: '/api/pets', data: params });
const createPet     = (data)     => request({ url: '/api/pets', method: 'POST', data });
const getUser       = (id)       => request({ url: '/api/users/' + id });
const updateUser    = (id, data) => request({ url: '/api/users/' + id, method: 'PUT', data });
const getUserStats  = (id)       => request({ url: '/api/users/' + id + '/stats' });
const getBanners    = ()         => request({ url: '/api/banners' });

module.exports = {
  login,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, wantProduct, toggleFavorite,
  getPosts, getPost, createPost, likePost, addComment,
  getHelps, createHelp, respondHelp,
  getRentals, createRental,
  getPets, createPet,
  getUser, updateUser, getUserStats,
  getBanners,
  uploadImage, uploadImages
};

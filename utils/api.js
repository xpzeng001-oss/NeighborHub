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
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {})
      },
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          app.globalData.userInfo = null;
          app.globalData.token = '';
          reject(res.data);
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 上传图片（使用 wx.uploadFile）
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: app.globalData.baseUrl + '/api/upload',
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data.url);
        } else {
          reject(data);
        }
      },
      fail: reject
    });
  });
};

// 批量上传图片
const uploadImages = async (filePaths) => {
  const urls = [];
  for (const path of filePaths) {
    const url = await uploadImage(path);
    urls.push(url);
  }
  return urls;
};

module.exports = {
  // Auth
  login: (data) => request({ url: '/api/auth/login', method: 'POST', data }),

  // Products
  getProducts: (params) => request({ url: '/api/products', data: params }),
  getProduct: (id) => request({ url: `/api/products/${id}` }),
  createProduct: (data) => request({ url: '/api/products', method: 'POST', data }),
  updateProduct: (id, data) => request({ url: `/api/products/${id}`, method: 'PUT', data }),
  deleteProduct: (id) => request({ url: `/api/products/${id}`, method: 'DELETE' }),
  wantProduct: (id) => request({ url: `/api/products/${id}/want`, method: 'POST' }),
  toggleFavorite: (id) => request({ url: `/api/products/${id}/favorite`, method: 'POST' }),

  // Posts
  getPosts: (params) => request({ url: '/api/posts', data: params }),
  getPost: (id) => request({ url: `/api/posts/${id}` }),
  createPost: (data) => request({ url: '/api/posts', method: 'POST', data }),
  likePost: (id) => request({ url: `/api/posts/${id}/like`, method: 'POST' }),
  addComment: (id, data) => request({ url: `/api/posts/${id}/comment`, method: 'POST', data }),

  // Helps
  getHelps: (params) => request({ url: '/api/helps', data: params }),
  createHelp: (data) => request({ url: '/api/helps', method: 'POST', data }),
  respondHelp: (id) => request({ url: `/api/helps/${id}/respond`, method: 'POST' }),

  // Rentals
  getRentals: (params) => request({ url: '/api/rentals', data: params }),
  createRental: (data) => request({ url: '/api/rentals', method: 'POST', data }),

  // Pets
  getPets: (params) => request({ url: '/api/pets', data: params }),
  createPet: (data) => request({ url: '/api/pets', method: 'POST', data }),

  // Users
  getUser: (id) => request({ url: `/api/users/${id}` }),
  updateUser: (id, data) => request({ url: `/api/users/${id}`, method: 'PUT', data }),
  getUserStats: (id) => request({ url: `/api/users/${id}/stats` }),

  // Banners
  getBanners: () => request({ url: '/api/banners' }),

  // Upload
  uploadImage,
  uploadImages
};

// utils/mockData.js

const mockProducts = [
  {
    id: 'p001',
    userId: 'u001',
    userName: '小王妈妈',
    userAvatar: '/images/avatar-placeholder.png',
    building: '3栋1单元',
    title: '九成新婴儿推车，宝宝大了用不上',
    price: 200,
    originalPrice: 899,
    isFree: false,
    category: '母婴',
    condition: '九成新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '好孩子品牌婴儿推车，买了不到半年，宝宝大了坐不下了。功能完好，可折叠，送雨棚。楼下面交。',
    viewCount: 56,
    wantCount: 3,
    createdAt: Date.now() - 3600000 * 2,
    tradeMethod: '楼下交接'
  },
  {
    id: 'p002',
    userId: 'u002',
    userName: '老张',
    userAvatar: '/images/avatar-placeholder.png',
    building: '7栋2单元',
    title: '搬家处理！实木书架 1.8米高',
    price: 150,
    originalPrice: 800,
    isFree: false,
    category: '家具',
    condition: '八成新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '马上搬家了，实木书架处理，1.8m高x0.8m宽，五层。自己来拆搬，价格可小刀。',
    viewCount: 128,
    wantCount: 8,
    createdAt: Date.now() - 3600000 * 5,
    tradeMethod: '上门自提'
  },
  {
    id: 'p003',
    userId: 'u003',
    userName: '数码小哥',
    userAvatar: '/images/avatar-placeholder.png',
    building: '12栋',
    title: 'iPad Air 5 64G Wi-Fi 星光色',
    price: 2800,
    originalPrice: 4799,
    isFree: false,
    category: '数码',
    condition: '九五新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '去年双11买的，贴了膜带了壳，基本没怎么用。配件齐全，带原装充电器。',
    viewCount: 234,
    wantCount: 12,
    createdAt: Date.now() - 3600000 * 8,
    tradeMethod: '楼下交接'
  },
  {
    id: 'p004',
    userId: 'u004',
    userName: '爱做饭的李姐',
    userAvatar: '/images/avatar-placeholder.png',
    building: '5栋3单元',
    title: '【免费】多余的花盆和营养土',
    price: 0,
    originalPrice: 0,
    isFree: true,
    category: '家居',
    condition: '九成新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '阳台收拾出来的花盆，大中小各两个，还有半袋营养土。喜欢养花的邻居来拿吧！',
    viewCount: 89,
    wantCount: 15,
    createdAt: Date.now() - 3600000,
    tradeMethod: '上门自提'
  },
  {
    id: 'p005',
    userId: 'u005',
    userName: '健身达人',
    userAvatar: '/images/avatar-placeholder.png',
    building: '9栋1单元',
    title: '哑铃套装 可调节 2-20kg',
    price: 180,
    originalPrice: 399,
    isFree: false,
    category: '运动',
    condition: '九成新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '可调节重量哑铃一对，2kg到20kg随意调节。去健身房了用不上，便宜出。',
    viewCount: 67,
    wantCount: 5,
    createdAt: Date.now() - 86400000,
    tradeMethod: '楼下交接'
  },
  {
    id: 'p006',
    userId: 'u001',
    userName: '小王妈妈',
    userAvatar: '/images/avatar-placeholder.png',
    building: '3栋1单元',
    title: '【免费】儿童绘本30+本',
    price: 0,
    originalPrice: 0,
    isFree: true,
    category: '母婴',
    condition: '八成新',
    status: 'selling',
    images: ['/images/placeholder.png'],
    description: '宝宝看过的绘本，有小猪佩奇、汪汪队、各种认知书。适合1-4岁。免费送，自取。',
    viewCount: 145,
    wantCount: 22,
    createdAt: Date.now() - 7200000,
    tradeMethod: '上门自提'
  }
];

const mockPosts = [
  {
    id: 'post001',
    userId: 'u010',
    userName: '物业管理处',
    userAvatar: '/images/avatar-placeholder.png',
    category: '公告',
    title: '关于小区电梯年度维保通知',
    content: '各位业主好，本周六（1月18日）将进行全小区电梯年度维保，届时1-5栋电梯将分批暂停使用2小时。请大家提前做好出行安排，不便之处敬请谅解。',
    images: [],
    likeCount: 45,
    commentCount: 12,
    isTop: true,
    createdAt: Date.now() - 3600000 * 3
  },
  {
    id: 'post002',
    userId: 'u006',
    userName: '6栋大姐',
    userAvatar: '/images/avatar-placeholder.png',
    category: '吐槽',
    title: '楼上深夜装修太吵了！',
    content: '已经连续三天了，晚上10点还在打电钻！大家帮忙评评理，这合理吗？物业能不能管管？',
    images: [],
    likeCount: 89,
    commentCount: 34,
    isTop: false,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'post003',
    userId: 'u007',
    userName: '遛狗小分队',
    userAvatar: '/images/avatar-placeholder.png',
    category: '活动',
    title: '周末萌宠聚会🐶谁来？',
    content: '这周日下午3点，小区中心花园老地方。带上你家毛孩子，一起遛遛晒太阳！上次来了12只狗子超开心～',
    images: [],
    likeCount: 67,
    commentCount: 23,
    isTop: false,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'post004',
    userId: 'u008',
    userName: '新搬来的小陈',
    userAvatar: '/images/avatar-placeholder.png',
    category: '求助',
    title: '请问小区附近有靠谱的开锁师傅吗？',
    content: '刚搬来不久，想换个锁芯，有没有邻居推荐靠谱的师傅？价格大概多少？谢谢啦！',
    images: [],
    likeCount: 12,
    commentCount: 8,
    isTop: false,
    createdAt: Date.now() - 86400000 * 3
  }
];

const mockHelps = [
  {
    id: 'h001',
    userId: 'u009',
    userName: '10栋小赵',
    userAvatar: '/images/avatar-placeholder.png',
    building: '10栋2单元',
    title: '求借电钻，装个窗帘',
    description: '新买了窗帘需要打几个孔，借用一下电钻，半小时就还！',
    isUrgent: false,
    status: 'open',
    deadline: '2025-01-20',
    createdAt: Date.now() - 7200000
  },
  {
    id: 'h002',
    userId: 'u004',
    userName: '爱做饭的李姐',
    userAvatar: '/images/avatar-placeholder.png',
    building: '5栋3单元',
    title: '【急】有没有人顺路去机场？',
    description: '明天早上7点要去浦东机场，一个人带着行李打车不方便，可以拼车吗？油费AA。',
    isUrgent: true,
    status: 'open',
    deadline: '2025-01-17',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'h003',
    userId: 'u006',
    userName: '6栋大姐',
    userAvatar: '/images/avatar-placeholder.png',
    building: '6栋1单元',
    title: '求推荐靠谱的钟点工阿姨',
    description: '家里需要每周打扫两次，有没有邻居可以推荐靠谱的保洁阿姨？最好是在我们小区做过的。',
    isUrgent: false,
    status: 'open',
    deadline: '',
    createdAt: Date.now() - 86400000
  }
];

const mockRentals = [
  {
    id: 'r001',
    userId: 'u011',
    userName: '房东刘先生',
    building: '8栋',
    title: '精装两房朝南 拎包入住',
    roomType: '2室1厅1卫',
    area: 78,
    rent: 5500,
    deposit: '押一付三',
    isAgent: false,
    images: ['/images/placeholder.png'],
    description: '精装修两房，家电齐全，拎包入住。朝南采光好，近地铁站。',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'r002',
    userId: 'u012',
    userName: '合租小伙伴',
    building: '2栋',
    title: '主卧出租 限女生',
    roomType: '主卧（三房合租）',
    area: 18,
    rent: 2200,
    deposit: '押一付一',
    isAgent: false,
    images: ['/images/placeholder.png'],
    description: '三房户型，目前住了两个女生（都是上班族），现主卧出租。有独卫，WiFi家电齐全。',
    createdAt: Date.now() - 86400000 * 5
  }
];

const mockBanners = [
  { id: 'b001', image: '/images/banner-1.png', title: '社区团购上线啦', link: '' },
  { id: 'b002', image: '/images/banner-2.png', title: '物业通知：春节安排', link: '' },
  { id: 'b003', image: '/images/banner-3.png', title: '新邻居优惠券', link: '' }
];

const categories = [
  { id: 'all', name: '全部', iconName: 'package' },
  { id: 'digital', name: '数码', iconName: 'smartphone' },
  { id: 'furniture', name: '家具', iconName: 'armchair' },
  { id: 'appliance', name: '家电', iconName: 'plug' },
  { id: 'baby', name: '母婴', iconName: 'baby' },
  { id: 'sports', name: '运动', iconName: 'dumbbell' },
  { id: 'clothing', name: '服饰', iconName: 'shirt' },
  { id: 'books', name: '图书', iconName: 'book-open' },
  { id: 'tools', name: '工具', iconName: 'wrench' },
  { id: 'other', name: '其他', iconName: 'tag' }
];

const conditions = ['全新', '九五新', '九成新', '八成新', '有使用痕迹'];

module.exports = {
  mockProducts,
  mockPosts,
  mockHelps,
  mockRentals,
  mockBanners,
  categories,
  conditions
};

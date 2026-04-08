const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Post = require('./Post');
const Comment = require('./Comment');
const HelpRequest = require('./HelpRequest');
const Rental = require('./Rental');
const PetPost = require('./PetPost');
const Favorite = require('./Favorite');
const Banner = require('./Banner');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Report = require('./Report');
const Feedback = require('./Feedback');
const SamOrder = require('./SamOrder');
const Carpool = require('./Carpool');
const MediaCheck = require('./MediaCheck');
const Violation = require('./Violation');
const District = require('./District');
const Community = require('./Community');
const CommunityApplication = require('./CommunityApplication');
const CoinLog = require('./CoinLog');
const Activity = require('./Activity');
const ServicePost = require('./ServicePost');
const WechatGroup = require('./WechatGroup');

// User <-> Product
User.hasMany(Product, { foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Post
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

// Post <-> Comment
Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

// User <-> Comment
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// User <-> HelpRequest
User.hasMany(HelpRequest, { foreignKey: 'user_id' });
HelpRequest.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Rental
User.hasMany(Rental, { foreignKey: 'user_id' });
Rental.belongsTo(User, { foreignKey: 'user_id' });

// User <-> PetPost
User.hasMany(PetPost, { foreignKey: 'user_id' });
PetPost.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Product (Favorites, many-to-many)
User.belongsToMany(Product, { through: Favorite, foreignKey: 'user_id', otherKey: 'product_id', as: 'FavoriteProducts' });
Product.belongsToMany(User, { through: Favorite, foreignKey: 'product_id', otherKey: 'user_id', as: 'FavoritedBy' });

// Favorite -> Product (for direct include query)
Favorite.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Favorite, { foreignKey: 'product_id' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// User <-> Conversation
Conversation.belongsTo(User, { foreignKey: 'user_a_id', as: 'UserA' });
Conversation.belongsTo(User, { foreignKey: 'user_b_id', as: 'UserB' });

// User <-> Message
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });

// User <-> Report
User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Feedback
User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id' });

// User <-> SamOrder
User.hasMany(SamOrder, { foreignKey: 'user_id' });
SamOrder.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Carpool
User.hasMany(Carpool, { foreignKey: 'user_id' });
Carpool.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Violation
User.hasMany(Violation, { foreignKey: 'user_id' });
Violation.belongsTo(User, { foreignKey: 'user_id' });

// User <-> CoinLog
User.hasMany(CoinLog, { foreignKey: 'user_id' });
CoinLog.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Community
User.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(User, { foreignKey: 'community_id' });

// District <-> Community
District.hasMany(Community, { foreignKey: 'district_id' });
Community.belongsTo(District, { foreignKey: 'district_id' });

// Community <-> Content models
Community.hasMany(Product, { foreignKey: 'community_id' });
Product.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(Post, { foreignKey: 'community_id' });
Post.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(HelpRequest, { foreignKey: 'community_id' });
HelpRequest.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(PetPost, { foreignKey: 'community_id' });
PetPost.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(SamOrder, { foreignKey: 'community_id' });
SamOrder.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(Carpool, { foreignKey: 'community_id' });
Carpool.belongsTo(Community, { foreignKey: 'community_id' });
Community.hasMany(Rental, { foreignKey: 'community_id' });
Rental.belongsTo(Community, { foreignKey: 'community_id' });

// User <-> Activity
User.hasMany(Activity, { foreignKey: 'user_id' });
Activity.belongsTo(User, { foreignKey: 'user_id' });

// Community <-> Activity
Community.hasMany(Activity, { foreignKey: 'community_id' });
Activity.belongsTo(Community, { foreignKey: 'community_id' });

// User <-> ServicePost
User.hasMany(ServicePost, { foreignKey: 'user_id' });
ServicePost.belongsTo(User, { foreignKey: 'user_id' });
ServicePost.belongsTo(Community, { foreignKey: 'community_id', constraints: false });

// User <-> CommunityApplication
User.hasMany(CommunityApplication, { foreignKey: 'user_id' });
CommunityApplication.belongsTo(User, { foreignKey: 'user_id' });

// User <-> WechatGroup
User.hasMany(WechatGroup, { foreignKey: 'created_by' });
WechatGroup.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// District <-> WechatGroup
District.hasMany(WechatGroup, { foreignKey: 'district_id' });
WechatGroup.belongsTo(District, { foreignKey: 'district_id' });

module.exports = {
  sequelize,
  User,
  Product,
  Post,
  Comment,
  HelpRequest,
  Rental,
  PetPost,
  Favorite,
  Banner,
  Conversation,
  Message,
  Report,
  Feedback,
  SamOrder,
  Carpool,
  MediaCheck,
  Violation,
  District,
  Community,
  CommunityApplication,
  CoinLog,
  Activity,
  ServicePost,
  WechatGroup
};

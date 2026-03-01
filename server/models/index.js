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
  SamOrder
};

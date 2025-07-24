const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = Schema(
  {
    name: String,
    username: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      default: 'accessor',
      enum: ['accessor', 'admin'],
    },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

/**
 * Helper static method for finding user by credentials
 */
userSchema.statics.findByCredentials = async function(username, password) {
  const User = this;
  const user = await User.findOne({ username }, { name: 1, username: 1, password: 1, role: 1, _id: 1});
  if (!user) throw new Error('Unable to login as user is not found. username is wrong , please check and try again.');
  console.log('comparing ' , password, user.password);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Unable to login as password is wrong');
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const { Schema } = mongoose;

const userSchema: any = new Schema(
  {
    emailid: String,
    username: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      default: 'viewer',
      enum: ['viewer', 'creator', 'admin'],
    },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function(next: Function) {
  const user: any = this;
  if (user.isModified('password')) {
    const salt: any = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});
userSchema.pre('findOneAndUpdate', async function(next: Function) {
  const user: any = this.getUpdate();
  const salt: any = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

/**
 * Helper method for generating Auth Token
 */
userSchema.methods.generateAuthToken = function() {
  const user = this;
  return jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Helper static method for finding user by credentials
 */
userSchema.statics.findByCredentials = async function(username: string, password: string) {
  const User: any = this;
  const user: any = await User.findOne({ username }, { name: 1, username: 1, password: 1, role: 1, _id: 1});
  if (!user) throw new Error('Unable to login as user is not found. username is wrong , please check and try again.');
  const isMatch: boolean = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Unable to login as password is wrong');
  return user;
};

const User: any = mongoose.model('User', userSchema);

module.exports = {
  UserModel: User,
};

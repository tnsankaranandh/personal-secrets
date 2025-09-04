const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');

const connectDB: Function = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongoose connected");
  } catch (e) {
    console.error(e.message);
    console.log(
      '%s MongoDB connection error. Please make sure MongoDB is running.',
      chalk.red('✗')
    );
    throw (e);
  }
};

const getHashedPassword = async (p: any) => {
    const salt: any = await bcrypt.genSalt(10);
    return bcrypt.hash(p, salt);
};

module.exports = {
  connectDB,
  getHashedPassword,
};
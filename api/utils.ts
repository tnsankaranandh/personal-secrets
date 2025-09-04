const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');


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

const getHashedPassword: Function = async (p: any) => {
    const salt: any = await bcrypt.genSalt(10);
    return bcrypt.hash(p, salt);
};

const encryptText: Function = async (text: any) => {
  return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY);
};

const decryptText: Function = async (text: any) => {
  return CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY);
};

module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
};
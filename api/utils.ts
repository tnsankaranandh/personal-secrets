const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


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

const algorithm = process.env.ENCRYPTION_ALGORITHM;
const encoder = new TextEncoder();
const plaintext_bytes = encoder.encode(process.env.ENCRYPTION_KEY);

const encryptText: Function = async (text: any) => {
  const iv = crypto.randomBytes(16);  // 16-byte IV
  const cipher = crypto.createCipheriv(algorithm, plaintext_bytes, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptText: Function = async (text: any) => {
  const parts = text.split(':');
  const ivFromEncrypted = Buffer.from(parts.shift(), 'hex');
  const encryptedData = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, plaintext_bytes, ivFromEncrypted);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
};

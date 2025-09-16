const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { put } = require("@vercel/blob");

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

const doubleEncryptionUtils: any = {
  generateRSAKeyPairs: () => {
    return new Promise(async (resolve, reject) => {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Recommended key size
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      const d: any = new Date();
      const uniqueDateString: String = '' + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
      const { url: publicKeyUrl } = await put(uniqueDateString + '/public_key.pem', publicKey, { access: 'public' });
      const { url: privateKeyUrl } = await put(uniqueDateString + '/private_key.pem', privateKey, { access: 'public' });
      resolve(publicKeyUrl + '-key-' + privateKeyUrl);
    });
  },
  decrypt: async (doubleEncryptedString: string, keyUrls: String) => {
    // try {
    //   console.log(1);
    //   const vercelBlobResponse = await fetch(keyUrls.split('-key-')[1]);
    //   console.log(2);
    //   let privateKey = await vercelBlobResponse.text();
    //   console.log(3);

    //   // Convert the hexadecimal string to a Buffer
    //   // const encryptedBuffer = Buffer.from(doubleEncryptedString, 'hex');
    //   const encryptedBuffer = new TextEncoder().encode(doubleEncryptedString);
    //   console.log(4);

    //   console.log('privateKey ', privateKey);
    //   privateKey = crypto.createPrivateKey({
    //     key: privateKey,
    //     // format: 'pem',
    //     // type: 'pkcs8', // Or 'pkcs1' depending on how your key is formatted
    //     // If the private key is encrypted, you also need to provide a passphrase:
    //     passphrase: 'your_strong_passphrase',
    //   });
    //   console.log('crypto private key ', privateKey);
    //   // console.log('crypto.constants.RSA_PKCS1_PADDING ', crypto.constants.RSA_PKCS1_PADDING);
    //   console.log('encryptedBuffer ', encryptedBuffer);
    //   // Decrypt the data using the private key
    //   const decryptedBuffer = crypto.privateDecrypt(
    //     {
    //       key: privateKey,
    //       // passphrase: 'your_strong_passphrase',
    //       // type: 'pkcs8',
    //       // format: 'pem',
    //       // cipher: 'aes-256-cbc',
    //       // padding: crypto.constants.RSA_PKCS1_PADDING, // or RSA_NO_PADDING depending on encryption
    //       // oaepHash: 'SHA1', // Example: if SHA-256 was used for OAEP
    //     },
    //     encryptedBuffer
    //   );
    //   console.log(5);

    //   const doubleDecryptedString = decryptedBuffer.toString('utf8');
    //   console.log(doubleDecryptedString, '   ---------------doubleDecryptedString');
    //   return doubleDecryptedString;
    // } catch (error) {
    //   console.error('Decryption error:', error);
    //   throw (error);
    // }

    try {
      console.log(1);
      const vercelBlobResponse = await fetch(keyUrls.split('-key-')[1]);
      console.log(2);
      let privateKey = await vercelBlobResponse.text();
      console.log(3);
      const buffer = Buffer.from(doubleEncryptedString, 'base64'); // Decode from base64
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING // Same padding as encryption
        },
        buffer
      );
      const a = decrypted.toString('utf8');
      console.log('__________-_______-_________ ', a);
      return a;
    } catch (error) {
      console.error('Decryption error:', error);
      throw (error);
    }

  },
};

module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
  doubleEncryptionUtils,
};

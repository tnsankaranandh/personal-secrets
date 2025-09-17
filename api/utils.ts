const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const JSEncrypt = require('jsencrypt');
// const jwt = require('jsonwebtoken');
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
  console.log(1);
  const parts = text.split(':');
  console.log(2);
  const ivFromEncrypted = Buffer.from(parts.shift(), 'hex');
  console.log(3);
  const encryptedData = parts.join(':');
  console.log(4);
  console.log('algorithm', algorithm);
  console.log('plaintext_bytes', plaintext_bytes);
  console.log('ivFromEncrypted', ivFromEncrypted);
  const decipher = crypto.createDecipheriv(algorithm, plaintext_bytes, ivFromEncrypted);
  console.log(5);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  console.log(6);
  decrypted += decipher.final('utf8');
  console.log(7);
  return decrypted;
};

const doubleEncryptionUtils: any = {
  generateRSAKeyPairs: () => {
    return new Promise(async (resolve, reject) => {
      const crypt = new JSEncrypt();
      crypt.getKey(async () => {
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        const privateKey = crypt.getPrivateKey();
        const publicKey = crypt.getPublicKey();

        const d: any = new Date();
        const uniqueDateString: String = '' + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
        const { url: publicKeyUrl } = await put(uniqueDateString + '/public_key.pem', publicKey, { access: 'public' });
        const { url: privateKeyUrl } = await put(uniqueDateString + '/private_key.pem', privateKey, { access: 'public' });
        resolve(publicKeyUrl + '-key-' + privateKeyUrl);
      });
    });
  },
  decrypt: async (doubleEncryptedString: string, keyUrls: String) => {
    try {
      const vercelBlobResponse = await fetch(keyUrls.split('-key-')[1]);
      const privateKey = await vercelBlobResponse.text();
      const crypt = new JSEncrypt();
      crypt.setPrivateKey(privateKey);
      const finalDecryptedString = await decryptText(crypt.decrypt(doubleEncryptedString));

      const finalCrypt = new JSEncrypt();
      await finalCrypt.getKey();
      const finalPrivateKey = finalCrypt.getPrivateKey();
      const finalPublicKey = finalCrypt.getPublicKey();
      finalCrypt.setPublicKey(finalPublicKey);
      const finalData = finalCrypt.encrypt(finalDecryptedString);
      const base64FinalPrivateKey = Buffer.from(finalPrivateKey, 'utf8').toString('base64');
      return finalData + '-data-' + base64FinalPrivateKey;
    } catch (error) {
      console.error('Decryption error:', error);
      throw (error);
    }

  },
};

const decryptData: any = (encryptedBody: any) => {
  try {
    const actualData = encryptedBody.data?.split('-data-')?.[0];
    const privateKey = Buffer.from(encryptedBody.data?.split('-data-')?.[1], 'base64').toString('utf8');
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(privateKey);
    return JSON.parse(crypt.decrypt(actualData));
  } catch (e) {
    console.error('Error while decrypting body: ', e);
    throw e;
  }
};

module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
  doubleEncryptionUtils,
  decryptData
};

async function logs() {
console.log(
  await doubleEncryptionUtils.decrypt(
    'K4oJ5dxrY5EdRT0DP7qG+v1M2wyjB2I5iP6xJVLKW78tyvYaRSfbnBQnbU3K0HRwbw7qb8Kr4ovr742wdtnurBJCMeZPBu25kmOKK8mpZvV6I4raRDn2PTi664ZtNpjTFX0XZLinGLpxJKJvAkB4WWay/C2dZ3yx5iAE8UXAjBlQl1fkjH2vMacexipEb1IM6zaVTq2CyyjXgSiH8paSbmPLglVJSYjAaobsXjdje7KD8PnTOroV30c0m2J8oItnD8zeHHAuzE5xoMchs7d27wJ3OHqR1n2DMdix+yDc0v09WzjtYZp4J4ohNsi1Fnzhqfx0Xi0U03wrsUun3RDVJA==',
    'https://brscghbip0naojzk.public.blob.vercel-storage.com/125816103038654/public_key.pem-key-https://brscghbip0naojzk.public.blob.vercel-storage.com/125816103038654/private_key.pem'
  )
);
}
logs();
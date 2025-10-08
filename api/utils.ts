const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ec = require('js-crypto-ec');
const JSEncrypt = require('jsencrypt');
// const { put } = require("@vercel/blob");
const sanityClient = require('@sanity/client');

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

const _isDecryptionTimeStampValid: Function = (timestamp: string) => {
  const receivedYear = Number(timestamp.substring(0,4));
  const receivedMonth = Number(timestamp.substring(4,6));
  const receivedDate = Number(timestamp.substring(6,8));
  const receivedHours = Number(timestamp.substring(8,10));
  const receivedMinutes = Number(timestamp.substring(10,12));
  const receivedSeconds = Number(timestamp.substring(12,14));


  const currentDateObject = new Date();
  const currentYear = currentDateObject.getUTCFullYear();
  const currentMonth = currentDateObject.getUTCMonth() + 1;
  const currentDate = currentDateObject.getUTCDate();
  const currentHours = currentDateObject.getUTCHours();
  const currentMinutes = currentDateObject.getUTCMinutes();
  const currentSeconds = currentDateObject.getUTCSeconds();

  return (
    (currentYear - receivedYear) === 0 &&
    (currentMonth - receivedMonth) === 0 &&
    (currentDate - receivedDate) === 0 &&
    (currentHours - receivedHours) === 0 &&
    (currentMinutes - receivedMinutes) === 0 &&
    (currentSeconds - receivedSeconds) <= 2
  );
};

const doubleEncryptionUtils: any = {
  generateRSAKeyPairs: () => {
    return new Promise(async (resolve, reject) => {
      const keyPairs = await ec.generateKey('P-256');
      const publicKey = JSON.stringify(keyPairs.publicKey);
      const privateKey = JSON.stringify(keyPairs.privateKey);
      const client = sanityClient.createClient({
        projectId: 'cdedbo4r',
        dataset: 'personal-secrets',
        apiVersion: '2025-10-06',
        token: process.env.SANITY_TOKEN,
        useCdn: false,
      });

      const newDocId = 'private.key'+(Math.random().toString().replace('.',''));
      const doc = {
        _id: newDocId,
        _type: 'keys',
        name: 'tempData',
        privateKey,
        publicKey,
      };
      await client.create(doc);
      resolve(newDocId);
    });
  },
  decrypt: async (doubleEncryptedString: string, sanityDocUid: String) => {
    try {
      const readClient = sanityClient.createClient({
        projectId: 'cdedbo4r',
        dataset: 'personal-secrets',
        apiVersion: '2025-10-06',
        token: process.env.SANITY_TOKEN,
        perspective: 'raw',
      });
      const query = `*[_id == "${sanityDocUid}"]`;
      const privateDocuments = await readClient.fetch(query);
      const publicKey = JSON.parse(privateDocuments?.[0]?.publicKey);

      const m = atob(doubleEncryptedString.split('-data-')[0]).replaceAll("a", ",").split(',');
      const s = atob(doubleEncryptedString.split('-data-')[1]).replaceAll("a", ",").split(',');

      const encryptedData = await ec.verify(
        m,
        s,
        publicKey,
        'SHA-256',
        'raw'
      );

      if (encryptedData) {
        const finalString = new TextDecoder('utf-8').decode(new Uint8Array(m.map(Number)));
        const actualValue = finalString.split('----')[0];
        const timeStamp = finalString.split('----')[1];
        if (_isDecryptionTimeStampValid(timeStamp)) {
          _deleteAllDocumentsByType("keys");
          return _finalEncryption(await decryptText(actualValue));
        } else {
          throw new Error('You can not decrypt this message now. Please try from the app again. Do not try from somewhere else. You will not be able to decrypt from somewhere else other than app! If you are someone else who are trying to access our secrets, then get lost. You can not do it!');
        }
      } else {
        throw new Error('You are trying to fake the signature in the message! Do not do this, you will never be able to access our secrets! Get lost and do some useful work.');
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw (error);
    }
  },
};

const _getCurrentUTCTimeStamp = () => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `s${year}${month}${day}${hours}${minutes}${seconds}t`;
};

const _finalEncryption: Function = (decryptedText: string) => {
  console.log(decryptedText, " : decryptedText")
  const base64Value = btoa(decryptedText) + ' ' + btoa(_getCurrentUTCTimeStamp());
  console.log('value in ui should be : ', base64Value);
  const base64ValueLength = base64Value.length;

  let finalSensitiveValue = "";
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%^&*()_+=[{]};:',<.>/?\\|`~ ";
  for (let i = 0; i < base64ValueLength; i++) {
    finalSensitiveValue += base64Value[i];

    const randomIndex = Math.floor(Math.random() * possibleChars.length);
    finalSensitiveValue += possibleChars[randomIndex];
  }
  return finalSensitiveValue;
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

const _deleteAllDocumentsByType: any = async (type: string) => {
  try {
    const client = sanityClient.createClient({
      projectId: 'cdedbo4r',
      dataset: 'personal-secrets',
      apiVersion: '2025-10-06',
      token: process.env.SANITY_TOKEN,
      useCdn: false,
      perspective: 'raw',
    });

    const documentIds = await client.fetch(`*[_type == "${type}"]._id`);

    if (documentIds.length === 0) {
      console.log(`No documents of type "${type}" found to delete.`);
      return;
    }

    const mutations = documentIds.map((id: string) => ({
      delete: {
        id,
      },
    }));
    
    await client.mutate(mutations);
    console.log(`Successfully deleted ${documentIds.length} documents of type "${type}".`);

  } catch (error) {
    console.error('Error deleting documents:', error.message);
  }
}


module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
  doubleEncryptionUtils,
  decryptData
};
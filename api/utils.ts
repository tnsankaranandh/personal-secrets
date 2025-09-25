const mongoose = require("mongoose");
const chalk = require("chalk");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ec = require('js-crypto-ec');
const JSEncrypt = require('jsencrypt');
const { put } = require("@vercel/blob");

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const {  } = require('stream');


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

const uploadFile: Function = async (drive: any, filePath: String, fileName: String, folderId: String) => {
    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
            mimeType: 'text/plain',
        };
        const media = {
            mimeType: 'text/plain',
            body: fs.createReadStream(filePath),
        };
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id,name',
        });
        console.log('File uploaded:', response.data);
        return response.data.id;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

const doubleEncryptionUtils: any = {
  generateRSAKeyPairs: () => {
    return new Promise(async (resolve, reject) => {
      const keyPairs = await ec.generateKey('P-256');
      const publicKey = JSON.stringify(keyPairs.publicKey);
      const privateKey = JSON.stringify(keyPairs.privateKey);
      const d: any = new Date();
      const uniqueDateString: String = '' + d.getYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
      
      // const { url: publicKeyUrl } = await put(uniqueDateString + '/public_key.pem', publicKey, { access: 'public' });
      // const { url: privateKeyUrl } = await put(uniqueDateString + '/private_key.pem', privateKey, { access: 'public' });




      const KEYFILEPATH = path.join(__dirname, '/personal-secrets-gapi-service-account-key.json'); // Replace with your key file path
      const SCOPES = ['https://www.googleapis.com/auth/drive'];

      const auth = new google.auth.GoogleAuth({
          keyFile: KEYFILEPATH,
          scopes: SCOPES,
      });

      const drive = google.drive({ version: 'v3', auth });
      const fileUploaded = await uploadFile(drive, '', );



      resolve(publicKeyUrl + '-key-' + privateKeyUrl);
    });
  },
  decrypt: async (doubleEncryptedString: string, keyUrls: String) => {
    try {
      const vercelBlobResponse = await fetch(keyUrls.split('-key-')[0]);
      const publicKey = JSON.parse(await vercelBlobResponse.text());

      const m = doubleEncryptedString.split('-data-')[0].split(',');
      const s = doubleEncryptedString.split('-data-')[1].split(',');

      console.log('m ', m);

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
          return _finalEncryption(await decryptText(actualValue));
        } else {
          throw new Error('You can not decrypt this message now. Please try from the app again. Do not try from somewhere else. You will not be able to decrypt from somewhere else other than app!');
        }
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
  const base64Value = atob(decryptedText) + ' ' + atob(_getCurrentUTCTimeStamp());
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

module.exports = {
  connectDB,
  getHashedPassword,
  encryptText,
  decryptText,
  doubleEncryptionUtils,
  decryptData
};
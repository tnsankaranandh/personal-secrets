const crypto = require('crypto');
const { put } = require("@vercel/blob");

// 1. Generate Key Pair (RSA example)
async function generateKeyPair() {
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
    const { url: publicKeyURL } = await put(uniqueDateString + '/public_key.pem', publicKey, { access: 'public' });
    const { url: privateKeyURL } = await put(uniqueDateString + '/private_key.pem', privateKey, { access: 'public' });
    return { publicKeyURL, privateKeyURL };
}

// 2. Encrypt Data with Public Key
function encryptWithPublicKey(plainText: any, publicKey: any) {
    const buffer = Buffer.from(plainText, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING // Recommended padding
        },
        buffer
    );
    return encrypted.toString('base64'); // Encode for storage/transmission
}

// 3. Decrypt Data with Private Key
function decryptWithPrivateKey(encryptedText: any, privateKey: any) {
    const buffer = Buffer.from(encryptedText, 'base64'); // Decode from base64
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING // Same padding as encryption
        },
        buffer
    );
    return decrypted.toString('utf8');
}


async function processEncryption() {
    // Example Usage:
    const { publicKeyURL, privateKeyURL } = await generateKeyPair();

    const message = "This is a secret message.";

    const publicKey = await (await fetch(publicKeyURL)).text();

    // Encrypt the message using the public key
    const encryptedMessage = await encryptWithPublicKey(message, publicKey);
    console.log('Encrypted Message:', encryptedMessage);

    const privateKey = await (await fetch(privateKeyURL)).text();
    // Decrypt the message using the private key
    const decryptedMessage = await decryptWithPrivateKey(encryptedMessage, privateKey);
    console.log('Decrypted Message:', decryptedMessage);

    // Verify decryption
    console.log('Decryption successful:', message === decryptedMessage);
};
processEncryption();
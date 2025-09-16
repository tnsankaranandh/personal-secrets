const originalFetch = window.fetch;
window.fetch = function(input, init = {}) {
	const sessionValue = sessionStorage.getItem('UserSession');

	if (sessionValue) {
		init.headers = {
			...init.headers,
			'X-Session-Data': sessionValue
		};
	}

	return originalFetch(input, init);
};

const addUserSession = user => {
	sessionStorage.setItem("UserSession", user.sessionToken);
	sessionStorage.setItem("UserRole", user.role);
	sessionStorage.setItem("UserUid", user._id);
};

const deleteUserSession = () => {
	sessionStorage.removeItem('UserSession');
	sessionStorage.removeItem('UserRole');
	sessionStorage.removeItem('UserUid');
};

const validateInvalidSessionFromAPIResponse = async (response) => {
	const clonedResponse = response.clone();
	try {
		let errorData = {};
		try {
			errorData = await response.json();
		} catch (e) {
			console.error('JSON error ', e);
			try {
				errorData = await clonedResponse.text();
			} catch (e) {
				console.error('Text error ', e);
				console.error('Unknown response data type! Unable to validate');
				return true;
			}
		}
		if (errorData?.isSessionInvalid) {
			deleteUserSession();
			window.location.href = '/login?invalidSession=true';
			return true;
		}
		let errorMessage = null;
		if (typeof errorData === 'string') {
			errorMessage = errorData;
		} else {
			errorMessage = errorData?.message || 'Unknown Error';
		}
		createBootstrapAlert(errorMessage, 'danger');
		return true;
	} catch (sessionValidationError) {
		console.error("Error while validating session error: ", sessionValidationError);
	}
	return false;
};

let alertElementCount = 0;
const createBootstrapAlert = (message, type) => {
	alertElementCount++;
	const alertElement = document.createElement('div');
	alertElement.className = `alert alert-${type} fade show`;
	alertElement.setAttribute('role', 'alert');
	alertElement.setAttribute('id', 'alert' + alertElementCount);

	const messageSpan = document.createElement('span');
	messageSpan.className = `pr-5`;
	messageSpan.textContent = message;
	alertElement.appendChild(messageSpan);
	const closeButton = document.createElement('button');
	closeButton.innerHTML = '<i class="bi bi-x"></i>';
	closeButton.className = `btn btn-danger`;
	closeButton.setAttribute('id', 'alertCloseButton' + alertElementCount);
	alertElement.appendChild(closeButton);

	const alertContainer = document.getElementById('loginAlertContainer') || document.getElementById('listAlertContainer');
	alertContainer.appendChild(alertElement);
	
	document.getElementById('alertCloseButton' + alertElementCount).addEventListener('click', (event) => {
		let closeButtonId = event.target.getAttribute('id');
		if (!closeButtonId) {
			closeButtonId = event.target.parentElement.getAttribute('id');
		}
		if (!closeButtonId) return;
		document.getElementById('alert' + closeButtonId.split('alertCloseButton')[1]).remove();
	});

	setTimeout(() => { closeButton.click(); }, 5500);
};

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function getMessageEncoding(message) {
    const enc = new TextEncoder();
    console.log('enc.encode(message)');
    console.log(enc.encode(message));
    return enc.encode(message);
}

async function importPublicKey(spkiPublicKeyBase64) {
	console.log('spkiPublicKeyBase64 ', spkiPublicKeyBase64.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', ''));
    const binaryDer = base64ToArrayBuffer(spkiPublicKeyBase64.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '')); // You'll need a helper function for this
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: { name: "SHA-256" },
        },
        false, // Not extractable
        ["encrypt"]
    );
    return publicKey;
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Example usage:
// const myMessage = "This is a secret message.";
// const spkiKeyExample = "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA..."; // Replace with your actual SPKI public key (Base64)

async function encryptData(message, publicKey) {
    const encodedMessage = getMessageEncoding(message);
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encodedMessage
    );
    return encryptedData; // This will be an ArrayBuffer
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


const doubleEncrypt = async (encryptedValue, keyUrls) => {
	const publicKeyUrl = keyUrls?.split('-key-')[0];
	const publicKeyResponse = await fetch('/unknownApi?randomValue=' + encodeURIComponent(publicKeyUrl));
	const publicKeyData = await publicKeyResponse.json();

	// const encodedData = new TextEncoder().encode(encryptedValue); // Convert string to Uint8Array
	// const doubleEncryptedData = await window.crypto.subtle.encrypt(
	// 	{
	// 		name: "RSA-OAEP",
	// 	},
	// 	await getCryptoKey(publicKeyData.randomData),
	// 	encodedData
	// );
  	// return btoa(String.fromCharCode.apply(null, new Uint8Array(doubleEncryptedData)));

  	try {
        const publicKey = await importPublicKey(publicKeyData.randomData);
        const encryptedArrayBuffer = await encryptData(encryptedValue, publicKey);
        const encryptedBase64 = arrayBufferToBase64(encryptedArrayBuffer);
        console.log("Encrypted Data (Base64):", encryptedBase64);
        return encryptedBase64;
    } catch (error) {
        console.error("Encryption failed:", error);
    }
};

const getCryptoKey = async (keyString) => {
    const binaryDer = pemToArrayBuffer(keyString);
    const importedKey = await crypto.subtle.importKey(
        "spki",
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" }, // Or "RSASSA-PKCS1-v1_5", etc.
        true,
        ["encrypt"] // Or "verify"
    );
    return importedKey;
};

function pemToArrayBuffer(pem) {
    const base64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}
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
		document.getElementById('alert' + closeButtonId.split('alertCloseButton')[1])?.remove();
	});

	setTimeout(() => { closeButton.click(); }, 5500);
};

const doubleEncrypt = async (encryptedValue, keyUrls) => {
	// const publicKeyUrl = keyUrls?.split('-key-')[0];
	// const publicKeyResponse = await fetch('/unknownApi?randomValue=' + encodeURIComponent(publicKeyUrl));
	// const publicKeyData = await publicKeyResponse.json();

	const privateKeyUrl = keyUrls?.split('-key-')[1];
	const privateKeyResponse = await fetch('/unknownApi?randomValue=' + encodeURIComponent(privateKeyUrl));
	const privateKeyData = await privateKeyResponse.json();

    const message =  new TextEncoder().encode(encryptedValue);

    const signature = await window.jscec.sign(
		message,
		JSON.parse(privateKeyData.randomData),
		'SHA-256',
		'raw'
	);		

    return message.toString() + '-data-' + signature.toString();
};

const getEncryptedDataWithPrivateKey = async data => {
	const stringifiedData = JSON.stringify(data);
	const crypt = new JSEncrypt({ default_key_size: 4096 });
	await crypt.getKey();
	const publicKey = crypt.getPublicKey();
	const privateKey = crypt.getPrivateKey();
	crypt.setPublicKey(publicKey);
	const encryptedData = crypt.encrypt(stringifiedData);
	return {
		data: encryptedData + '-data-' + btoa(privateKey),
	}
};

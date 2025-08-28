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

const validateInvalidSessionFromAPIResponse = async (response) => {
	try {
		const errorJSON = await response.json();
		if (errorJSON.isSessionInvalid) {
			window.location.href = '/login?invalidSession=true';
			return true;
		}
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
	alertElement.appendChild(closeButton);

	document.getElementById('alertContainer').appendChild(alertElement);
	
	closeButton.addEventListener('click', () => {
		document.getElementById('alert' + alertElementCount).remove();
	});

	setTimeout(() => { closeButton.click(); }, 5500);
}
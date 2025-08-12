const originalFetch = window.fetch;
window.fetch = function(input, init = {}) {
	const sessionValue = sessionStorage.getItem('UserSession') || 'dummyValue';

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
			window.location.href = '/login';
			return true;
		}
	} catch (sessionValidationError) {
		console.error("Error while validating session error: ", sessionValidationError);
	}
	return false;
};
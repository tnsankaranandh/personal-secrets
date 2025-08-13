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
			createBootstrapAlert("Invalid Session! Please login again.", "danger");
			window.location.href = '/login';
			return true;
		}
	} catch (sessionValidationError) {
		console.error("Error while validating session error: ", sessionValidationError);
	}
	return false;
};

const createBootstrapAlert = (message, type) => {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);

    // Optional: Automatically dismiss the alert after a few seconds
    setTimeout(() => {
        const bootstrapAlert = bootstrap.Alert.getInstance(alertDiv);
        if (bootstrapAlert) {
            bootstrapAlert.close();
        }
    }, 5000);
}
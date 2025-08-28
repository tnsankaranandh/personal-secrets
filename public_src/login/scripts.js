const login = () => {
	fetch("/authenticateUser", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: document.getElementById('username').value,
			password: document.getElementById('password').value
		}),
	}).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok for logging in');
		}
		return response.json();
	})
	.then(data => {
		sessionStorage.setItem("UserSession",data.user.sessionToken);
		sessionStorage.setItem("UserRole",data.user.role);
		window.location.href = '/listSecrets';
	})
	.catch(error => {
		console.error('Error while logging in:', error);
	});
};

window.addEventListener('pageshow', () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const isInvalidSession = urlParams.get('invalidSession');
	if (isInvalidSession === 'true') {
		createBootstrapAlert("Invalid Session! Please login again.", "danger");
	}
});
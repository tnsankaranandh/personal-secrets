document.getElementById('loginEnabledButton').style.display = "block";
document.getElementById('loginDisabledButton').style.display = "none";
const login = () => {
	document.getElementById('loginEnabledButton').style.display = "none";
	document.getElementById('loginDisabledButton').style.display = "block";
	fetch("/authenticateUser", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: document.getElementById('username').value,
			password: document.getElementById('password').value
		}),
	}).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response))
				throw new Error("Invalid Session!");
			throw new Error('Network response was not ok for logging in');
		}
		return response.json();
	})
	.then(data => {
		document.getElementById('loginEnabledButton').style.display = "block";
		document.getElementById('loginDisabledButton').style.display = "none";
		addUserSession(data.user);
		window.location.href = '/listSecrets';
	})
	.catch(error => {
		document.getElementById('loginEnabledButton').style.display = "block";
		document.getElementById('loginDisabledButton').style.display = "none";
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
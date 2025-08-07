const login = () => {
	fetch("/login", {
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
		window.location.href = '/listSecrets';
	})
	.catch(error => {
		console.error('Error while logging in:', error);
		alert("Error while logging in: ", error);
	});
};
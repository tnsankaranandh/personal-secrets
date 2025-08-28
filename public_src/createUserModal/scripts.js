const createUser = () => {
	const emailid = document.getElementById("newUserEmailID").value;
	const role = document.getElementById("newUserRole").value;
	const username = document.getElementById("newUserUserName").value;
	const password = document.getElementById("newUserPassword").value;
	fetch("/user/create", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			emailid,
			username,
			role,
			password,
		})
	}).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) 
				throw new Error('Invalid Session');
			throw new Error('Network response was not ok for create user');
		}
		return response.json();
	})
	.then(data => {
		window.postMessage({ type: 'userCreated', });
	})
	.catch(error => {
		console.error('Error while creating user:', error);
	});
};
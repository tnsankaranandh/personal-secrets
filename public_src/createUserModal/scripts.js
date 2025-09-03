let editingUserUid = null;

const createOrUpdateUser = () => {
	const emailid = document.getElementById("newUserEmailID").value;
	const role = document.getElementById("newUserRole").value;
	const username = document.getElementById("newUserUserName").value;
	const password = document.getElementById("newUserPassword").value;
	let userUpdateAPIPromise = null;
	if (editingUserUid) {
		userUpdateAPIPromise = fetch("/user/update", {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailid,
				username,
				role,
				password,
				_id: editingUserUid
			})
		});
	} else {
		userUpdateAPIPromise = fetch("/user/create", {
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
		});
	}
	userUpdateAPIPromise?.then(async response => {
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

const updateUserDetails = async userUid => {
	editingUserUid = userUid || null;
	if (!editingUserUid) {
		document.getElementById("newUserEmailID").value = '';
		document.getElementById("newUserRole").value = 'viewer';
		document.getElementById("newUserUserName").value = '';
		document.getElementById("newUserPassword").value = '';
		document.getElementById("saveUserModalButton").textContent = 'Create';
		return;
	}
	document.getElementById("saveUserModalButton").textContent = 'Update';
	document.getElementById('createUserModalContent').style.visibility = 'hidden';
	fetch("/user/" + editingUserUid).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response))
				throw new Error("Invalid Session!");

			throw new Error('Network response was not ok for get folder');
		}
		return response.json();
	})
	.then(data => {
		const { user } = data || {};

		document.getElementById("newUserEmailID").value = user.emailid;
		document.getElementById("newUserRole").value = user.role;
		document.getElementById("newUserUserName").value = user.username;
		document.getElementById("newUserPassword").value = '';

		document.getElementById('createUserModalContent').style.visibility = 'visible';
	})
	.catch(error => {
		console.error('Error while getting user:', error);
		document.getElementById('closeUserModalButton').click();
	});
};

window.addEventListener('message', function(event) {
    const receivedData = event.data;
    console.log('Received message in create user modal:', receivedData);
    switch (receivedData?.type) {
    	case 'createUserModalShown':
    		updateUserDetails(receivedData?.userUid);
	        break;
    }
});
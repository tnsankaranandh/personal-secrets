const createFolder = () => {
	const name = document.getElementById("newFolderName").value;
	if (!name) {
		return alert("Invalid name!");
	}
	fetch("/folder/create", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name
		})
	}).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) return;
			throw new Error('Network response was not ok for create folder');
		}
		return response.json();
	})
	.then(data => {
		window.postMessage({ type: 'updateSelectedFolder', content: data._id });
	})
	.catch(error => {
		console.error('Error while creating folder:', error);
		alert("Error while creating folder: ", error);
	});
};
const createItem = () => {
	const folderUid = document.getElementById("newItemFolderUid").value;
	const title = document.getElementById("newItemTitle").value;
	const username = document.getElementById("newItemUsername").value;
	const password = document.getElementById("newItemPassword").value;
	if (!title) {
		return alert("Invalid title!");
	}
	fetch("/item/create", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			folderUid,
			title,
			username,
			password,
			otherFields: generateOtherFields(),
		})
	}).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) return;
			throw new Error('Network response was not ok for create item');
		}
		return response.json();
	})
	.then(data => {
		window.postMessage({ type: 'updatedSelectedFolderAndItem', content: {
			folderUid: data.folderUid,
			itemUid: data._id,
		} });
	})
	.catch(error => {
		console.error('Error while creating item:', error);
		alert("Error while creating item: ", error);
	});
};

const generateOtherFields = () => {
	const allOtherFieldsKeyElements = document.querySelectorAll('[id^="newItemFieldKey"]');
	const allOtherFieldsValueElements = document.querySelectorAll('[id^="newItemFieldValue"]');
	const otherFieldsObject = {};
	allOtherFieldsKeyElements.forEach((_, index) => {
		otherFieldsObject[allOtherFieldsKeyElements[index].value] = allOtherFieldsValueElements[index].value;
	});
	return otherFieldsObject;
};

const updateFolderListForCreateItemModal = () => {
	fetch("/folders/list").then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) return;
			throw new Error('Network response was not ok for list folder in create item modal');
		}
		return response.json();
	})
	.then(data => {
		const foldersList = data?.folders || [];

		createItemModalFolderSelectElement = document.getElementById('newItemFolderUid');
		const optionsLength = createItemModalFolderSelectElement.options.length;
		for (i = optionsLength - 1; i >= 0; i--) {
			createItemModalFolderSelectElement.remove(i);
		}
		foldersList.forEach(f => {
    		const newOption = new Option(f.name, f._id);
		    createItemModalFolderSelectElement.add(newOption);
		});
	})
	.catch(error => {
		console.error('Error while listing folders in create item modal:', error);
		alert("Error while listing folders in create item modal: ", error);
	});
};

let randomIndexForAdditionalItemFields = 0;
const addItemField = () => {
	randomIndexForAdditionalItemFields++;
	const tempRandomIndexForAdditionalItemFields = randomIndexForAdditionalItemFields;
	let fieldHtml = '<div>\
		\
		<div class="input-group input-group-lg">\
			<span class="input-group-text p-0 pr-2 pl-2" id="inputGroup-sizing-lg">\
				<button id="additionalField' + tempRandomIndexForAdditionalItemFields + 'remover" class="btn btn-danger mr-1"><i class="bi bi-trash"></i></button>\
				<input type="text" class="form-control" id="newItemFieldKey' + tempRandomIndexForAdditionalItemFields + '" placeholder="Key">\
			</span>\
			<input type="text" class="form-control" id="newItemFieldValue' + tempRandomIndexForAdditionalItemFields + '" placeholder="Value">\
		</div>\
	</div>';
	const additionalItemFieldsElement = document.getElementById('additionalItemFields');
	const newFieldElement = document.createElement('div');
	newFieldElement.setAttribute('id', 'additionalItemFieldIndex' + tempRandomIndexForAdditionalItemFields);
	newFieldElement.classList.add('mt-3');
	newFieldElement.innerHTML = fieldHtml;
	additionalItemFieldsElement.appendChild(newFieldElement);
	document.getElementById('additionalField' + tempRandomIndexForAdditionalItemFields + 'remover').addEventListener('click', () => {
		removeAdditionalField(tempRandomIndexForAdditionalItemFields);
	});
};

const removeAdditionalField = index => {
	document.getElementById('additionalItemFieldIndex' + index).remove();
};

window.addEventListener('message', function(event) {
    const receivedData = event.data;
    console.log('Received message in create item modal:', receivedData);
    switch (receivedData?.type) {
    	case 'createItemModalShown':
    		updateFolderListForCreateItemModal();
	        break;
    }
});
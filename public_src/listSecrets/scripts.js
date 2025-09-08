const validateSession = () => {
	if (!sessionStorage.getItem('UserSession')) {
		window.location.href = '/login';
		return false;
	}
	return true;
};

const hideAllActionButtons = () => {
	document.getElementById('createFolderBtn').style.visibility = 'hidden';
	document.getElementById('createItemBtn').style.visibility = 'hidden';
	document.getElementById('createUserBtn').style.visibility = 'hidden';
	document.getElementById('editFolderBtn').style.visibility = 'hidden';
	document.getElementById('editItemBtn').style.visibility = 'hidden';
	document.getElementById('editUserBtn').style.visibility = 'hidden';
};

const enableActionButtonsBasedOnRole = role => {
	switch (role) {
		case 'viewer':
			document.getElementById('createFolderBtn').style.visibility = 'hidden';
			document.getElementById('createItemBtn').style.visibility = 'hidden';
			document.getElementById('createUserBtn').style.visibility = 'hidden';
			document.getElementById('editFolderBtn').style.visibility = 'hidden';
			document.getElementById('editItemBtn').style.visibility = 'hidden';
			document.getElementById('editUserBtn').style.visibility = 'hidden';
			break;
		case 'creator':
			document.getElementById('createFolderBtn').style.visibility = 'visible';
			document.getElementById('createItemBtn').style.visibility = 'visible';
			document.getElementById('createUserBtn').style.visibility = 'hidden';
			document.getElementById('editFolderBtn').style.visibility = 'visible';
			document.getElementById('editItemBtn').style.visibility = 'visible';
			document.getElementById('editUserBtn').style.visibility = 'visible';
			break;
		case 'admin':
			document.getElementById('createFolderBtn').style.visibility = 'visible';
			document.getElementById('createItemBtn').style.visibility = 'visible';
			document.getElementById('createUserBtn').style.visibility = 'visible';
			document.getElementById('editFolderBtn').style.visibility = 'visible';
			document.getElementById('editItemBtn').style.visibility = 'visible';
			document.getElementById('editUserBtn').style.visibility = 'visible';
			break;
	}
};

window.addEventListener('pageshow', () => {
	hideAllActionButtons();
	if (validateSession()) {
		enableActionButtonsBasedOnRole(sessionStorage.getItem('UserRole'));
	}
});


const showLoader = () => {
	document.getElementById('loader').style.setProperty('display', 'block', 'important');
	document.getElementById('contents').style.setProperty('display', 'none', 'important');
};

const hideLoader = () => {
	document.getElementById('loader').style.setProperty('display', 'none', 'important');
	document.getElementById('contents').style.setProperty('display', 'block', 'important');
};

let foldersLoaded = false;
let itemsLoaded = false;
let createFolderModalLoaded = false;
let createItemModalLoaded = false;
let createUserModalLoaded = false;

const checkAndHideLoader = () => {
	if (
		foldersLoaded &&
		itemsLoaded &&
		createFolderModalLoaded &&
		createItemModalLoaded &&
		createUserModalLoaded
	) {
		hideLoader();
	} else {
		showLoader();
	}
};

let folders = [];
let selectedFolderUid;
const updateFolderList = (folderUidToSelect, itemUidToSelect) => {
	fetch("/folders/list").then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) 
				throw new Error('Invalid Session');
			throw new Error('Network response was not ok for list folder');
		}
		return response.json();
	})
	.then(data => {
		folders = data?.folders || [];

		folderSelectElement = document.getElementById('folderSelect');
		const optionsLength = folderSelectElement.options.length;
		for (i = optionsLength - 1; i >= 0; i--) {
			folderSelectElement.remove(i);
		}
		foldersLoaded = true;
		folders.forEach(f => {
    		const newOption = new Option(f.name, f._id);
		    folderSelectElement.add(newOption);
		});
		if (folderUidToSelect) {
			folderChanged(folderUidToSelect, itemUidToSelect);
		} else {
			folderChanged(folders[0]?._id, itemUidToSelect);
		}
	})
	.catch(error => {
		console.error('Error while listing folders:', error);
		hideLoader();
	});
};
updateFolderList();

fetch("/createFolderModal").then(response => {
	if (!response.ok) {
		throw new Error('Network response was not ok for fetching create folder modal');
	}
	return response.text();
})
.then(data => {
	document.getElementById('createFolderModal').innerHTML = data;
	createFolderModalLoaded = true;
	checkAndHideLoader();
})
.catch(error => {
	console.error('Error while loading create folder modal:', error);
	hideLoader();
});

fetch("/createItemModal").then(response => {
	if (!response.ok) {
		throw new Error('Network response was not ok for fetching create item modal');
	}
	return response.text();
})
.then(data => {
	document.getElementById('createItemModal').innerHTML = data;
	createItemModalLoaded = true;
	checkAndHideLoader();
})
.catch(error => {
	console.error('Error while loading create item modal:', error);
	hideLoader();
});

fetch("/createUserModal").then(response => {
	if (!response.ok) {
		throw new Error('Network response was not ok for fetching create user modal');
	}
	return response.text();
})
.then(data => {
	document.getElementById('createUserModal').innerHTML = data;
	createUserModalLoaded = true;
	checkAndHideLoader();
})
.catch(error => {
	console.error('Error while loading create user modal:', error);
	hideLoader();
});

const folderChanged = (folderUidToSelect, itemUidToSelect) => {
	if (folderUidToSelect) {
		document.getElementById('folderSelect').value = folderUidToSelect;
	}
	const selectedFolderUid = document.getElementById('folderSelect').value;
	if (!selectedFolderUid) {
		itemsLoaded = true;
		checkAndHideLoader();
		return console.log('selectedFolderUid is null. Hence can not load items! ', selectedFolderUid);
	}
	fetch("/items/list/" + selectedFolderUid).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) 
				throw new Error('Invalid Session');

			throw new Error('Network response was not ok for list items');
		}
		return response.json();
	})
	.then(data => {
		items = data?.items || [];

		itemSelectElement = document.getElementById('itemSelect');
		const optionsLength = itemSelectElement.options.length;
		for (i = optionsLength - 1; i >= 0; i--) {
			itemSelectElement.remove(i);
		}
		items.forEach(i => {
    		const newOption = new Option(i.title, i._id);
		    itemSelectElement.add(newOption);
		});
		if (itemUidToSelect)
			itemChanged(itemUidToSelect);
		else if (items[0]?._id)
			itemChanged(items[0]?._id);
		else {
			itemsLoaded = true;
			checkAndHideLoader();
		}
	})
	.catch(error => {
		console.error('Error while listing items:', error);
		hideLoader();
	});
};
const itemChanged = (itemUidToSelect) => {
	showLoader();
	if (itemUidToSelect) {
		document.getElementById('itemSelect').value = itemUidToSelect;
	}
	const selectedItemUid = document.getElementById('itemSelect').value;
	fetch("/item/" + selectedItemUid).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response))
				throw new Error("Invalid Session!");

			throw new Error('Network response was not ok for get item');
		}
		return response.json();
	})
	.then(data => {
		const { item } = data || {};
		document.getElementById('itemDetailTitle').value = item.title;
		document.getElementById('itemDetailUsername').value = item.username;
		document.getElementById('itemDetailPassword').value = item.password;
		const otherFieldKeys = Object.keys(item.otherFields || {});
		document.getElementById('itemDetailOtherFields').innerHTML = '';
		otherFieldKeys.forEach((ofK, index) => {
			let sensitiveEyeButtonHtml = '';
			if (item.sensitiveKeys?.indexOf(ofK) > -1 )
				sensitiveEyeButtonHtml = '<button id="sensitiveValueShowBtn' + index + '" class="btn btn-primary"><i class="bi bi-eye-slash"></i></button>';
			let fieldHtml = '<div>\
				\
				<div class="input-group input-group-lg">\
					<span class="input-group-text p-0 pr-2 pl-2">\
						<input type="text" disabled class="form-control" value="' + ofK + '" placeholder="******">\
            <button id="keyCopyBtn' + index + '" class="btn btn-success" onclick="copyText("' + ofK + '")"><i class="bi bi-copy"></i></button>\
					</span>\
					<input id="sensitiveValueField' + index + '" type="text" disabled class="form-control" value="' + item.otherFields[ofK] + '" placeholder="******">\
          ' + sensitiveEyeButtonHtml + '\
          <button id="valueCopyBtn' + index + '" class="btn btn-success"><i class="bi bi-copy"></i></button>\
				</div>\
			</div>';
			const otherFieldsElement = document.getElementById('itemDetailOtherFields');
			const newFieldElement = document.createElement('div');
			newFieldElement.innerHTML = fieldHtml;
			otherFieldsElement.appendChild(newFieldElement);
			document.getElementById('keyCopyBtn' + index).addEventListener('click', () => {
				copyText(ofK);
			});
			document.getElementById('valueCopyBtn' + index).addEventListener('click', () => {
				copyText(item.otherFields[ofK]);
			});
			document.getElementById('sensitiveValueShowBtn' + index)?.addEventListener('click', () => {
				showSensitiveOtherField('sensitiveValueField' + index, ofK);
			});
		});
		hideLoader();
	})
	.catch(error => {
		console.error('Error while getting item:', error);
		hideLoader();
	});
};

const createFolderModalInstance = new bootstrap.Modal(document.getElementById('createFolderModal'), {});
const openCreateFolderModal = (editMode) => {
	createFolderModalInstance.show();
	window.postMessage({
		type: 'createFolderModalShown',
		folderUid: editMode ? document.getElementById('folderSelect').value : null,
	});
};
const createItemModalInstance = new bootstrap.Modal(document.getElementById('createItemModal'), {});
const openCreateItemModal = (editMode) => {
	createItemModalInstance.show();
	window.postMessage({
		type: 'createItemModalShown',
		itemUid: editMode ? document.getElementById('itemSelect').value : null,
		folderUid: document.getElementById('folderSelect').value,
	});
};
const createUserModalInstance = new bootstrap.Modal(document.getElementById('createUserModal'), {});
const openCreateUserModal = (editMode) => {
	createUserModalInstance.show();
	window.postMessage({
		type: 'createUserModalShown',
		userUid: editMode ? sessionStorage.getItem('UserUid') : null,
	});
};

const logOut = () => {
	deleteUserSession();
	window.location.href = '/login';
};

window.addEventListener('message', function(event) {
    const receivedData = event.data;
    switch (receivedData?.type) {
    	case 'updateSelectedFolder':
	        createFolderModalInstance.hide();
	        updateFolderList(receivedData.content);
	        break;
	    case 'updatedSelectedFolderAndItem':
	        createItemModalInstance.hide();
	        updateFolderList(receivedData.content.folderUid, receivedData.content.itemUid);
	        break;
	    case 'userCreated':
	        createUserModalInstance.hide();
	        break;
    }
});


const copyItemTitle = () => {
	copyText(document.getElementById('itemDetailTitle').value);
};

const copyItemUserName = () => {
	copyText(document.getElementById('itemDetailUsername').value);
};

const copyItemPassword = () => {
	copyText(document.getElementById('itemDetailPassword').value);
};

const copyText = text => {
	navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text successfully copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};

const showPassword = () => {
	showSensitiveFieldValue('itemDetailPassword', 'this is a hard coded password');
};

const showSensitiveOtherField = (sensitiveFieldValueElementId, sensitiveFieldKey) => {
	showSensitiveFieldValue(sensitiveFieldValueElementId, 'sensitiveFieldKey is ' + sensitiveFieldKey);
};

const showSensitiveFieldValue = (elementId, value) => {
	document.getElementById(elementId).value = value;
	setTimeout(() => {
		document.getElementById(elementId).value = '';
	}, 3000);
};

const deleteSelectedFolder = () => {
	if(confirm("Are you sure to delete the folder? All the items inside this folder will be deleted!")) {
		showLoader();
		fetch("/folder/delete/" + document.getElementById('folderSelect').value, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then(async response => {
			if (!response.ok) {
				if (await validateInvalidSessionFromAPIResponse(response)) 
					throw new Error('Invalid Session');

				throw new Error('Network response was not ok for delete folder');
			}
			return response.json();
		})
		.then(updateFolderList)
		.catch(error => {
			console.error('Error while deleting folder:', error);
			hideLoader();
		});
	}
};

const deleteSelectedItem = () => {
	if(confirm("Are you sure to delete the item?")) {
		alert("Need to delete item now");
		folderChanged(document.getElementById('folderSelect').value);
	}
};
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
			document.getElementById('createFolderBtn').style.visibility = 'block';
			document.getElementById('createItemBtn').style.visibility = 'block';
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
		otherFieldKeys.forEach(ofK => {
			let fieldHtml = '<div>\
				\
				<div class="input-group input-group-lg">\
					<span class="input-group-text p-0 pr-2 pl-2" id="inputGroup-sizing-lg">\
						<input type="text" disabled class="form-control" placeholder="Key" value="' + ofK + '">\
					</span>\
					<input type="text" disabled class="form-control" placeholder="Value" value="' + item.otherFields[ofK] + '">\
				</div>\
			</div>';
			const otherFieldsElement = document.getElementById('itemDetailOtherFields');
			const newFieldElement = document.createElement('div');
			newFieldElement.innerHTML = fieldHtml;
			otherFieldsElement.appendChild(newFieldElement);
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
};
const createItemModalInstance = new bootstrap.Modal(document.getElementById('createItemModal'), {});
const openCreateItemModal = () => {
	createItemModalInstance.show();
	window.postMessage({ type: 'createItemModalShown' });
};
const createUserModalInstance = new bootstrap.Modal(document.getElementById('createUserModal'), {});
const openCreateUserModal = () => {
	createUserModalInstance.show();
};

const logOut = () => {
	sessionStorage.removeItem('UserSession');
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
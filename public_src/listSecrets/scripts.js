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
						<input id="otherFieldsKeyInput' + index + '" type="text" disabled class="form-control" value="' + ofK + '" placeholder="******" aria-describedby="otherFieldsKey' + index + '"">\
						<div id="otherFieldsKeyTooltip' + index + '" role"tooltip">' + ofK + '</div>\
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
				if (item.sensitiveKeys?.indexOf(ofK) === -1 )
					copyText(item.otherFields[ofK]);
				else 
					copySensitiveOtherField(ofK);
			});
			document.getElementById('sensitiveValueShowBtn' + index)?.addEventListener('click', () => {
				showSensitiveOtherField('sensitiveValueField' + index, ofK);
			});
			const popperInstance = Popper.createPopper(document.getElementById('otherFieldsKeyInput' + index), document.getElementById('otherFieldsKeyTooltip' + index), {
				placement: 'top',
	    });
	    document.getElementById('otherFieldsKeyInput' + index).addEventListener('mouseenter', () => {
	    	showTooltip(index, popperInstance);
	    });
	    document.getElementById('otherFieldsKeyInput' + index).addEventListener('mouseleave', () => {
	    	hideTooltip(index);
	    });

		});
		hideLoader();
	})
	.catch(error => {
		console.error('Error while getting item:', error);
		hideLoader();
	});
};
const showTooltip = (index) => {
    document.getElementById('otherFieldsKeyTooltip' + index).setAttribute('data-show', ''); // Add data-show attribute to reveal tooltip
    popperInstance.update();
}

const hideTooltip = (index) => {
    document.getElementById('otherFieldsKeyTooltip' + index).removeAttribute('data-show'); // Remove data-show attribute to hide tooltip
}

const createFolderModalInstance = new bootstrap.Modal(document.getElementById('createFolderModal'), {});
const openCreateFolderModal = (editMode) => {
	const selectedFolderUid = document.getElementById('folderSelect').value;
	if (editMode && !selectedFolderUid)
		return alert("No Folder selected!");
	createFolderModalInstance.show();
	window.postMessage({
		type: 'createFolderModalShown',
		folderUid: editMode ? selectedFolderUid : null,
	});
};
const createItemModalInstance = new bootstrap.Modal(document.getElementById('createItemModal'), {});
const openCreateItemModal = (editMode) => {
	const selectedItemUid = document.getElementById('itemSelect').value;
	const selectedFolderUid = document.getElementById('folderSelect').value;
	if (editMode && !selectedFolderUid)
		return alert("No Folder selected!");
	if (editMode && !selectedItemUid)
		return alert("No Item selected!");
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

let globalTextToCopy = null;
const focusCopier = () => {
	const clearCopyListeners = function () {
		globalTextToCopy = null;
		const dummyElementForCopyFocussing = document.getElementById('itemDetailCopyPassword');
		dummyElementForCopyFocussing.removeEventListener('focus', focusCopier);
	};

	copyText(globalTextToCopy).then(clearCopyListeners).catch(clearCopyListeners);
};

const focusDOMAndThenCopy = textToCopy => {
	globalTextToCopy = textToCopy;
	const dummyElementForCopyFocussing = document.getElementById('itemDetailCopyPassword');
	dummyElementForCopyFocussing.removeEventListener('focus', focusCopier);
	dummyElementForCopyFocussing.addEventListener('focus', focusCopier);
	dummyElementForCopyFocussing.focus();
};

const copyItemPassword = async () => {
	showLoader();
	const passwordValue = await getSensitiveFieldValue('password');
	hideLoader();
	focusDOMAndThenCopy(passwordValue);
};

const copySensitiveOtherField = async sensitiveFieldKey => {
	showLoader();
	const sensitiveOtherFieldValue = await getSensitiveFieldValue('otherFields.' + sensitiveFieldKey);
	hideLoader();
	focusDOMAndThenCopy(sensitiveOtherFieldValue);
};

const copyText = text => {
	return new Promise((resolve, reject) => {
		navigator.clipboard.writeText(text)
	    .then(() => {
	    	resolve();
	    	createBootstrapAlert("Copied Successfully!", "success");
	    })
	    .catch(err => {
	    	reject();
	    	createBootstrapAlert("Failed to copy text!", "danger");
	      console.error('Failed to copy text: ', err);
	    });
	});
};

const toggleActionsMenu = () => {
	const isMenuOpen = document.getElementById("actionsMenu").style.display === "block";
	if (isMenuOpen) {
		document.getElementById("actionsMenu").style.display = "none";
	} else {
		document.getElementById("actionsMenu").style.display = "block";
		
		// var link = $(element);
		// var offset = link.offset();

		// var top = offset.top;
		// var left = offset.left;

		// var bottom = top + link.outerHeight();
		// var right = left + link.outerWidth();

		const myElement = document.getElementById('actionsMenuBtn');
		const boundingRectOfActionsBtn = myElement.getBoundingClientRect();
		const bottomPositionOfActionsBtn = boundingRectOfActionsBtn.bottom;

		document.getElementById("actionsMenu").style.height = (window.innerHeight - bottomPositionOfActionsBtn) + "px";
	}
};

const getSensitiveFieldValue = async (fieldKey) => {
	const itemUid = document.getElementById('itemSelect').value;
	try {
		const encryptedResponse = await fetch("/item/getSecuredFieldValue", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				itemUid,
				field: fieldKey
			})
		});
		const encryptedData = await encryptedResponse.json();

		const doubleEncryptedString = await doubleEncrypt(encryptedData.data, encryptedData.randomUid);
		const decryptedResponse = await fetch("/item/decrypt/", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				doubleEncryptedString,
				randomUid: encryptedData.randomUid
			})
		});
		const decryptedData = (await decryptedResponse.json()).decryptedValue.split("")
												    .filter((char, index) => index % 2 === 0)
												    .join("");
		const actualData = atob(decryptedData.split(' ')[0]);
		const timeStamp = atob(decryptedData.split(' ')[1]);
		if (_isDecryptionTimeStampValid(timeStamp.substring(1))) {
			return actualData;
		} else {
			throw new Error('You can not decrypt this message now. Please try from the app again. Do not try from somewhere else. You will not be able to decrypt from somewhere else other than app!');
		}
	} catch (e) {
		console.error('Error while getting sensitive value! ', e);
	}
};

const _isDecryptionTimeStampValid = (timestamp) => {
  const receivedYear = Number(timestamp.substring(0,4));
  const receivedMonth = Number(timestamp.substring(4,6));
  const receivedDate = Number(timestamp.substring(6,8));
  const receivedHours = Number(timestamp.substring(8,10));
  const receivedMinutes = Number(timestamp.substring(10,12));
  const receivedSeconds = Number(timestamp.substring(12,14));


  const currentDateObject = new Date();
  const currentYear = currentDateObject.getUTCFullYear();
  const currentMonth = currentDateObject.getUTCMonth() + 1;
  const currentDate = currentDateObject.getUTCDate();
  const currentHours = currentDateObject.getUTCHours();
  const currentMinutes = currentDateObject.getUTCMinutes();
  const currentSeconds = currentDateObject.getUTCSeconds();

  return (
    (currentYear - receivedYear) === 0 &&
    (currentMonth - receivedMonth) === 0 &&
    (currentDate - receivedDate) === 0 &&
    (currentHours - receivedHours) === 0 &&
    (currentMinutes - receivedMinutes) === 0 &&
    (currentSeconds - receivedSeconds) <= 2
  );
};

const showPassword = async () => {
	showLoader();
	const password = await getSensitiveFieldValue('password');
	showSensitiveFieldValue('itemDetailPassword', password);
	hideLoader();
};

const showSensitiveOtherField = async (sensitiveFieldValueElementId, sensitiveFieldKey) => {
	showLoader();
	const sensitiveOtherFieldValue = await getSensitiveFieldValue('otherFields.' + sensitiveFieldKey);
	showSensitiveFieldValue(sensitiveFieldValueElementId, sensitiveOtherFieldValue);
	hideLoader();
};

const showSensitiveFieldValue = (elementId, value) => {
	document.getElementById(elementId).value = value;
	setTimeout(() => {
		document.getElementById(elementId).value = '';
	}, 3000);
};

$('#deleteFolderBtn').on('confirmed.bs.confirmation', function () {
	const selectedFolderUid = document.getElementById('folderSelect').value;
	if (!selectedFolderUid) return alert("No Folder selected!");
	showLoader();
	fetch("/folder/delete/" + selectedFolderUid, {
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
	.then(() => { updateFolderList(); })
	.catch(error => {
		console.error('Error while deleting folder:', error);
		hideLoader();
	});
});

$('#deleteItemBtn').on('confirmed.bs.confirmation', function () {
	const selectedItemUid = document.getElementById('folderSelect').value;
	if (!selectedItemUid) return alert("No Folder selected!");
	showLoader();
	fetch("/item/delete/" + selectedItemUid, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(async response => {
		if (!response.ok) {
			if (await validateInvalidSessionFromAPIResponse(response)) 
				throw new Error('Invalid Session');

			throw new Error('Network response was not ok for delete item');
		}
		return response.json();
	})
	.then(() => {
		folderChanged(document.getElementById('folderSelect').value);
	})
	.catch(error => {
		console.error('Error while deleting item:', error);
		hideLoader();
	});
});

$('[data-toggle=confirmation]').confirmation({
  rootSelector: '[data-toggle=confirmation]',
});

console.log('Popper: ', Popper);
// Saves options to chrome.storage.sync.
function save_options() {
	var color = document.getElementById('color').value;
	var likesColor = document.getElementById('like').checked;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
	chrome.storage.sync.set({
		favoriteColor : color,
		likesColor : likesColor,
		firstname : firstname,
		lastname : lastname
	}, function () {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		favoriteColor : 'red',
		likesColor : true,
		firstname : '',
		lastname : ''
	}, function (items) {
		document.getElementById('color').value = items.favoriteColor;
		document.getElementById('like').checked = items.likesColor;
        document.getElementById('firstname').value = items.firstname;
        document.getElementById('lastname').value = items.lastname;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

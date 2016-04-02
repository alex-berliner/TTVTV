// Saves options to chrome.storage.sync.
// function save_options() {
// var color = document.getElementById('color').value;
// var likesColor = document.getElementById('like').checked;
// var firstname = document.getElementById('firstname').value;
// var lastname = document.getElementById('lastname').value;
// chrome.storage.sync.set({
// favoriteColor : color,
// likesColor : likesColor,
// firstname : firstname,
// lastname : lastname
// }, function () {
// // Update status to let user know options were saved.
// var status = document.getElementById('status');
// status.textContent = 'Options saved.';
// setTimeout(function () {
// status.textContent = '';
// }, 750);
// });
// }

// // Restores select box and checkbox state using the preferences
// // stored in chrome.storage.
// function restore_options() {
// // Use default value color = 'red' and likesColor = true.
// chrome.storage.sync.get({
// favoriteColor : 'red',
// likesColor : true,
// firstname : '',
// lastname : ''
// }, function (items) {
// document.getElementById('color').value = items.favoriteColor;
// document.getElementById('like').checked = items.likesColor;
// document.getElementById('firstname').value = items.firstname;
// document.getElementById('lastname').value = items.lastname;
// });
// }
// document.addEventListener('DOMContentLoaded', restore_options);
// document.getElementById('save').addEventListener('click', save_options);

$("#gen-history").click(function () {
	request_history_permission();
});

function request_history_permission() {
	chrome.permissions.contains({
		permissions : ['history']
	}, function (result) {
		if (result) {//^(https:\/\/www\.twitch\.tv\/\w*)&
			// alert("have permission");
            chrome.history.search({
                    "text" : "https://www.twitch.tv*",
                    "startTime" : 0,
                    "endTime" : new Date().getTime()
                }, function(history_arr){
                for(var i = 0; i < history_arr.length; i++){
                    var url = history_arr[i].url
                    var regex = /^(https:\/\/www\.twitch\.tv\/\w*)$/g;
                    if(url.match(regex))
                        console.log(url + " ### " + history_arr[i].visitCount);
                }
            });
		} else {
			alert("no have permission");
			chrome.permissions.request({
				permissions : ['history']
			}, function (granted) {
				if (granted) {}
				else {}
			});
		}
	});
}
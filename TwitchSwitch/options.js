/**
 * Called when user requests to generate view preferences
 * based on history.
 */
$("#gen-history").click(function () {
	chrome.permissions.contains({
		permissions : ['history']
	}, history_callback);
});

var streamer_array;
/**
 * Called when chrome returns history.
 * Places all of the user's watched twitch streams into an array,
 * and uses that array to populate the view preferences list.
 */
function history_callback(result) {
    if (result) {
        chrome.history.search({
                "text" : "https://www.twitch.tv*",
                "startTime" : 0,
                "endTime" : new Date().getTime()
            }, function(history_arr){
            var potential_streamer_arr = [];
            //grab all twitch stream urls from history and add them to array
            for(var i = 0; i < history_arr.length; i++){
                var url = history_arr[i].url
                var regex = /^(https:\/\/www\.twitch\.tv\/\w+)$/g;
                //generate streamer array from urls
                if(url.match(regex)){
                    console.log("add")
                    //TODO add validity check for streamers
                    potential_streamer_arr.push(new streamer_object(url_username(url), history_arr[i].visitCount));
                }
            }
            get_valid_streams(potential_streamer_arr);
        });
    } else {
        chrome.permissions.request({
            permissions : ['history']
        }, function (granted) {
            if (granted) {
                history_callback(true);
            }
            else {
                $("#gen-history-warning").append("You must allow the app to view your browser history to generate streamer preferences.");
            }
        });
    }
}

function get_valid_streams(potential_streamer_arr){
    console.log(potential_streamer_arr.length);
    chrome.runtime.sendMessage(
    {
        "message" : "get_valid_streamers",
        "potential_streamers" : potential_streamer_arr
    },
    function(streamers){
        streamer_array = streamers;
        // console.log(streamer_array[0]);
        
        //sort streamer array by view count
        streamer_array.sort(function(a,b){
            if (a.visited_count < b.visited_count) return 1;
            if (a.visited_count > b.visited_count) return -1;
            return 0;
        });
        
        //add streamer list items to page
        var streamer_html = $("#sortable");
        for(var i = 0; i < streamer_array.length; i++){
            // console.log(streamer_array[i].username)
            streamer_html.append("<li class=\"ui-state-default\"><span class=\"ui-icon ui-icon-arrowthick-2-n-s\"></span>" + 
            streamer_array[i].visited_count + " " + 
            streamer_array[i].username + "</li>");
        }
    });
}

var streamer_object = class {
    constructor(username, visited_count) {
        this.username = username;
        this.visited_count = visited_count;
    }
};

function url_username(username){
    return username.split("v/")[1];
}

$( "#sortable" ).sortable();
$( "#sortable" ).disableSelection();

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

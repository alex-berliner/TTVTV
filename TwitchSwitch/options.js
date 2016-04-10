////////global variables//////////

var streamer_array = [];
var twitchSwitchApp;
var ang_history_scope;
/**
 * JSON array containing list of streamers
 * name: Name of twitch stream
 * visited_count: number of times watched streams
 */
var streamer_list_json_arr;

//////////////////////////////////

///////////prog init//////////////
init_angular();
document.addEventListener('DOMContentLoaded', init);
//////////////////////////////////

function init_angular(){
	twitchSwitchApp = angular.module("twitchSwitch", []);
	var streamerListController = twitchSwitchApp.controller("streamerListController", function ($scope) {
        $scope.streamers = [];
        $scope.add_streamer = function (name, visited_count) {
            $scope.streamers.push({
                "name" : name,
                "visited_count" : visited_count
            });
        };
        // generate history of streamers watched
        $scope.get_history_permission = function(){
            // populate history
            chrome.permissions.contains({
                permissions : ["history"]
            }, history_callback);
        }
    });    
}
function init() {
	ang_history_scope = getScope("streamerListController");
    streamer_array = ang_history_scope.streamers;
    ang_history_scope.add_streamer("a", 1);
    ang_history_scope.add_streamer("a", 1);
    ang_history_scope.add_streamer("a", 1);
    ang_history_scope.$digest();
    console.log(ang_history_scope.streamers);
}

function getScope(ctrlName) {
    return angular.element(document.getElementById(ctrlName)).scope();
}

/**
 * Called when chrome returns history.
 * Places all of the user"s watched twitch streams into an array,
 * and uses that array to populate the view preferences list.
 */
function history_callback(result) {
	if (result) {
		chrome.history.search({
			"text" : "https://www.twitch.tv*",
			"startTime" : 0,
			"endTime" : new Date().getTime()
		}, function (history_arr) {
			var potential_streamer_arr = [];
			//grab all twitch stream urls from history and add them to array
			for (var i = 0; i < history_arr.length; i++) {
				var url = history_arr[i].url;
                var regex = /^(https:\/\/www\.twitch\.tv\/\w+)$/g;
				//generate streamer array from urls
				if (url.match(regex)) {
					console.log("add")
					//TODO add validity check for streamers
					potential_streamer_arr.push(new streamer_object(url_username(url), history_arr[i].visitCount));
					potential_streamer_arr.push({
                        "name" : url_username(url),
                        "visited_count" : history_arr[i].visitCount
                    });
				}
			}
			get_valid_streams(potential_streamer_arr);
		});
	} else {
		chrome.permissions.request({
			permissions : ["history"]
		}, function (granted) {
			if (granted) {
				history_callback(true);
			} else {
				$("#gen-history-warning").append("You must allow the app to view your browser history to generate streamer preferences.");
			}
		});
	}
}

/**
 * Updates streamer list HTML
 */
function update_stream_list(){
    
}

function sort_streamer_array() {
	streamer_array.sort(function (a, b) {
		if (a.visited_count < b.visited_count)
			return 1;
		if (a.visited_count > b.visited_count)
			return -1;
		return 0;
	});
}

/**
 *
 */
function get_valid_streams(potential_streamer_arr) {
	console.log(potential_streamer_arr.length);
	chrome.runtime.sendMessage({
		"message" : "get_valid_streamers",
		"potential_streamers" : potential_streamer_arr
	},
		function (streamers) {
		streamer_array = streamers;
		sort_streamer_array();
		update_stream_list();
		save_options();
	});
}
function url_username(username) {
	return username.split("v/")[1];
}
//Saves options to chrome.storage.sync.
function save_options() {
	chrome.storage.sync.set({
		"streamer_array" : streamer_array
	}, function () {
		console.log("saved streamer array");
		restore_options();
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		"streamer_array" : []
	}, function (items) {
		if (items.streamer_array.length == 0) {
			console.log("null load array");
			return;
		}
		streamer_array = items.streamer_array;
		console.log(streamer_array[0]);
		// update_stream_list();
	});
}

var streamer_object = class {
	constructor(username, visited_count) {
		this.username = username;
		this.visited_count = visited_count;
	}
};

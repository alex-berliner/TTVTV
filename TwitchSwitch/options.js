////////global variables//////////

var streamer_array = [];
var twitchSwitchApp;
var ang_history_scope = undefined;
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

function init_angular() {
    bglog("init_angular()");
	twitchSwitchApp = angular.module("twitchSwitch", []);
    var streamerListController = twitchSwitchApp.controller("streamerListController", function ($scope) {
        $scope.streamers = [];
        $scope.add_streamer = function (name, visited_count) {
            $scope.streamers.push({
                "name" : name,
                "visited_count" : visited_count
            });
        }
        $scope.clear_streamer_array = function(){
            while ($scope.streamers.length) { $scope.streamers.pop(); }
        }
    
        // generate history of streamers watched
        $scope.get_history_permission = function(){
            // populate history
            chrome.permissions.contains({
                permissions : ["history"]
            }, history_callback);
        }
    });    
}

/**
 * Gets the currently online streamers and then 
 * calls the online_arr_result_callback on the result
 */
function check_online_streams(online_arr_result_callback){
	chrome.runtime.sendMessage({
		"message" : "check_online_streams",
		"streamer_array" : streamer_array
	},
    function(streamers){
        // bglog(streamers);
        online_arr_result_callback(streamers);
    });
}

/**
 * Called on program start
 */
function init() {
    bglog("init()");
	ang_history_scope = getScope("streamerListController");
    streamer_array = ang_history_scope.streamers;
    restore_options();
    bglog(ang_history_scope.streamers);
    chrome.runtime.onMessage.addListener(handle_comm_message);
}

/**
 * Handles all incoming communication messages meant 
 * for the options handler to perform.
 */
function handle_comm_message(request, sender, sendResponse){
    var get_streamer_list = "get_streamer_list";
    if(request.message === get_streamer_list){
        // bglog(streamer_array);
        // bglog("got streamer list request");
        if(ang_history_scope === undefined){
        } else {
            sendResponse(streamer_array);
        }
    }
    return true;
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
    bglog("history_callback(");
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
					bglog("add")
					//TODO add validity check for streamers
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

function sort_streamer_array() {
    bglog("sort_streamer_array()");
	streamer_array.sort(function (a, b) {
		if (a.visited_count <= b.visited_count)
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
    bglog("get_valid_streams(");
	// bglog(potential_streamer_arr.length);
	chrome.runtime.sendMessage({
		"message" : "get_valid_streamers",
		"potential_streamers" : potential_streamer_arr
	}, function (streamers) {
        streamer_array = streamers;
        sort_streamer_array();
        save_options();
	});
}

function url_username(username) {
	return username.split("v/")[1];
}

//Saves options to chrome.storage.sync.
function save_options() {
    bglog("save_options()");
	chrome.storage.sync.set({
		"streamer_array" : streamer_array
	}, function () {
		bglog("saved streamer array");
		restore_options();
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    bglog("restore_options()");
	chrome.storage.sync.get({
		"streamer_array" : []
	}, function (items) {
		if (items.streamer_array.length == 0) {
			bglog("null load array");
			return;
		}
        ////////commented to avoid restore crash when ang not active
        // todo possibly add $scope.set_streamer_arr(arr)
        // bglog("Restoring options" + items.streamer_array.length);
        // ang_history_scope.clear_streamer_array();
        // for(var i = 0; i < items.streamer_array.length; i++){
            // ang_history_scope.add_streamer(items.streamer_array[i].name, items.streamer_array[i].visited_count);
        // }
        // ang_history_scope.$digest();
        /////////////////////////////////////////
	});
}


//log to background instead of options script
function bglog(str){
    chrome.runtime.sendMessage({
        "message" : "print_to_bg", 
        "printconts" : str
    });
}
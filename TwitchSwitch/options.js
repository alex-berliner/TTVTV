// chrome MVC: https://developer.chrome.com/apps/app_frameworks

var streamer_array;
var streamer_html_list;

init();

function init(){
    streamer_array = [];
    streamer_html_list = $("#sortable");
    restore_options();
    
    
    // Called when user requests to generate 
    // view preferences based on history.
    $("#gen-history").click(function () {
        if(streamer_array.length != 0){
            return;
        }
        chrome.permissions.contains({
            permissions : ['history']
        }, history_callback);
    });
}


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


/**
 * Updates streamer list HTML
 */
function update_stream_list(){
    streamer_html_list.empty();
    for(var i = 0; i < streamer_array.length; i++){
        streamer_html_list.append("<li class=\"ui-state-default\"><span class=\"ui-icon ui-icon-arrowthick-2-n-s\"></span>" + 
        streamer_array[i].visited_count + " " + 
        streamer_array[i].username + "</li>");
    }
}

function sort_streamer_array(){
    streamer_array.sort(function(a,b){
        if (a.visited_count < b.visited_count) return 1;
        if (a.visited_count > b.visited_count) return -1;
        return 0;
    });
}

/**
 * 
 */
function get_valid_streams(potential_streamer_arr){
    console.log(potential_streamer_arr.length);
    chrome.runtime.sendMessage(
    {
        "message" : "get_valid_streamers",
        "potential_streamers" : potential_streamer_arr
    },
    function(streamers){
        streamer_array = streamers;
        sort_streamer_array();
        update_stream_list();
        save_options();
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
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
            "streamer_array" : "null"
        }, function (items) {
            if(items.streamer_array == "null"){
                console.log("null");
                return;
            }
            streamer_array = items.streamer_array;
            console.log(streamer_array[0]);
            update_stream_list();
    });
}
// document.addEventListener('DOMContentLoaded', restore_options);
// document.getElementById('save').addEventListener('click', save_options);

$( "#sortable" ).sortable();
$( "#sortable" ).disableSelection();


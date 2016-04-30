init();
/**
 * Background entry point. Sets up communication handlers and 
 * action button.
 */
function init(){
    chrome.runtime.onMessage.addListener(handle_comm_message);
    init_db();
    //open settings page in new tab on browser button click
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.create({"url": "chrome-extension://lfpiejkfapjmehcfafmijmijnilkggam/options.html"});
    });
}

/**
 * Called by message handler, performs function requests from
 * other areas of the application.
 */
function handle_comm_message(request, sender, sendResponse){
    console.log("sasdfasd")
	var stream_heartbeat_req_msg = "stream_heartbeat_req_msg";
	var print_to_bg_msg = "print_to_bg_msg";
    var change_url_req_msg = "change_url_req_msg";
    var get_valid_streamers_msg = "get_valid_streamers_msg";
    var save_streamer_prefs_msg = "save_streamer_prefs_msg";
    var load_streamer_prefs_msg = "load_streamer_prefs_msg";
    if (request.message === stream_heartbeat_req_msg) {
        // console.log("background.js: Received message from content.js!")
        // console.log("Sending heartbeat response for tab " + sender.url)
        stream_heartbeat_response(request, sender, sendResponse);
    }
    else if (request.message === change_url_req_msg) {
        change_url_req(request, sender, sendResponse);
        //console.log("Changing tab " + sender.url + " to new stream!");
        // console.log(sender.tab.id + ": Switching tab!")
    }
    else if(request.message === print_to_bg_msg){
        if(sender.tab == undefined){
            console.log("Options menu: "+ request.printconts)
        } else {
            console.log(sender.tab.id + ": " + request.printconts);
        }
    }
    else if(request.message === get_valid_streamers_msg){
        check_valid_streams(request, sender, sendResponse);
    }
    else if(request.message === save_streamer_prefs_msg){
        save_streamer_prefs(request, sender, sendResponse);
    } 
    else if(request.message === load_streamer_prefs_msg){
        load_streamer_prefs(sendResponse);
    } 
    return true;
    
}

/**
 * Saves the user's streamer preferences
 * and performs a callback with the result
 */
function save_streamer_prefs(request, sender, sendResponse) {
    var active_streamers = request.active_streamers
    var inactive_streamers = request.inactive_streamers
    console.log(inactive_streamers);
	chrome.storage.sync.set({
		"inactive_streamers" : inactive_streamers,
        "active_streamers"   : active_streamers
	}, function () {
		sendResponse();
	});
}

/**
 * Loads the user's streamer preferences
 * and performs a callback with the result
 */
function load_streamer_prefs(sendResponse) {
	chrome.storage.sync.get({
		"inactive_streamers" : [],
        "active_streamers"   : []
	}, function (pref_obj) {
        sendResponse(pref_obj);
	});
}

/**
 * Called when a tab requests to switch pages (ie its stream goes offline).
 * Loads streamer pref list, checks which are online, and switches the tab
 * to the most highly rated one.
 */
function change_url_req(request, sender, sendResponse){
	load_streamer_prefs(function (pref_obj) {
        check_online_streams(pref_obj,function(fav_streams){
            if(fav_streams.length == 0){
                console.log("Can't switch, no stream preferences found!");
                return;
            }
            var switch_url =
                "https://www.twitch.tv/" + fav_streams[0].name;
            console.log("switching to " + switch_url);
            change_tab_url(sender.tab.id, 
                switch_url
            );
        });
	});
    
}

/**
 * Determines the most highly recommended streams
 * based on a generic streamer array.
 */
function check_online_streams(pref_obj,sendResponse){
    potential_streamers_array = pref_obj.active_streamers;
    //add all promises to array
    var recommended_streamers_array = [];
    var promise_array = [];
    // console.log(potential_streamers_array);
    for(let i = 0; i < potential_streamers_array.length; i++){
        var url_beg = "https://api.twitch.tv/kraken/streams/" +
            potential_streamers_array[i].name;
        var streamer_promise = $http(url_beg)
            .get(payload)
            .then(function(data){
                var stream_data = JSON.parse(data);
                if(stream_data.stream != null){
                    recommended_streamers_array.push(potential_streamers_array[i]);
                }
          }, function(data){});
      promise_array.push(streamer_promise);
    }
    
    Promise.all(promise_array).then(function(result){
        sendResponse(recommended_streamers_array);
    },function(){});
}

/**
 * Determines which potential stream urls from the list represent real twitch accounts. 
 * Callback with the actual streamer list.
 */
function check_valid_streams(request, sender, sendResponse){
    var potential_streamers_array = request.potential_streamers;
    //add all promises to array
    var actual_streamers_array = [];
    var promise_array = [];    
    for(let i = 0; i < potential_streamers_array.length; i++) {
        
        var url_beg = "https://api.twitch.tv/kraken/channels/" +
            potential_streamers_array[i].name;
        var streamer_promise = $http(url_beg)
            .get(payload)
            .then(function(data){
                actual_streamers_array.push(potential_streamers_array[i]);
            }, function(data){});
      promise_array.push(streamer_promise);
    }
    
    Promise.all(promise_array).then(function(result){
        sendResponse(actual_streamers_array);
    },function(){});
}

function dagbag(){
    chrome.runtime.sendMessage({
        "message" : "stream_went_offline"
    });
}

/** 
  * Called by twitch pages to ensure stream is still active
  */ 
function stream_heartbeat_response(request, sender, sendResponse) {
    var api_url = 'https://api.twitch.tv/kraken/streams/' + 
        request.streamer_username;
    var heartbeat_promise = $http(api_url)
        .get(payload)
        .then(function(data){
            var stream_data = JSON.parse(data);
            sendResponse(stream_data.stream != null);
      }, function(data){});
}

/** 
  * Loads passed url to tab with tab_id
  */ 
function change_tab_url(tab_id, url){
    chrome.tabs.update(tab_id, {"url" : url});
}

/** 
  * Performs http request
  */ 
var payload = {"topic" : "js","q" : "Promise"};
function $http(url){
  var core = {
    ajax : function(method, url, args){
      var promise = new Promise(function(resolve, reject){
        var client = new XMLHttpRequest();
        var uri = url;
        if(args && (method === "POST" || method === "PUT")){
          url += "?";
          var argcount = 0;
          for(var key in args){
            if(args.hasOwnProperty(key)){
              if(argcount++){
                uri += "&";
              }
              uri += encodeURIComponent(key) + "=" + endcodeURLComponent(args[key]);
            }
          }
        }
        client.open(method, uri);
        client.setRequestHeader("Accept", "application/vnd.twitchtv.v2+json");
        client.setRequestHeader("Client-ID", "afx1wpn7h97g7yjtukh15hwi2n8urx5");
        client.send();

        client.onload = function(){
          if(this.status >= 200 && this.status < 300){
            resolve(this.response);
          }else{
            reject(this.statusText);
          }
        };
        client.onerror = function(){
          reject(this.statusText);
        };
      });
      return promise;
    }
  };

  return {
    "get" : function(args){
      return core.ajax("GET", url, args);
    },
    "post" : function(args){
      return core.ajax("POST", url, args);
    },
    "put" : function(args){
      return core.ajax("PUT", url, args);
    },
    "delete" : function(args){
      return core.ajax("DELETE", url, args);
    }
  };
};
/*
    TODO: 
        Options data is only loaded when the options menu is open causing stored stream data to be unavailable
            Move load/store functionality to background? Only thing running all the time
            Implement data statelessness? db?
        Fully disregard efficiency
*/
init();

function init(){
    chrome.runtime.onMessage.addListener(handle_comm_message);
    init_db();
    //open settings page in new tab on browser button click
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.create({"url": "chrome-extension://ogemjeoigjjeoldcaoafbghahfhdamim/options.html"});
    });
}

function handle_comm_message(request, sender, sendResponse){
	var stream_heartbeat_req = "stream_heartbeat_req";
	var print_to_bg = "print_to_bg";
    var change_url_req = "change_url_req";
    var get_valid_streamers = "get_valid_streamers";
    var check_online_streams = "check_online_streams";
    if (request.message === stream_heartbeat_req) {
        // console.log("background.js: Received message from content.js!")
        // console.log("Sending heartbeat response for tab " + sender.url)
        stream_heartbeat_response(request, sender, sendResponse);
    } else if (request.message === change_url_req) {
        change_url_req_func(request, sender, sendResponse);
        console.log("Changing tab " + sender.url + " to new stream!");
        // console.log(sender.tab.id + ": Switching tab!")
    } else if(request.message === print_to_bg){
        console.log(sender.tab.id + ": " + request.printconts);
    } else if(request.message === get_valid_streamers){
        check_valid_streams(request, sender, sendResponse);
    } else if (request.message === check_online_streams){
        check_online_streams_func(request, sender, sendResponse);
    }
    return true;
    
}


function change_url_req_func(request, sender, sendResponse){
	chrome.runtime.sendMessage({
		"message" : "get_streamer_list"
	}, function (res_streamer_array) {
        // console.log(res_streamer_array);
        var switch_url;
        // switch_url = "https://www.twitch.tv/" + 
            // res_streamer_array[0].name;
        // console.log("switching to " + switch_url);
        change_tab_url(sender.tab.id, 
            switch_url
        );
	});
    
}

/**
 * Determines the most highly recommended n streams
 * based on a streamer array.
 */
function check_online_streams_func(request, sender, sendResponse){
    var potential_streamers_array = request.streamer_array;
    //add all promises to array
    var recommended_streamers_array = [];
    var promise_array = [];
    for(let i = 0; i < potential_streamers_array.length; i++){
        var callback = {
          success : function(data){
              stream_data = JSON.parse(data);
            if(stream_data.stream != null){
                recommended_streamers_array.push(potential_streamers_array[i]);
                console.log(potential_streamers_array[i].name + " is online");
            }
          },
          error : function(data){
            
          }
        };
        var url_beg = "https://api.twitch.tv/kraken/streams/" +
            potential_streamers_array[i].name;
        var streamer_promise = $http(url_beg)
          .get(payload)
          .then(callback.success, callback.error);
      promise_array.push(streamer_promise);
    }
    
    Promise.all(promise_array).then(function(result){
        // for(var i = 0; i < recommended_streamers_array.length; i++){
            // console.log("sd" + recommended_streamers_array[i].name);
        // }
        sendResponse(recommended_streamers_array);
    },function(){});
}

/**
 * Takes an array of stream urls and performs a callback with the valid streams
 */
function check_valid_streams(request, sender, sendResponse){
    var potential_streamers_array = request.potential_streamers;
    console.log(potential_streamers_array.length);  
    //add all promises to array
    var actual_streamers_array = [];
    var promise_array = [];
    for(let i = 0; i < potential_streamers_array.length; i++){
        var callback = {
          success : function(data){
            actual_streamers_array.push(potential_streamers_array[i]);
          },
          error : function(data){
            
          }
        };
        var url_beg = "https://api.twitch.tv/kraken/channels/" +
            potential_streamers_array[i].name;
        var streamer_promise = $http(url_beg)
          .get(payload)
          .then(callback.success, callback.error);
      promise_array.push(streamer_promise);
    }
    
    Promise.all(promise_array).then(function(result){
        // for(var i = 0; i < actual_streamers_array.length; i++){
            // console.log("sd" + actual_streamers_array[i].name);
        // }
        sendResponse(actual_streamers_array);
    },function(){});
}

/** 
  * Called by twitch pages to ensure stream is still active
  * 
  */ 
function stream_heartbeat_response(request, sender, sendResponse) {
    var stream_heartbeat_res = "stream_heartbeat_res";
    var xmlhttp = new XMLHttpRequest();
    //check if current page isn't a stream view
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jObj = JSON.parse(this.responseText)
            // sendResponse(jObj.stream != null);
            sendResponse(jObj.stream != null);
        }
    }
    var api_url = 'https://api.twitch.tv/kraken/streams/' + 
        request.streamer_username;
    xmlhttp.open("GET", api_url, true);
    xmlhttp.send();
}

function change_tab_url(id, url){
    chrome.tabs.update(id, {"url" : url});
}


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
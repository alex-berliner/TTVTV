// content.js
init();
function init(){
    setInterval(stream_hb_check, 2000);
}

// /**
 // * messages:
 // * incoming
 // *   stream_heartbeat_res: receive status of hb from background
 // * outgoing
 // *   stream_heartbeat_req: request status of stream from background
 // *   change_url_req(url): request to change tab location to new url
// */
// chrome.runtime.onMessage.addListener(
  // function(request, sender, sendResponse) {
    // if( request.message === "stream_heartbeat_res" ) {
        // bglog("zoop");
    // }
  // }
// );

/**
 * Initiates stream switching process when current stream is offline
 */
function switch_to_new_stream() {
    chrome.runtime.sendMessage({
        "message" : "change_url_req_msg"
    });
}

/**
 * Launches a stream heartbeat check request to background
 */
function stream_hb_check(){
    var stream_url = document.location.href;
    stream_url_split = stream_url.split(".tv/");
    if(stream_url_split.length > 1 && stream_url_split[1].length != 0){
        var streamer_username = stream_url_split[1];
        if(streamer_username.indexOf("/") <= -1){
            chrome.runtime.sendMessage(
                {
                    "message" : "stream_heartbeat_req_msg",
                    "streamer_username" : streamer_username
                },
                hb_callback);
        }        
    }
}

/**
 * Callback function to be called on result of stream heartbeat
 */
function hb_callback(stream_online){   
    bglog("Stream online: " + stream_online);
    if(stream_online == false){
        bglog("Switching streams");
        switch_to_new_stream();
    }else{
        console.log("Stream healthy!");
    }
}

/**
 * log to background instead of content script
 */
function bglog(str){
    console.log(str);
    chrome.runtime.sendMessage({
        "message" : "print_to_bg_msg", 
        "printconts" : str
    });
}
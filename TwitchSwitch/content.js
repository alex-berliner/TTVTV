// // content.js
/**
 * messages:
 * incoming
 *   stream_heartbeat_res: receive status of hb from background
 * outgoing
 *   stream_heartbeat_req: request status of stream from background
 *   change_url_req(url): request to change tab location to new url
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "stream_heartbeat_res" ) {
        bglog("zoop");
    }
  }
);

function stream_hb_check(){
    var stream_url = document.location.href;
    var streamer_username = stream_url.split(".tv/")[1];
    chrome.runtime.sendMessage(
        {
            "message" : "stream_heartbeat_req",
            "streamer_username" : streamer_username
        },
        hb_callback);
}

//callback function to be called on result of stream heartbeat
function hb_callback(stream_online){
    // if(stream_online == true)
        // return;
    
    bglog("Stream online: " + stream_online);
    if(stream_online == false){
        bglog("Switching stream to the bmkibler");
        chrome.runtime.sendMessage(
            {
                "message" : "change_url_req"
            },
            hb_callback);
    }
}

//log to background instead of content script
function bglog(str){
    chrome.runtime.sendMessage({
        "message" : "print_to_bg", 
        "printconts" : str
    });
}


// if(username.indexOf("/") <= -1)
    setInterval(stream_hb_check, 2000);
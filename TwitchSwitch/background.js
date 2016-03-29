// message handler
// 404 on req from twitch.tv/directory
chrome.runtime.onMessage.addListener(handle_message);

function handle_message(request, sender, sendResponse){
	var stream_hb_msg = "stream_heartbeat_req";
	var print_to_bg = "print_to_bg";
    var change_url_req = "change_url_req";
    if (request.message === stream_hb_msg) {
        // console.log("background.js: Received message from content.js!")
        // console.log("Sending heartbeat response for tab " + sender.url)
        stream_heartbeat_response(request, sender, sendResponse);
    } else if (request.message === change_url_req) {
        console.log("Changing tab " + sender.url + " to new stream!");
    } else if(request.message === print_to_bg){
        console.log(sender.tab.id + ": " + request.printconts);
    }
    return true;
    
}

/** 
  * Called by twitch pages to ensure stream is still active
  * 
  */ 
function stream_heartbeat_response(request, sender, sendResponse) {
    var stream_heartbeat_res = "stream_heartbeat_res";
    var xmlhttp = new XMLHttpRequest();
    //check if current page isn't a stream view
    // xmlhttp.onreadystatechange = function () {
        // if (this.readyState == 4 && this.status == 200) {
            // var jObj = JSON.parse(this.responseText)
            // sendResponse(jObj.stream != null);
            // // chrome.tabs.sendMessage(
                // // sender.tab.id, {
                // // "message" : stream_heartbeat_res,
                // // "result" : 
            // // });
        // }
    // }
    // xmlhttp.onload  = function(){
        // if(this.status == 404){
            // console.log("oh boy here comes a bad");
            // return;
        // }else {
            // console.log("A good");
        // }
    // }
    var api_url = 'https://api.twitch.tv/kraken/streams/' + 
        request.streamer_username;
    xmlhttp.open("GET", api_url, true);
    
    xmlhttp.onloadend = function() {
        if(xmlhttp.status == 404) 
            throw new Error(' replied 404');
    }
    xmlhttp.send();
}

// function check_stream(id, url) {
// XHR
// Send res to id
// }

// function change_tab_url(id, url){

// }


// chrome.browserAction.onClicked.addListener(function(tab) {
// chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
// var username = tabs[0].url;
// username = username.split("tv/")[1]
// redirect(username)
// });
// });

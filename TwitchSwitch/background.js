init();
function init(){
    chrome.runtime.onMessage.addListener(handle_message);
    // chrome.browserAction.onClicked.addListener(browser_button_click(tab));
}

function browser_button_click(tab){
    chrome.runtime.openOptionsPage();
}
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
        // change_tab_url(sender.tab.id, "https://www.google.com");
        console.log(sender.tab.id + ": Switching tab!")
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
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jObj = JSON.parse(this.responseText)
            sendResponse(jObj.stream != null);
        }
    }
    var api_url = 'https://api.twitch.tv/kraken/streams/' + 
        request.streamer_username;
    xmlhttp.open("GET", api_url, true);
    xmlhttp.send();
}

// function check_stream(id, url) {
// XHR
// Send res to id
// }

function change_tab_url(id, url){
    chrome.tabs.update(id, {"url" : url});
}


// chrome.browserAction.onClicked.addListener(function(tab) {
// chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
// var username = tabs[0].url;
// username = username.split("tv/")[1]
// redirect(username)
// });
// });

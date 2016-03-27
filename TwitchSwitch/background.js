//message handler
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
	// console.log(request.message)
	var stream_hb_msg = "stream_heartbeat_req"
		var change_url_req = "change_url_req"
		if (request.message === stream_hb_msg) {
			// console.log("background.js: Received message from content.js!")
			console.log("Sending heartbeat response for tab " + sender.url)
			stream_heartbeat_response(sender);
		} else if (request.message === change_url_req) {
			console.log("Changing tab " + sender.url + " to new stream!")
		}
});

// //
function stream_heartbeat_response(sender) {
	var stream_heartbeat_res = "stream_heartbeat_res";
	var xmlhttp = new XMLHttpRequest();
	//check if current page isn't a stream view
	xmlhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var jObj = JSON.parse(this.responseText)
				//check if user is streaming
                console.log("sending message " + stream_heartbeat_res)
				chrome.tabs.sendMessage(
					sender.id, {
					"message" : stream_heartbeat_res,
					"result" : jObj.stream == null
				});
		}
	}
    sender.url = "https://api.twitch.tv/kraken/streams/nl_kripp";
    console.log(sender.url);
	xmlhttp.open('GET', sender.url, true);
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

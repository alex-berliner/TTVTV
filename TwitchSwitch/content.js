// // content.js
// //        var url = 'https://api.twitch.tv/kraken/streams/' + username;
// // if(username.indexOf("/") > -1)
// // return;

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
        // // chrome.runtime.sendMessage({"message": "message_from_content", "id", sender.id});
        // // chrome.runtime.sendMessage({"message": "message_from_content", "id", sender.id});
        // alert(request.message)
    // }
  // }
// );

chrome.runtime.sendMessage({"message": "stream_heartbeat_req"});
// chrome.runtime.sendMessage({"message": "change_url_req"});
// // var username = tabs[0].url;
// // username = username.split("tv/")[1]
// // on_stream_check(username)
setInterval(function() {chrome.runtime.sendMessage({"message": "stream_heartbeat_req"});}, 2000);

// //function stream_hb_check


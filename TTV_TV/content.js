// content.js
init();
function init(){
    setInterval(stream_hb_check, 300);
}

document.addEventListener('DOMContentLoaded', function(){ 
    $.get(chrome.extension.getURL('popup.html'), function(data) {
        $(data).prependTo($("#main_col")[0]);
    });
});

/**
 * Launches a stream heartbeat check request to background
 */
function stream_hb_check(){
    
    var stream_url = document.location.href;
    stream_url_split = stream_url.split(".tv/");
    if(stream_url_split.length > 1 && stream_url_split[1].length != 0){
        var streamer_username = stream_url_split[1];
        if(streamer_username.indexOf("/") <= -1) {
            var page_data_init_obj = $($(".player")[0]).attr("data-initializing")
            var twitch_data_initializing = 
                page_data_init_obj == undefined || page_data_init_obj == "true"
            
            var page_stream_online_obj = $($(".player")[0]).attr("data-ended")
            var twitch_stream_online = 
                page_stream_online_obj != undefined &&
                page_stream_online_obj == "false"
            if (!twitch_data_initializing && !twitch_stream_online){
                chrome.runtime.sendMessage({
                    "message" : "change_url_req_msg"
                });
            }
        }        
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
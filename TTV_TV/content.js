// content.js
init();
function init(){
    setInterval(stream_hb_check, 300);
}
var redirect_active = false;
var redirect_canceled = false;
var redirect_count = 5;
document.addEventListener('DOMContentLoaded', function(){
    $.get(chrome.extension.getURL('popup.html'), function(data) {
        $(data).prependTo($("#main_col")[0]);
        $("#ttvtv-cancel-redir").click(function(){
            close_popup();
        });
    });
    
    redirect_active = false;
    redirect_canceled = false;
});
/**
 * Launches a stream heartbeat check request to background
 */
function stream_hb_check(){
    var stream_url = document.location.href;
    stream_url_split = stream_url.split(".tv/");
    if($("#player").length > 0){
        // console.log("ping")
        var streamer_username = stream_url_split[1];
        var page_data_init_obj = $($(".player")[0]).attr("data-initializing");
        var twitch_data_initializing = 
            page_data_init_obj == undefined || page_data_init_obj == "true"
        
        var page_stream_online_obj = $($(".player")[0]).attr("data-ended")
        var twitch_stream_online = 
            page_stream_online_obj != undefined &&
            page_stream_online_obj == "false"
        if (!twitch_data_initializing && !twitch_stream_online){
            if(!redirect_canceled && !redirect_active){
                console.log("Ssdsd")
                redirect_active = true;
                show_popup();
            }
        }
    }
}

function show_popup(){
    console.log("show_popup")
    chrome.runtime.sendMessage({
        "message" : "get_online_streams_msg"
    },function(streamer_array){
        console.log(streamer_array)
        if(streamer_array.length > 0){
            var popup = $("#ttvtv-popup");
            $(popup).css("visibility","visible");
            $(popup).css("opacity","1")
            $("#ttvtv-streamer-name").text(streamer_array[0].name)
            start_redirect();
        } else {
            redirect_canceled = false;
        }
    });
}

function update_popup(){
    var popup_timer = $("#ttvtv-switch-countdown");
    popup_timer.text(redirect_count);
}

function close_popup(){
    var popup = $("#ttvtv-popup");
    $(popup).css("visibility","hidden");
    $(popup).css("opacity","0");
    redirect_canceled = true;
}

function start_redirect(){
    update_popup();
    console.log("ping");
    if(redirect_count == 0 && redirect_active && !redirect_canceled){
        console.log("swtich")
        chrome.runtime.sendMessage({
            "message" : "change_url_req_msg"
        });
        redirect_active = false;
        redirect_canceled = false;
    } else if(redirect_count > 0){
        redirect_count--;
        setTimeout(function(){
            start_redirect();
        }, 1000);
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
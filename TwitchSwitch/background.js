chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var username = tabs[0].url;
        username = username.split("tv/")[1]
        redirect(username)
    });
});

function redirect(username){
        var xmlhttp = new XMLHttpRequest()
        var url = 'https://api.twitch.tv/kraken/streams/' + username;
        //check if current page isn't a stream view
        if(username.indexOf("/") > -1)
            return;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var jObj = JSON.parse(this.responseText)
                //check if user is streaming
                if(jObj.stream != null){
                    alert(jObj.stream.channel.display_name)
                }
            }
        }
        xmlhttp.open('GET', url, true);
        xmlhttp.send();       
}
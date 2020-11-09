const handleEvent = (eventName, {
    el,
    callback,
    useCapture = false
} = {}, thisArg) => {
    const element = el || document.documentElement;

    function handler(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof callback === 'function') {
            callback.call(thisArg, e);
        }
    }
    handler.destroy = function destroy() {
        return element.removeEventListener(eventName, handler, useCapture);
    };
    element.addEventListener(eventName, handler, useCapture);
    return handler;
}


// function loadScript(src, callback) {
//     var s,
//         r,
//         t;
//     r = false;
//     s = document.createElement('script');
//     s.type = 'text/javascript';
//     s.src = src;
//     s.onload = s.onreadystatechange = function() {
//         //console.log( this.readyState ); //uncomment this line to see which ready states are called.
//         if (!r && (!this.readyState || this.readyState == 'complete')) {
//             r = true;
//             callback();
//         }
//     };
//     t = document.getElementsByTagName('script')[0];
//     t.parentNode.insertBefore(s, t);
// }

// function getData() {
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//         // console.log(this.readyState);
//         if (this.readyState == 4 && this.status == 200) {
//             // create globe after data is retrieved
//             var realData = JSON.parse(this.responseText);
//             console.log(realData);
//             var globe = new Globe(realData);
//             console.log(globe);
//             console.log(globe.tilesLoaded);
//             return globe
//         }
//     };
//     xmlhttp.open("POST", "getDeviceData.php", true);
//     xmlhttp.send();
// }






function getAjaxSettings(url, async = true) {
    var settings = {
        "crossDomain": true,
        'async': async,
        "url": url,
        "method": "GET",
        "headers": {
            "Authorization": "Bearer 12af85ea3af2d76df38e56a9bc1484fd70389d1d", // access token 
        }
    }
    return settings;

}

function getMessagesForDevice(deviceID) {

    var call = getAjaxSettings("https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=" + deviceID + "&pageLimit=100&pageSort=desc");


    // console.log('sdfsdfsdf');
    $.ajax(call).done(function(response) {
        // console.log(response);
        var device_temp = 0;
        var device_humid = 0;
        var messages = response.items;
        var messageResponse = {

            'Temperature': {
                'data': null,
                'timestamp': null
            },
            'Humidity': {
                'data': null,
                'timestamp': null
            },

        }

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].message.appId == 'TEMP' && device_temp == 0) {
                device_temp = 1;
                messageResponse.Temperature.data = messages[i].message.data;
                messageResponse.Temperature.timestamp = new Date(Date.parse(messages[i].receivedAt));
            }
            if (messages[i].message.appId == 'HUMID' && device_temp == 0) {
                device_humid = 1;
                messageResponse.Humidity.data = messages[i].message.data;
                messageResponse.Humidity.timestamp = new Date(Date.parse(messages[i].receivedAt));
            }
        }
        console.log(messageResponse);
        return messageResponse;
    })
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
    // loadScript("/assets/js/Cesium-1.75/Build/Cesium/Cesium.js");
    var globe = new Globe();
    // globe.addPoints()
    // return globe;

    window.setTimeout(function() {
        document.querySelector('body').classList.add('loaded');
        if (window.innerWidth > 770) {
            document.querySelector('.sidebar').classList.add('open');
            document.querySelector('body').classList.add('open-sidebar');
        }
    }, 800);

    // hide, then remove the intro overlay
    document.querySelector('.intro-container').addEventListener('click', function() {
        this.classList.add('hidden');
        window.setTimeout(function() {
            document.querySelector('.intro-container').remove();
        }, 800);
    });
});
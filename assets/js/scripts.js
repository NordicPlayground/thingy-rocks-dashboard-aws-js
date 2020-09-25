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


function loadScript(src, callback) {
    var s,
        r,
        t;
    r = false;
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.onload = s.onreadystatechange = function() {
        //console.log( this.readyState ); //uncomment this line to see which ready states are called.
        if (!r && (!this.readyState || this.readyState == 'complete')) {
            r = true;
            callback();
        }
    };
    t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
}

// this is getting real data
function getData() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        // console.log(this.readyState);
        if (this.readyState == 4 && this.status == 200) {

            var realData = JSON.parse(this.responseText);
            console.log(realData);
            var globe = new Globe(realData);
            return globe
        }
    };
    xmlhttp.open("GET", "getDeviceData.php", true);
    xmlhttp.send();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');



    loadScript("https://cesium.com/downloads/cesiumjs/releases/1.73/Build/Cesium/Cesium.js", getData);




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






    document.querySelector('.top-tab').addEventListener('click', function() {
        if (document.querySelector('.infobox').classList.contains('reveal')) {
            document.querySelector('.infobox').classList.remove('reveal');
        } else {
            document.querySelector('.infobox').classList.add('reveal');
        }
    })

});
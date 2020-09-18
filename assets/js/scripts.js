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




function globeBuild() {
    //replace this array with real data coming in from API
    let dataPoints = [{
            'position': Cesium.Cartesian3.fromDegrees(-122.6750, 45.5051),
            'properties': {
                'coords': '45.5051° N, 122.6750° W',
                'name': 'Portland Or',

                'data': {
                    'first number': 48.5051,
                    'string thing': '45°'
                }
            }
        },
        {
            'position': Cesium.Cartesian3.fromDegrees(-122.6750, 48.5051),
            'properties': {
                'coords': '48.5051° N, 122.6750° W',
                'name': 'Paris France',

                'data': {
                    'first thing': 2138.5555,
                    'second thing': '72%'
                }
            }
        }
    ];
    var realData = testGetData(); // this will become the data source for the globe markers

    var globe = new Globe(dataPoints);
}
// this is getting real data
function testGetData() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var realData = this.responseText;
            console.log(realData);
        }
    };
    xmlhttp.open("GET", "getDeviceData.php", true);
    xmlhttp.send();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');



    loadScript("https://cesium.com/downloads/cesiumjs/releases/1.73/Build/Cesium/Cesium.js", globeBuild);




    window.setTimeout(function() {
        document.querySelector('body').classList.add('loaded');
        document.querySelector('.sidebar').classList.add('open');
    }, 800);


    // hide, then remove the intro overlay
    document.querySelector('.intro-container').addEventListener('click', function() {
        this.classList.add('hidden');
        window.setTimeout(function() {
            document.querySelector('.intro-container').remove();
        }, 800);
    });















});
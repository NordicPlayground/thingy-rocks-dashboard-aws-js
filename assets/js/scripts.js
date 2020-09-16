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


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
    var sidebar = new Sidebar();




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














    var viewer = new Cesium.Viewer("cesiumContainer");

    function addPoint() {
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(-122.6750, 45.5051),
            point: {
                pixelSize: 10,
                color: Cesium.Color.YELLOW,
            },
        });
    }

    function setPointProperties() {
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(45.5051, 122.6750, 0),
            point: {
                show: true, // default
                color: Cesium.Color.SKYBLUE, // default: WHITE
                pixelSize: 10, // default: 1
                outlineColor: Cesium.Color.YELLOW, // default: BLACK
                outlineWidth: 3, // default: 0
            },
        });
    }

    function changePointProperties() {
        var entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
                45.5051, 122.6750, 0
            ),
            point: {
                pixelSize: 2,
            },
        });

        var point = entity.point;
        point.pixelSize = 20.0;
        point.color = Cesium.Color.YELLOW.withAlpha(0.33);
    }


});
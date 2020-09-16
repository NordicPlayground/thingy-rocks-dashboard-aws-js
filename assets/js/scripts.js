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
})




// const { Earth } = require("/assets/js/classes/miniature.earth.js");




// class ThingyWorld {
// constructor() {

// const { default: Marker }
// const { default: Sidebar }


// const sidebar = document.querySelector('.sidebar');
// const sidebarToggle = document.querySelector('.sidebar-toggle');

// sidebarToggle.addEventListener('click', toggleSidebar);


// function toggleSidebar(event) {
//     // console.log(event);
//     // var sidebar = document.querySelector('.sidebar');
//     if (event.target !== '.sidebar.open') {
//         if (sidebar.classList.contains('open')) {
//             sidebar.classList.remove('open');
//         } else {
//             sidebar.classList.add('open');
//         }
//     }
// }
////////////////////////////

/* load earth.js after the page is loaded. */

// window.addEventListener( 'load', function() {
//     var script = document.createElement( "script" );
//     script.src = "./miniature.earth.js";
//     document.body.appendChild( script );	
// } );




// window.addEventListener("earthjsload", function() {

// document.getElementById('spinner').style.display = 'none';

// var myearth = new Earth("myearth", {
//     mapImage: 'assets/img/day-by-nasa.png',
//     location: { lat: 45.6918636, lng: -124.0965785 },
//     zoom: 3,
//     zoomable: true,
//     autoRotate: true,
//     light: 'simple',
//     lightIntensity: 0.5,
//     lightAmbience: 0.5
//         /* more earth options here */
// });


// if (!myearth) return; // not supported

// myearth.markers = []; // create empty array for markers
// // myearth.addEventListener('ready', function() {

//     var marker = new Marker();
//     myearth.addImage(marker.markerSettings);
//     // var marker = myearth.addImage( {
//     //     image: 'assets/img/map-marker.svg',
//     //     imageAlphaOnly: true,
//     //     color: '#FEA512',
//     //     location : { lat: 45.6918636, lng: -124.0965785 },
//     //     hotspot: true,

//     //     /* more marker options here */
//     // } );
//     // marker.infobox = "heres some info";
//     // marker.addEventListener( 'click', function(){
//     //     markerClick( myearth, marker ) });

//     // myearth.markers.push( marker);

//     // console.log(myearth.markers);
// });




// function markerClick(myearth, marker) {
//     // console.log(myearth);
//     // console.log(marker);
//     myearth.goTo(marker.location);
//     myearth.autoRotate = false;

//     var color = marker.color == '#65CDF5' ? '#FEA512' : '#65CDF5';
//     var scale = marker.scale == '1' ? '1.25' : '1';
//     marker.remove();
//     var newmarker = myearth.addImage({
//         image: 'assets/img/map-marker.svg',
//         imageAlphaOnly: true,
//         color: 'color',
//         location: { lat: 45.6918636, lng: -124.0965785 },
//         hotspot: true
//             /* more marker options here */
//     });

//     newmarker.addEventListener('click', function() {
//         markerClick(myearth, newmarker)
//     });
// }

// })
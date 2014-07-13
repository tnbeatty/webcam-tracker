/*
 * main.js
 *
 * by Nate Beatty <nate.beatty@gmail.com>
 *
 *
 */

// GLOBAL VARIABLES

var video = document.querySelector("video"),
    canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d");
var pixels; // The array of pixels for each frame
var timeoutms = 200; // Redraw timeout in ms.
var vidheight = 360,
    vidwidth = 640;

var targetImage = new Image();
targetImage.src = "img/target.png";

// CALLBACKS

var errorCallback = function(e) {
    console.log('Error: ', e);
};

// HELPER FUNCTIONS

// VIDEO RENDERING

function draw() {
    var width = vidwidth,
        height = vidheight;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, width, height);

    pixels = context.getImageData(0, 0, width, height);

    var heatmap = createHeatmap(pixels, width, height);
    // var targetxy = findTarget(heatmap, width, height);

    context.putImageData(pixels, 0, 0); // Remove targets from fram
    // context.drawImage(targetImage,targetxy[0],targetxy[1]);

    setTimeout(draw, timeoutms);
}

Modernizr.load([
    {
        test: Modernizr.webworkers,
        yep: ['js/parallel.js', 'js/lib.performance.js'],
        nope: ['js/lib.oldie.js']
    },
    // { load: 'js/lib.oldie.js' }
    ]);

if (Modernizr.getusermedia) {
    var gUM = Modernizr.prefixed('getUserMedia', navigator);
    gUM({
        video: {
            mandatory: {
                maxWidth: vidwidth,
                maxHeight: vidheight
            }
        }
    }, function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
        setTimeout(draw, timeoutms);
    }, errorCallback);
} else {
    alert('Unsupported function: getUserMedia(). Please update your browser.');
}

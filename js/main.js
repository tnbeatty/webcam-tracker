/*
 * main.js
 *
 * by Nate Beatty <nate.beatty@gmail.com>
 */

// GLOBAL VARIABLES

var video = document.createElement('video');
var cnvs = document.querySelector('#canvas'),
    context = cnvs.getContext('2d');
var cnvsEff = document.querySelector('#canvasEffect'),
    contextEffect = cnvsEff.getContext('2d');
var timeoutms = 100; // Redraw timeout in ms.
var height = 360,
    width = 640;
var processor = new Worker('js/lib.performance.js');

// Webworker setup
processor.onmessage = function(e) {
    contextEffect.putImageData(event.data.dstData, 0, 0);
}

var targetImage = new Image();
targetImage.src = "img/target.png";

var targetxy = [];

// CALLBACKS

var errorCallback = function(e) {
    console.log('Error: ', e);
};

// VIDEO RENDERING

var draw = function() {
    context.drawImage(video, 0, 0, width, height);
    var pixels = context.getImageData(0, 0, width, height);

    processor.postMessage({
        imageData: pixels
    });
}

if (Modernizr.getusermedia) {
    var gUM = Modernizr.prefixed('getUserMedia', navigator);
    gUM({
        video: {
            mandatory: {
                maxWidth: width,
                maxHeight: height
            }
        },
        audio: false
    }, function(stream) {
        video.src = URL.createObjectURL(stream);
        video.play();
        setInterval(draw, timeoutms);
    }, errorCallback);
} else {
    alert('Unsupported function: getUserMedia(). Please update your browser.');
}

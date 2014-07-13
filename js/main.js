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
var timeoutms = 50; // Redraw timeout in ms.
var vidheight = 360,
    vidwidth = 640;

var targetImage = new Image();
targetImage.src = "img/target.png";

var targetxy = [];

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
    targetxy = findTarget(heatmap, width, height);

    context.putImageData(pixels, 0, 0); // Remove targets from fram
    context.drawImage(targetImage, targetxy[0], targetxy[1]);

    setTimeout(draw, timeoutms);
}

Modernizr.load([{
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

// Three.JS Animation

var camera, scene, renderer;
var cube;

var threeCanvasHeight = $('#three-canvas').height();
var threeCanvasWidth = $('#three-canvas').width();
var aspect = threeCanvasWidth / threeCanvasHeight;

function init() {
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(threeCanvasWidth, threeCanvasHeight);
    document.getElementById('three-canvas').appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    camera.position.z = 200;

    scene = new THREE.Scene();

    var cubesize = 75;
    cube = new THREE.Mesh(new THREE.BoxGeometry(cubesize, cubesize, cubesize), new THREE.MeshNormalMaterial());
    cube.overdraw = true;
    scene.add(cube);

    animate();
}

function animate() {
    cube.rotation.y = (targetxy[0] / vidwidth) * 2 * Math.PI;
    cube.rotation.x = (targetxy[1] / vidwidth) * 2 * Math.PI;

    // render
    renderer.render(scene, camera);
    requestAnimationFrame(function() {
        animate();
    });
}

$(function() {
    init();
});

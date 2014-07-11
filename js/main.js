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
var timeoutms = 20; // Redraw timeout in ms.
var vidheight = 360,
    vidwidth = 640;

// CALLBACKS

var errorCallback = function(e) {
    console.log('Error: ', e);
};

// HELPER FUNCTIONS

/*
 * rgb2hsl(r, g, b);
 *
 * Converts RGB colors to HSL colors.
 *
 * Code poached from a StackOverflow answer here:
 * http://stackoverflow.com/a/2348659
 *
 */
function rgb2hsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

// VIDEO RENDERING

function draw() {
    var width = vidwidth,
        height = vidheight;

    context.drawImage(video, 0, 0, width, height);

    pixels = context.getImageData(0, 0, width, height);
    var len = pixels.data.length / 4; // Each pixel point is RGBA, so total length is len/4

    var pxmap = new Array(width);
    var heatmap = new Array(width);
    for (var i = 0; i < width; i++) {
        pxmap[i] = new Array(height);
        heatmap[i] = new Array(height);
    }
    for (var i = 0; i < len; i++) {
        var index = i * 4; // Account for our len calculation (RGBA vals)
        var r = pixels.data[index],
            g = pixels.data[index + 1],
            b = pixels.data[index + 2],
            a = pixels.data[index + 3];

        var hsl = rgb2hsl(r, g, b),
            ha = hsl[0],
            s = hsl[1],
            l = hsl[2];

        var left = Math.floor(i % width);
        var top = Math.floor(i / width);

        if (ha >= 190 && ha <= 250 &&
            s >= 25 && s <= 90 &&
            l >= 30 && l <= 95) {

            pixels.data[i * 4 + 3] = 0;
            pxmap[left][top] = 1;
        } else {
            pxmap[left][top] = 0;
        }
    }

    // Create heatmap
    for (var j = 5; j < height - 5; j++) {
        for (var i = 5; i < width - 5; i++) {
            var l5 = pxmap[i - 5][j],
                l4 = pxmap[i - 4][j],
                l3 = pxmap[i - 3][j],
                l2 = pxmap[i - 2][j],
                l1 = pxmap[i - 1][j],
                r1 = pxmap[i + 1][j],
                r2 = pxmap[i + 2][j],
                r3 = pxmap[i + 3][j],
                r4 = pxmap[i + 4][j],
                r5 = pxmap[i + 5][j],
                u5 = pxmap[i][j - 5],
                u4 = pxmap[i][j - 4],
                u3 = pxmap[i][j - 3],
                u2 = pxmap[i][j - 2],
                u1 = pxmap[i][j - 1],
                d1 = pxmap[i][j + 1],
                d2 = pxmap[i][j + 1],
                d3 = pxmap[i][j + 1],
                d4 = pxmap[i][j + 1],
                d5 = pxmap[i][j + 1],
                self = pxmap[i][j];
            heatmap[i][j] = l5 + l4 + l3 + l2 + l1 + r1 + r2 + r3 + r4 + r5 +
                u5 + u4 + u3 + u2 + u1 + d1 + d2 + d3 + d4 + d5 + self;
        }
    }

    var targetx = 0;
    var targety = 0;
    var targetscore = 0;
    for (var i = 5; i < width - 5; i++) {
        for (var j = 5; j < height - 5; j++) {
            if (heatmap[i][j] > targetscore) {
                targetx = i,
                targety = j;
                targetscore = heatmap[i][j];
            }
        }
    }

// context.fillStyle = "#FF0000";
// context.fillRect(0,0,150,75);
    // hl.style.left = "" + Math.floor(document.width * (targetx / width)) + "px";
    // hl.style.top = "" + Math.floor(document.height * (targety / height)) + "px";
    context.putImageData(pixels, 0, 0); // Remove targets from fram

    setTimeout(draw, timeoutms);
}

navigator.webkitGetUserMedia({
        video: {
            mandatory: {
                maxWidth: vidwidth,
                maxHeight: vidheight
            }
        }
    },
    function(localMediaStream) {
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();
        setTimeout(draw, timeoutms);
    }, errorCallback);

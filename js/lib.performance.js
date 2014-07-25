/*
 * lib.performance.js
 *
 * by Nate Beatty <nate.beatty@gmail.com>
 *
 * Assume that the parallel.js lib is loaded.
 */

 var width = 640,
    height = 360;

Array.prototype.chunk = function(chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize)
        R.push(this.slice(i, i + chunkSize));
    return R;
}

/*!
 * Converts RGB colors to HSL colors.
 *
 * Code poached from a StackOverflow answer here:
 * http://stackoverflow.com/a/2348659
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

// webworker message receiver
onmessage = function(e) {
	var pixels = e.data.imageData;

    var len = pixels.data.length / 4; // Each pixel point is RGBA, so total length is len/4
    var pxmap = []; // A map of all of the blue pixels
    var heatmap = new Array(width); // A heatmap of blue pixel density
    //
    // // Create the empty maps
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

        // Find pixel position
        var left = Math.floor(i % width);
        var top = Math.floor(i / width);

        // Determine color match
        if (ha >= 170 && ha <= 210 &&
            s >= 25 && s <= 100 &&
            l >= 30 && l <= 80) {

            pixels.data[i * 4 + 3] = 0; // Make the blue pixel transparent
            pxmap[left][top] = 1;
        } else {
            pxmap[left][top] = 0;
        }
    }

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

	postMessage({
		dstData: pixels
	});
};
